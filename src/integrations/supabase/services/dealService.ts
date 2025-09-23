import { supabase } from '../client';
import { Negocio } from '@/types/crm';

/**
 * Inserts a new deal into the negocios table.
 */
export async function insertDeal(deal: Omit<Negocio, 'id' | 'created_at' | 'updated_at'>): Promise<Negocio> {
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
    .select('*')
    .eq('user_id', userId)
    .eq('company_excel_id', companyExcelId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching deals for company_excel_id ${companyExcelId}:`, error);
    throw new Error(error.message);
  }
  return data as Negocio[];
}