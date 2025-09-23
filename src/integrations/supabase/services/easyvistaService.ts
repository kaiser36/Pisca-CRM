import { supabase } from '../client';
import { Easyvista } from '@/types/crm';

/**
 * Inserts a new Easyvista record into the Easyvistas table.
 */
export async function insertEasyvista(easyvista: Omit<Easyvista, 'id' | 'created_at' | 'Ultima actualização' | 'Data Criação'>): Promise<Easyvista> {
  const { data, error } = await supabase
    .from('Easyvistas')
    .insert({
      ...easyvista,
      "Data Criação": new Date().toISOString(),
      "Ultima actualização": new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting Easyvista:', error);
    throw new Error(error.message);
  }
  return data as Easyvista;
}

/**
 * Fetches all Easyvista records for a given company_excel_id and user_id.
 */
export async function fetchEasyvistasByCompanyExcelId(userId: string, companyExcelId: string): Promise<Easyvista[]> {
  const { data, error } = await supabase
    .from('Easyvistas')
    .select('*')
    .eq('user_id', userId)
    .eq('company_excel_id', companyExcelId)
    .order('Data Criação', { ascending: false });

  if (error) {
    console.error(`Error fetching Easyvistas for company_excel_id ${companyExcelId}:`, error);
    throw new Error(error.message);
  }
  return data as Easyvista[];
}