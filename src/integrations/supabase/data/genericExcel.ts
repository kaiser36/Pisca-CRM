import { supabase } from '../client';

// Helper to find a key in a row, trying common variations
const findValueInRowData = (rowData: Record<string, any>, possibleKeys: string[]): string | undefined => {
  for (const key of possibleKeys) {
    // Try exact match
    if (rowData[key] !== undefined && rowData[key] !== null) return String(rowData[key]);
    // Try trimmed match
    const trimmedKey = key.trim();
    if (rowData[trimmedKey] !== undefined && rowData[trimmedKey] !== null) return String(rowData[trimmedKey]);
    // Try lowercase match
    const lowerKey = key.toLowerCase();
    if (rowData[lowerKey] !== undefined && rowData[lowerKey] !== null) return String(rowData[lowerKey]);
    // Try lowercase and trimmed match
    const lowerTrimmedKey = key.toLowerCase().trim();
    if (rowData[lowerTrimmedKey] !== undefined && rowData[lowerTrimmedKey] !== null) return String(rowData[lowerTrimmedKey]);
    // Try replacing spaces with underscores
    const snakeCaseKey = key.replace(/\s/g, '_');
    if (rowData[snakeCaseKey] !== undefined && rowData[snakeCaseKey] !== null) return String(rowData[snakeCaseKey]);
    // Try replacing underscores with spaces
    const spaceCaseKey = key.replace(/_/g, ' ');
    if (rowData[spaceCaseKey] !== undefined && rowData[spaceCaseKey] !== null) return String(rowData[spaceCaseKey]);
    // Try PascalCase (e.g., "StandId")
    const pascalCaseKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase()).replace(/^./, (g) => g.toUpperCase());
    if (rowData[pascalCaseKey] !== undefined && rowData[pascalCaseKey] !== null) return String(rowData[pascalCaseKey]);
  }
  return undefined; // If no key found
};

// Upserts generic Excel data for a user
export async function upsertGenericExcelData(
  userId: string,
  fileName: string,
  data: Record<string, any>[]
): Promise<void> {
  // First, delete any existing data for this user and file name
  const { error: deleteError } = await supabase
    .from('generic_excel_data')
    .delete()
    .eq('user_id', userId)
    .eq('file_name', fileName);

  if (deleteError) {
    console.error('Error deleting existing generic Excel data:', deleteError);
    throw new Error(deleteError.message);
  }

  // Prepare data for insertion
  const insertData = data.map(row => ({
    user_id: userId,
    file_name: fileName,
    row_data: row, // Store the entire row as a JSONB object
  }));

  // Insert new data
  const { error: insertError } = await supabase
    .from('generic_excel_data')
    .insert(insertData);

  if (insertError) {
    console.error('Error inserting generic Excel data:', insertError);
    throw new Error(insertError.message);
  }
}

// Fetches generic Excel data for the current authenticated user
export async function fetchGenericExcelData(userId: string): Promise<{ file_name: string; row_data: Record<string, any>; company_id_from_excel: string }[]> {
  const { data, error } = await supabase
    .from('generic_excel_data')
    .select('file_name, row_data');

  if (error) {
    console.error('Error fetching generic Excel data:', error);
    throw new Error(error.message);
  }

  // Extract Company_id from row_data for each entry
  return data.map(item => ({
    file_name: item.file_name,
    row_data: item.row_data,
    company_id_from_excel: findValueInRowData(item.row_data, ['Company_id', 'Company ID', 'CompanyID']) || '',
  }));
}