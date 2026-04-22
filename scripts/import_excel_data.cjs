const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Custom logic for Option C unique codes
function generateAssetCode(division, description, index) {
  const d1 = division ? division.trim().charAt(0).toUpperCase() : 'X';
  const d2 = description ? description.trim().charAt(0).toUpperCase() : 'X';
  const num = String(index).padStart(3, '0');
  return `${d1}${d2}${num}`;
}

async function run() {
  console.log("Authenticating as admin...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'barend@encounterchurch.co.za',
    password: 'Matrix2026!'
  });

  if (authError) {
    console.error("Auth error:", authError.message);
    process.exit(1);
  }
  console.log("Successfully authenticated.");

  const inventoryDir = path.join(process.cwd(), 'Campus Inventory');
  const files = ['Centurion.xlsx', 'Krugersdorp.xlsx', 'Lanseria.xlsx', 'Office.xlsx'];

  // Keep track of department and item type IDs to avoid repeated lookups
  const departmentCache = {};
  const itemTypeCache = {};

  let globalSequence = 1;

  for (const filename of files) {
    const filePath = path.join(inventoryDir, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found, skipping: ${filename}`);
      continue;
    }

    console.log(`\nProcessing file: ${filename}`);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Read raw data
    const rawData = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    for (const row of rawData) {
      // Normalize keys by trimming spaces
      const normalizedRow = {};
      for (const [key, val] of Object.entries(row)) {
         normalizedRow[key.trim()] = val;
      }

      const division = normalizedRow['DEVISION'] || 'General';
      const description = normalizedRow['DESCRIPTION'] || 'No Description';
      const serialNumber = normalizedRow['Serial Number'] || null;
      const locationName = normalizedRow['Location'] || path.parse(filename).name;

      // 1. Find or create department
      if (!departmentCache[locationName]) {
        // Find existing
        let { data: deps } = await supabase.from('departments').select('id').eq('name', locationName);
        if (deps && deps.length > 0) {
          departmentCache[locationName] = deps[0].id;
        } else {
          // Create new
          const code = locationName.substring(0, 3).toUpperCase();
          const { data: newDep, error: depError } = await supabase.from('departments').insert({
            name: locationName,
            code: code,
            is_storage: false
          }).select().single();

          if (depError) {
             console.error("Error creating department:", depError);
             continue;
          }
          departmentCache[locationName] = newDep.id;
        }
      }

      // 2. Find or create item_type
      if (!itemTypeCache[division]) {
        let { data: types } = await supabase.from('item_types').select('id').eq('name', division);
        if (types && types.length > 0) {
          itemTypeCache[division] = types[0].id;
        } else {
          const code = division.substring(0, 3).toUpperCase();
          const { data: newType, error: typeError } = await supabase.from('item_types').insert({
            name: division,
            code: code
          }).select().single();

          if (typeError) {
             console.error("Error creating item_type:", typeError);
             continue;
          }
          itemTypeCache[division] = newType.id;
        }
      }

      const departmentId = departmentCache[locationName];
      const itemTypeId = itemTypeCache[division];

      // 3. Generate unique code
      const uniqueCode = generateAssetCode(division, description, globalSequence++);

      // 4. Insert Asset
      const { error: insertError } = await supabase.from('assets').insert({
        code: uniqueCode,
        name: description.substring(0, 50), // Fallback name
        description: description,
        serial_number: serialNumber,
        department_id: departmentId,
        item_type_id: itemTypeId,
        status: 'available'
      });

      if (insertError) {
        console.error(`Error inserting asset ${uniqueCode}:`, insertError.message);
      } else {
        console.log(`Inserted asset: ${uniqueCode} - ${description}`);
      }
    }
  }

  console.log("\nData import complete!");
}

run().catch(console.error);
