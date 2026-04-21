import * as fs from "fs";
import * as path from "path";
import * as xlsx from "xlsx";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inventoryDir = path.resolve(__dirname, "../Campus Inventory");
const outputFile = path.resolve(__dirname, "ingest.sql");

function generateCode(division: string, description: string): string {
  const d1 = (division || "X").charAt(0).toUpperCase();
  const d2 = (description || "X").charAt(0).toUpperCase();
  const random = Math.floor(100 + Math.random() * 900); // 3 digit number
  return `${d1}${d2}${random}`;
}

async function main() {
  const files = ["Centurion.xlsx", "Krugersdorp.xlsx", "Lanseria.xlsx", "Office.xlsx"];
  let sql = `
-- Auto-generated SQL for asset ingestion
-- This script will safely insert records into the assets table.
-- It assumes all divisions and locations already exist in the database.

DO $$
DECLARE
    dept_id UUID;
    type_id UUID;
    current_asset_code TEXT;
BEGIN
`;

  for (const fileName of files) {
    const filePath = path.join(inventoryDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      continue;
    }

    const buf = fs.readFileSync(filePath);
    const workbook = xlsx.read(buf, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json<any>(sheet, { header: 1 });
    
    // Skip header row
    const rows = data.slice(1);

    for (const row of rows) {
      if (!row || row.length === 0) continue;
      
      const division = String(row[0] || "").trim();
      const description = String(row[1] || "").trim();
      const serialNumber = String(row[2] || "").trim().replace(/'/g, "''");
      let locationName = String(row[3] || "").trim();

      if (!division && !description) continue;
      if (!locationName) {
        locationName = path.basename(fileName, path.extname(fileName));
      }

      const assetName = (description || division || "Unknown Asset").replace(/'/g, "''");
      const safeDescription = description.replace(/'/g, "''");
      const code = generateCode(division, description);

      sql += `
    -- Insert Asset: ${code}
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE '${locationName.replace(/'/g, "''")}';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE '${division.replace(/'/g, "''")}';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('${code}', '${assetName}', '${safeDescription}', ${serialNumber ? `'${serialNumber}'` : 'NULL'}, dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', '${code}';
    END IF;
`;
    }
  }

  sql += `
END $$;
`;

  fs.writeFileSync(outputFile, sql);
  console.log(`Successfully generated SQL script at ${outputFile}`);
}

main().catch(console.error);
