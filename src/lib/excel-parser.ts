import * as XLSX from 'xlsx';
import { Company, Stand } from '@/types/crm';

export const parseStandsExcel = async (filePath: string): Promise<Company[]> => {
  const response = await fetch(filePath);
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const json: any[] = XLSX.utils.sheet_to_json(worksheet);

  const companiesMap = new Map<string, Company>();

  json.forEach((row: any) => {
    const stand: Stand = {
      Stand_ID: String(row['Stand_ID']),
      Company_id: String(row['Company_id']),
      Company_Name: String(row['Company_Name']),
      Address: String(row['Address']),
      City: String(row['City']),
      Postal_Code: String(row['Postal_Code']),
      Phone: String(row['Phone']),
      Email: String(row['Email']),
      Contact_Person: String(row['Contact_Person']),
      // Map other columns as needed
    };

    if (!companiesMap.has(stand.Company_id)) {
      companiesMap.set(stand.Company_id, {
        Company_id: stand.Company_id,
        Company_Name: stand.Company_Name,
        stands: [],
      });
    }
    companiesMap.get(stand.Company_id)?.stands.push(stand);
  });

  return Array.from(companiesMap.values());
};