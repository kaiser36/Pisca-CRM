import { supabase } from '../client';
import { Stand } from '@/types/crm';

/**
 * Upserts stand data into Supabase.
 */
export async function upsertStands(stands: Stand[], companyDbIdMap: Map<string, string>): Promise<void> {
  const standsToUpsert = stands.map(stand => {
    const companyDbId = companyDbIdMap.get(stand.Company_id);
    if (!companyDbId) {
      console.warn(`Company DB ID not found for Excel Company_id: ${stand.Company_id}. Skipping stand: ${stand.Stand_ID}`);
      return null; // Skip this stand if companyDbId is not found
    }

    return {
      company_db_id: companyDbId,
      stand_id: stand.Stand_ID,
      company_id_excel: stand.Company_id,
      company_name: stand.Company_Name,
      nif: stand.NIF,
      address: stand.Address,
      city: stand.City,
      postal_code: stand.Postal_Code,
      phone: stand.Phone,
      email: stand.Email,
      contact_person: stand.Contact_Person,
      anuncios: stand.Anuncios,
      api: stand.API,
      publicados: stand.Publicados,
      arquivados: stand.Arquivados,
      guardados: stand.Guardados,
      tipo: stand.Tipo,
      delta_publicados_last_day_month: stand.Delta_Publicados_Last_Day_Month,
      leads_recebidas: stand.Leads_Recebidas,
      leads_pendentes: stand.Leads_Pendentes,
      leads_expiradas: stand.Leads_Expiradas,
      leads_financiadas: stand.Leads_Financiadas,
      whatsapp: stand.Whatsapp,
    };
  }).filter((s): s is NonNullable<typeof s> => s !== null); // Filter out null stands

  if (standsToUpsert.length === 0) {
    return;
  }

  const { error } = await supabase
    .from('stands')
    .upsert(standsToUpsert, { onConflict: 'stand_id, company_db_id' }); // Use stand_id and company_db_id as conflict keys

  if (error) {
    console.error('Error upserting stands:', error);
    throw new Error(error.message);
  }
}