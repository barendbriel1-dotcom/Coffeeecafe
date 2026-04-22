const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Logic for Option C unique codes
function generateAssetCode(division, description, index) {
  const d1 = division ? division.trim().charAt(0).toUpperCase() : 'X';
  const d2 = description ? description.trim().charAt(0).toUpperCase() : 'X';
  const num = String(index).padStart(3, '0');
  return `${d1}${d2}${num}`;
}

// Function to escape CSV values
function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  // If the string contains quotes, commas, or newlines, enclose in quotes and double internal quotes
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function run() {
  const inventoryDir = path.join(process.cwd(), 'Campus Inventory');
  const files = ['Centurion.xlsx', 'Krugersdorp.xlsx', 'Lanseria.xlsx', 'Office.xlsx'];

  const csvRows = [];
  // CSV Headers
  csvRows.push(['Asset Code', 'Division', 'Description', 'Serial Number', 'Location'].map(escapeCsv).join(','));

  let globalSequence = 1;

  for (const filename of files) {
    const filePath = path.join(inventoryDir, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filename}`);
      continue;
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    for (const row of rawData) {
      const normalizedRow = {};
      for (const [key, val] of Object.entries(row)) {
         normalizedRow[key.trim()] = val;
      }

      const division = normalizedRow['DEVISION'] || 'General';
      const description = normalizedRow['DESCRIPTION'] || 'No Description';
      const serialNumber = normalizedRow['Serial Number'] || '';
      const locationName = normalizedRow['Location'] || path.parse(filename).name;

      const uniqueCode = generateAssetCode(division, description, globalSequence++);
      
      const csvRow = [
        uniqueCode,
        division,
        description,
        serialNumber,
        locationName
      ].map(escapeCsv).join(',');

      csvRows.push(csvRow);
    }
  }

  const outPath = path.join(process.cwd(), 'combined_inventory.csv');
  fs.writeFileSync(outPath, csvRows.join('\n'));
  console.log(`\nGenerated CSV file: ${outPath}`);
}

run().catch(console.error);
