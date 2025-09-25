import { supabase } from '../client';
import { Stand } from '@/types/crm';

/**
 * Upserts stand data into Supabase.
 */
export async function upsertStands(stands: Stand[], companyDbIdMap: Map<string, string>): Promise<void> {
  console.log(`[upsertStands] Attempting to upsert ${stands.length} stands.`);
  const uniqueStandsMap = new Map<string, any>();

  stands.forEach(stand => {
    const companyDbId = companyDbIdMap.get(stand.Company_id);
    if (!companyDbId) {
      console.warn(`[upsertStands] Company DB ID not found for Excel Company_id: ${stand.Company_id}. Skipping stand: ${stand.Stand_ID}`);
      return;
    }

    const key = `${stand.Stand_ID}-${companyDbId}`; // Unique key for deduplication
    uniqueStandsMap.set(key, {
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
      Leads_Expiradas: stand.Leads_Expiradas,
      Leads_Financiadas: stand.Leads_Financiadas,
      whatsapp: stand.Whatsapp,
      stand_name: stand.Stand_Name, // NEW: Include stand_name
    });
  });

  const standsToUpsert = Array.from(uniqueStandsMap.values());
  console.log(`[upsertStands] ${standsToUpsert.length} stands prepared for upsert after deduplication and company ID lookup.`);

  if (standsToUpsert.length === 0) {
    console.log('[upsertStands] No stands to upsert.');
    return;
  }

  const { error } = await supabase
    .from('stands')
    .upsert(standsToUpsert, { onConflict: 'stand_id, company_db_id' }); // Use stand_id and company_db_id as conflict keys

  if (error) {
    console.error('[upsertStands] Error upserting stands:', error);
    throw new Error(error.message);
  }
  console.log(`[upsertStands] Successfully upserted ${standsToUpsert.length} stands.`);
}

/**
 * Deletes all stands for a given user by first finding their associated companies.
 */
export async function deleteStands(userId: string): Promise<void> {
  console.log(`[deleteStands] Attempting to delete all stands for user: ${userId}`);

  // 1. Fetch all company_db_ids associated with this user
  const { data: companyIdsData, error: companyFetchError } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', userId);

  if (companyFetchError) {
    console.error('[deleteStands] Error fetching company IDs for user:', companyFetchError);
    throw new Error(companyFetchError.message);
  }

  const companyDbIds = companyIdsData.map(c => c.id);

  if (companyDbIds.length === 0) {
    console.log(`[deleteStands] No companies found for user ${userId}, so no stands to delete.`);
    return;
  }

  // 2. Delete stands where company_db_id is in the list of user's company IDs
  console.log(`[deleteStands] Deleting stands associated with ${companyDbIds.length} companies for user: ${userId}`);
  const { error: deleteError } = await supabase
    .from('stands')
    .delete()
    .in('company_db_id', companyDbIds);

  if (deleteError) {
    console.error('[deleteStands] Error deleting stands:', deleteError);
    throw new Error(deleteError.message);
  }
  console.log(`[deleteStands] Successfully deleted stands for user: ${userId}`);
}