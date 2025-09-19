import * as XLSX from 'xlsx';
import { Company, Stand } from '@/types/crm';

// Helper to find a key in a row, trying common variations
const findValue = (row: any, possibleKeys: string[]): string | undefined => {
  for (const key of possibleKeys) {
    // Try exact match
    if (row[key] !== undefined && row[key] !== null) return String(row[key]);
    // Try trimmed match
    const trimmedKey = key.trim();
    if (row[trimmedKey] !== undefined && row[trimmedKey] !== null) return String(row[trimmedKey]);
    // Try lowercase match
    const lowerKey = key.toLowerCase();
    if (row[lowerKey] !== undefined && row[lowerKey] !== null) return String(row[lowerKey]);
    // Try lowercase and trimmed match
    const lowerTrimmedKey = key.toLowerCase().trim();
    if (row[lowerTrimmedKey] !== undefined && row[lowerTrimmedKey] !== null) return String(row[lowerTrimmedKey]);
    // Try replacing spaces with underscores
    const snakeCaseKey = key.replace(/\s/g, '_');
    if (row[snakeCaseKey] !== undefined && row[snakeCaseKey] !== null) return String(row[snakeCaseKey]);
    // Try replacing underscores with spaces
    const spaceCaseKey = key.replace(/_/g, ' ');
    if (row[spaceCaseKey] !== undefined && row[spaceCaseKey] !== null) return String(row[spaceCaseKey]);
    // Try PascalCase (e.g., "StandId")
    const pascalCaseKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase()).replace(/^./, (g) => g.toUpperCase());
    if (row[pascalCaseKey] !== undefined && row[pascalCaseKey] !== null) return String(row[pascalCaseKey]);
  }
  return undefined; // If no key found
};

export const parseStandsExcel = async (filePath: string): Promise<Company[]> => {
  const response = await fetch(filePath);
  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const json: any[] = XLSX.utils.sheet_to_json(worksheet);

  const companiesMap = new Map<string, Company>();

  json.forEach((row: any) => {
    const companyId = findValue(row, ['Company_id', 'Company ID', 'CompanyID']) || '';
    const companyName = findValue(row, ['Company']) || ''; // Mapeado para 'Company'
    const companyNIF = findValue(row, ['NIF']) || ''; // Mapeado para 'NIF'
    const companyPersonEmail = findValue(row, ['Company Person Email', 'CompanyPersonEmail']) || ''; // Mapeado para 'Company Person Email'
    const companyPerson = findValue(row, ['Company Person', 'CompanyPerson']) || ''; // Mapeado para 'Company Person'

    const stand: Stand = {
      Stand_ID: findValue(row, ['Stand_ID', 'Stand ID', 'StandID']) || '',
      Company_id: companyId,
      Company_Name: companyName,
      NIF: companyNIF,
      Address: findValue(row, ['Stand Address', 'StandAddress']) || '', // Mapeado para 'Stand Address'
      City: findValue(row, ['Stand City', 'StandCity']) || '', // Mapeado para 'Stand City'
      Postal_Code: findValue(row, ['Stand Postal Code', 'StandPostalCode']) || '', // Mapeado para 'Stand Postal Code'
      Phone: findValue(row, ['Stand_Phone', 'Stand Phone', 'StandPhone']) || '', // Mapeado para 'Stand_Phone'
      Email: findValue(row, ['Stand Email', 'StandEmail']) || '', // Mapeado para 'Stand Email'
      Contact_Person: findValue(row, ['Contact_Person', 'Contact Person', 'ContactPerson']) || '', // Mantido para contacto do stand
    };

    // Only process if Company_id is not empty
    if (stand.Company_id) {
      if (!companiesMap.has(stand.Company_id)) {
        companiesMap.set(stand.Company_id, {
          Company_id: companyId,
          Company_Name: companyName,
          NIF: companyNIF,
          Company_Email: companyPersonEmail,
          Company_Contact_Person: companyPerson,
          stands: [],
        });
      }
      companiesMap.get(stand.Company_id)?.stands.push(stand);
    }
  });

  return Array.from(companiesMap.values());
};