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

/**
 * Upserts Easyvista data into the Easyvistas table.
 */
export async function upsertEasyvistas(easyvistas: Easyvista[], userId: string): Promise<void> {
  const dataToUpsert = easyvistas.map(easyvista => ({
    user_id: userId,
    company_excel_id: easyvista.company_excel_id,
    "Nome comercial": easyvista["Nome comercial"] || null,
    "EV_ID": easyvista["EV_ID"], // EV_ID is required for uniqueness
    "Data Criação": easyvista["Data Criação"] || new Date().toISOString(),
    "Status": easyvista["Status"] || null,
    "Account": easyvista["Account"] || null,
    "Titulo": easyvista["Titulo"] || null,
    "Descrição": easyvista["Descrição"] || null,
    "Anexos": easyvista["Anexos"] || null,
    "Ultima actualização": easyvista["Ultima actualização"] || new Date().toISOString(),
    "Tipo de report": easyvista["Tipo de report"] || null,
    "PV": easyvista["PV"] || false,
    "Tipo EVS": easyvista["Tipo EVS"] || null,
    "Urgência": easyvista["Urgência"] || null,
    "Email Pisca": easyvista["Email Pisca"] || null,
    "Pass Pisca": easyvista["Pass Pisca"] || null,
    "Client ID": easyvista["Client ID"] || null,
    "Client Secret": easyvista["Client Secret"] || null,
    "Integração": easyvista["Integração"] || null,
    "NIF da empresa": easyvista["NIF da empresa"] || null,
    "Campanha": easyvista["Campanha"] || null,
    "Duração do acordo": easyvista["Duração do acordo"] || null,
    "Plano do acordo": easyvista["Plano do acordo"] || null,
    "Valor sem iva": easyvista["Valor sem iva"] || null,
    "ID_Proposta": easyvista["ID_Proposta"] || null,
    "Account Armatis": easyvista["Account Armatis"] || null,
  }));

  if (dataToUpsert.length === 0) {
    return;
  }

  const { error } = await supabase
    .from('Easyvistas')
    .upsert(dataToUpsert, { onConflict: 'company_excel_id, "EV_ID", user_id' }); // Ensure uniqueness per user and EV_ID

  if (error) {
    console.error('Error upserting Easyvistas:', error);
    throw new Error(error.message);
  }
}