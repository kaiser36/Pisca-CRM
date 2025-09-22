import { supabase } from '../client';
import { Stand } from '@/types/crm';

/**
 * Upserts stand data into Supabase.
 */
export async function upsertStands(stands: Stand[], companyDbIdMap: Map<string, string>): Promise<void> {
  for (const stand of stands) {
    const companyDbId = companyDbIdMap.get(stand.Company_id);
    if (!companyDbId) {
      console.warn(`Company DB ID not found for Excel Company_id: ${stand.Company_id}. Skipping stand: ${stand.Stand_ID}`);
      continue;
    }

    const { data: existingStand, error: fetchError } = await supabase
      .from('stands')
      .select('id')
      .eq('stand_id', stand.Stand_ID)
      .eq('company_db_id', companyDbId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means "no rows found"
      console.error('Error fetching existing stand:', fetchError);
      throw new Error(fetchError.message);
    }

    const standData = {
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

    if (existingStand) {
      // Update existing stand
      const { error } = await supabase
        .from('stands')
        .update(standData)
        .eq('id', existingStand.id);
      if (error) {
        console.error('Error updating stand:', error);
        throw new Error(error.message);
      }
    } else {
      // Insert new stand
      const { error } = await supabase
        .from('stands')
        .insert(standData);
      if (error) {
        console.error('Error inserting stand:', error);
        throw new Error(error.message);
      }
    }
  }
}