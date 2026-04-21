import * as fs from "fs";
import * as path from "path";
import * as xlsx from "xlsx";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";

import * as dotenv from "dotenv";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

if (!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("WARNING: VITE_SUPABASE_SERVICE_ROLE_KEY is missing. Row Level Security (RLS) might block inserts. Please add it to your .env file.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

const inventoryDir = path.resolve(__dirname, "../Campus Inventory");

async function getOrCreateDepartment(name: string): Promise<string> {
  const { data: existing, error: findError } = await supabase
    .from("departments")
    .select("id")
    .ilike("name", name)
    .single();

  if (existing?.id) return existing.id;

  const code = name.substring(0, 1).toUpperCase();
  const { data: inserted, error: insertError } = await supabase
    .from("departments")
    .insert({ name, code, is_storage: false })
    .select("id")
    .single();

  if (insertError) throw insertError;
  return inserted.id;
}

async function getOrCreateItemType(name: string): Promise<string> {
  const { data: existing, error: findError } = await supabase
    .from("item_types")
    .select("id")
    .ilike("name", name)
    .single();

  if (existing?.id) return existing.id;

  const code = name.substring(0, 1).toUpperCase();
  const { data: inserted, error: insertError } = await supabase
    .from("item_types")
    .insert({ name, code })
    .select("id")
    .single();

  if (insertError) throw insertError;
  return inserted.id;
}

function generateCode(division: string, description: string): string {
  const d1 = (division || "X").charAt(0).toUpperCase();
  const d2 = (description || "X").charAt(0).toUpperCase();
  const random = Math.floor(100 + Math.random() * 900); // 3 digit number
  return `${d1}${d2}${random}`;
}

async function ingestFile(fileName: string) {
  const filePath = path.join(inventoryDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  console.log(`\nProcessing ${fileName}...`);
  const buf = fs.readFileSync(filePath);
  const workbook = xlsx.read(buf, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // Assuming the headers are implicitly in row 1, or we just read by arrays
  const data = xlsx.utils.sheet_to_json<any>(sheet, { header: 1 });
  
  // Skip header row if it contains text like "division"
  const rows = data.slice(1);

  let successCount = 0;
  let failCount = 0;

  for (const row of rows) {
    if (!row || row.length === 0) continue;
    
    // Columb 1: Devision 2: Discription 3: Serial Number 4: Location
    const division = String(row[0] || "").trim();
    const description = String(row[1] || "").trim();
    const serialNumber = String(row[2] || "").trim();
    let locationName = String(row[3] || "").trim();

    // Skip empty rows
    if (!division && !description) continue;

    // If location is blank, fallback to the filename without extension
    if (!locationName) {
      locationName = path.basename(fileName, path.extname(fileName));
    }

    try {
      const departmentId = await getOrCreateDepartment(locationName);
      const itemTypeId = division ? await getOrCreateItemType(division) : await getOrCreateItemType("Uncategorized");
      
      const code = generateCode(division, description);
      
      // We will use 'name' for the asset. Let's use the division + short desc as name if not provided.
      const assetName = description || division || "Unknown Asset";

      const { error } = await supabase.from("assets").insert({
        code: code,
        name: assetName.substring(0, 255), // limit length
        description: description,
        serial_number: serialNumber || null,
        department_id: departmentId,
        item_type_id: itemTypeId,
        status: "available",
        current_location_id: departmentId
      });

      if (error) {
        console.error(`Failed to insert asset: ${code} - ${error.message}`);
        failCount++;
      } else {
        successCount++;
      }
    } catch (err: any) {
      console.error(`Error processing row: ${err.message}`);
      failCount++;
    }
  }

  console.log(`Finished ${fileName}: ${successCount} inserted, ${failCount} failed.`);
}

async function main() {
  const files = ["Centurion.xlsx", "Krugersdorp.xlsx", "Lanseria.xlsx", "Office.xlsx"];
  for (const file of files) {
    await ingestFile(file);
  }
  console.log("\nIngestion complete.");
}

main().catch(console.error);
