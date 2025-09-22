import { supabase } from '../client';
import { CompanyAdditionalExcelData } from '@/types/crm';

/**
 * Upserts specific company additional Excel data into the company_additional_excel_data table.
 * This function now operates independently of the 'companies' table, as requested.
 */
export async function upsertCompanyAdditionalExcelData(data: CompanyAdditionalExcelData[], userId: string): Promise<void> {
  for (const row of data) {
    console.log(`Processing excel_company_id: ${row.excel_company_id} for user: ${userId}`);

    const { data: existingRecord, error: fetchError } = await supabase
      .from('company_additional_excel_data')
      .select('id')
      .eq('excel_company_id', row.excel_company_id)
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means "no rows found"
      console.error(`Error fetching existing additional company data for excel_company_id ${row.excel_company_id}:`, fetchError);
      throw new Error(fetchError.message);
    }

    const dataToInsertOrUpdate = {
      user_id: userId,
      excel_company_id: row.excel_company_id,
      "Nome Comercial": row["Nome Comercial"],
      "Email da empresa": row["Email da empresa"],
      "STAND_POSTAL_CODE": row["STAND_POSTAL_CODE"],
      "Distrito": row["Distrito"],
      "Cidade": row["Cidade"],
      "Morada": row["Morada"],
      "AM_OLD": row["AM_OLD"],
      "AM": row["AM"],
      "Stock STV": row["Stock STV"],
      "API": row["API"],
      "Site": row["Site"],
      "Stock na empresa": row["Stock na empresa"],
      "Logotipo": row["Logotipo"],
      "Classificação": row["Classificação"],
      "Percentagem de Importados": row["Percentagem de Importados"],
      "Onde compra as viaturas": row["Onde compra as viaturas"],
      "Concorrencia": row["Concorrencia"],
      "Investimento redes sociais": row["Investimento redes sociais"],
      "Investimento em portais": row["Investimento em portais"],
      "Mercado b2b": row["Mercado b2b"],
      "Utiliza CRM": row["Utiliza CRM"],
      "Qual o CRM": row["Qual o CRM"],
      "Plano Indicado": row["Plano Indicado"],
      "Mediador de credito": row["Mediador de credito"],
      "Link do Banco de Portugal": row["Link do Banco de Portugal"],
      "Financeiras com acordo": row["Financeiras com acordo"],
      "Data ultima visita": row["Data ultima visita"],
      "Grupo": row["Grupo"],
      "Marcas representadas": row["Marcas representadas"],
      "Tipo de empresa": row["Tipo de empresa"],
      "Quer CT": row["Quer CT"],
      "Quer ser parceiro Credibom": row["Quer ser parceiro Credibom"],
      "Autobiz": row["Autobiz"],
      created_at: new Date().toISOString(),
    };

    if (existingRecord) {
      console.log(`Updating existing record for excel_company_id: ${row.excel_company_id}, id: ${existingRecord.id}`);
      // Update existing record
      const { error } = await supabase
        .from('company_additional_excel_data')
        .update(dataToInsertOrUpdate)
        .eq('id', existingRecord.id);
      if (error) {
        console.error(`Error updating additional company data for company_id ${row.excel_company_id}:`, error);
        throw new Error(error.message);
      }
    } else {
      console.log(`Inserting new record for excel_company_id: ${row.excel_company_id}`);
      // Insert new record
      const { error } = await supabase
        .from('company_additional_excel_data')
        .insert(dataToInsertOrUpdate);
      if (error) {
        console.error(`Error inserting additional company data for company_id ${row.excel_company_id}:`, error);
        throw new Error(error.message);
      }
    }
  }
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
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  // Apply search filter if searchTerm is provided
  if (searchTerm) {
    const searchPattern = `%${searchTerm.toLowerCase()}%`;
    query = query.or(
      `"Nome Comercial".ilike.${searchPattern},excel_company_id.ilike.${searchPattern},"Email da empresa".ilike.${searchPattern}`
    );
  }

  // First, get the total count of filtered results
  const { count, error: countError } = await query.limit(0).single(); // Use limit(0).single() to get count without data

  if (countError && countError.code !== 'PGRST116') { // PGRST116 means "no rows found"
    console.error('Error fetching total count for additional company excel data:', countError);
    throw new Error(countError.message);
  }

  // Then, get the paginated data
  const { data, error } = await query
    .range(offset, offset + pageSize - 1); // Supabase range is inclusive

  if (error) {
    console.error('Error fetching paginated additional company excel data:', error);
    throw new Error(error.message);
  }

  console.log(`Fetched ${data?.length || 0} additional company records for user ${userId}, page ${page}, total ${count}`);
  return { data: data as CompanyAdditionalExcelData[], totalCount: count || 0 };
}