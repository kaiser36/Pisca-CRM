import { supabase } from '../client';
import { CompanyAdditionalExcelData } from '@/types/crm';

/**
 * Upserts specific company additional Excel data into the company_additional_excel_data table.
 * This function now operates independently of the 'companies' table, as requested.
 */
export async function upsertCompanyAdditionalExcelData(data: CompanyAdditionalExcelData[], userId: string): Promise<void> {
  const uniqueDataMap = new Map<string, CompanyAdditionalExcelData>();

  // Fetch company_db_ids for all unique excel_company_ids in the batch
  const uniqueExcelCompanyIds: string[] = Array.from(new Set(data.map(row => row.excel_company_id)));
  const { data: companies, error: companyError } = await supabase
    .from('companies')
    .select('id, company_id')
    .eq('user_id', userId)
    .in('company_id', uniqueExcelCompanyIds);

  if (companyError) {
    console.error('Error fetching company IDs for upserting additional company data:', companyError);
    throw new Error(companyError.message);
  }

  const companyIdMap = new Map<string, string>();
  companies.forEach(company => companyIdMap.set(company.company_id, company.id));

  data.forEach(row => {
    const companyDbId = companyIdMap.get(row.excel_company_id);
    if (!companyDbId) {
      console.warn(`Company DB ID not found for excel_company_id: ${row.excel_company_id}. Skipping additional company data.`);
      return; // Skip rows that cannot be linked
    }

    const key = `${row.excel_company_id}-${userId}`; // Unique key for deduplication
    uniqueDataMap.set(key, {
      ...row,
      user_id: userId, // Ensure user_id is correctly set
      company_db_id: companyDbId, // NEW: Populate company_db_id
      created_at: row.created_at || new Date().toISOString(), // Set created_at if not present
    });
  });

  const dataToUpsert = Array.from(uniqueDataMap.values());

  if (dataToUpsert.length === 0) {
    return;
  }

  const { error } = await supabase
    .from('company_additional_excel_data')
    .upsert(dataToUpsert, { onConflict: 'excel_company_id, user_id' });

  if (error) {
    console.error('Error upserting additional company data:', error);
    throw new Error(error.message);
  }
}

/**
 * Searches for additional company Excel data for a global search component.
 * Returns a limited number of results for performance.
 */
export async function searchCompanyAdditionalExcelData(
  userId: string,
  searchTerm: string
): Promise<CompanyAdditionalExcelData[]> {
  if (!searchTerm.trim() || !userId) {
    return [];
  }

  // RLS will handle the user_id check, so we don't need to add it here.
  let query = supabase
    .from('company_additional_excel_data')
    .select('excel_company_id, "Nome Comercial"');

  const searchPattern = `%${searchTerm.toLowerCase()}%`;
  query = query.or(
    `"Nome Comercial".ilike.${searchPattern},excel_company_id.ilike.${searchPattern}`
  ).limit(10);

  const { data, error } = await query;

  if (error) {
    console.error('Error searching additional company excel data:', error);
    // Don't throw, just return empty array for a better UX
    return [];
  }

  return data as CompanyAdditionalExcelData[];
}

/**
 * Fetches additional company Excel data for the current authenticated user with pagination and search.
 */
export async function fetchCompanyAdditionalExcelData(
  userId: string,
  page: number,
  pageSize: number,
  searchTerm: string = '' // Adicionado searchTerm
): Promise<{ data: CompanyAdditionalExcelData[]; totalCount: number }> {
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('company_additional_excel_data')
    .select('*', { count: 'exact' }); // Request count here
    // REMOVED: .eq('user_id', userId); // This filter is now handled by RLS policy

  // Apply search filter if searchTerm is provided
  if (searchTerm) {
    const searchPattern = `%${searchTerm.toLowerCase()}%`;
    query = query.or(
      `"Nome Comercial".ilike.${searchPattern},excel_company_id.ilike.${searchPattern},"Email da empresa".ilike.${searchPattern}`
    );
  }

  // Execute the query once, fetching both data and count with range
  const { data, error, count } = await query
    .range(offset, offset + pageSize - 1); // Supabase range is inclusive

  if (error) {
    console.error('Error fetching paginated additional company excel data:', error);
    throw new Error(error.message);
  }

  console.log(`Fetched ${data?.length || 0} additional company records for user ${userId}, page ${page}, total ${count}`);
  return { data: data as CompanyAdditionalExcelData[], totalCount: count || 0 };
}