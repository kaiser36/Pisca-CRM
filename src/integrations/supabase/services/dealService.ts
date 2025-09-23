import { supabase } from '../client';
import { Negocio } from '@/types/crm';

/**
 * Inserts a new deal into the negocios table.
 */
export async function insertDeal(deal: Omit<Negocio, 'id' | 'created_at' | 'updated_at' | 'commercial_name'>): Promise<Negocio> {
  const { data, error } = await supabase
    .from('negocios')
    .insert(deal)
    .select()
    .single();

  if (error) {
    console.error('Error inserting deal:', error);
    throw new Error(error.message);
  }
  return data as Negocio;
}

/**
 * Fetches all deals for a given company_excel_id and user_id.
 */
export async function fetchDealsByCompanyExcelId(userId: string, companyExcelId: string): Promise<Negocio[]> {
  const { data, error } = await supabase
    .from('negocios')
    .select(`
      *,
      companies (
        commercial_name
      ),
      company_additional_excel_data ("Nome Comercial")
    `)
    .eq('user_id', userId)
    .eq('company_excel_id', companyExcelId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching deals for company_excel_id ${companyExcelId}:`, error);
    throw new Error(error.message);
  }

  // Map the fetched data to the Negocio interface, prioritizing "Nome Comercial" from additional data
  return data.map(deal => ({
    ...deal,
    commercial_name: deal.company_additional_excel_data?.["Nome Comercial"] || deal.companies?.commercial_name || null,
  })) as Negocio[];
}

/**
 * Updates an existing deal in the negocios table.
 */
export async function updateDeal(id: string, deal: Partial<Omit<Negocio, 'id' | 'created_at' | 'user_id' | 'commercial_name'>>): Promise<Negocio> {
  const { data, error } = await supabase
    .from('negocios')
    .update({ ...deal, updated_at: new Date().toISOString() }) // Update updated_at timestamp
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating deal with id ${id}:`, error);
    throw new Error(error.message);
  }
  return data as Negocio;
}

/**
 * Deletes a deal from the negocios table.
 */
export async function deleteDeal(id: string): Promise<void> {
  const { error } = await supabase
    .from('negocios')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting deal with id ${id}:`, error);
    throw new Error(error.message);
  }
}