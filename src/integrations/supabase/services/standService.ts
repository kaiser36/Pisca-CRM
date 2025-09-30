import { supabase } from '../client';
import { Stand, Company } from '@/types/crm'; // Import Company

/**
 * Maps a Supabase stand object to the CRM Stand interface.
 */
function mapSupabaseStandToCrmStand(supabaseStand: any): Stand {
  return {
    Stand_ID: supabaseStand.stand_id,
    Company_id: supabaseStand.company_id_excel,
    Company_Name: supabaseStand.company_name,
    NIF: supabaseStand.nif,
    Address: supabaseStand.address,
    City: supabaseStand.city,
    Postal_Code: supabaseStand.postal_code,
    Phone: supabaseStand.phone,
    Email: supabaseStand.email,
    Contact_Person: supabaseStand.contact_person,
    Anuncios: supabaseStand.anuncios,
    API: supabaseStand.api,
    Publicados: supabaseStand.publicados,
    Arquivados: supabaseStand.arquivados,
    Guardados: supabaseStand.guardados,
    Tipo: supabaseStand.tipo,
    Delta_Publicados_Last_Day_Month: supabaseStand.delta_publicados_last_day_month,
    Leads_Recebidas: supabaseStand.leads_recebidas,
    Leads_Pendentes: supabaseStand.leads_pendentes,
    leads_expiradas: supabaseStand.leads_expiradas,
    Leads_Financiadas: supabaseStand.leads_financiadas,
    Whatsapp: supabaseStand.whatsapp,
    Stand_Name: supabaseStand.stand_name,
  };
}

/**
 * Fetches stands for a given list of company database IDs.
 * Handles batching to avoid URL too long errors.
 */
export async function fetchStandsForCompanyDbIds(userId: string, companyDbIds: string[]): Promise<any[]> {
  if (companyDbIds.length === 0) {
    return [];
  }

  let allStandsData: any[] = [];
  const BATCH_SIZE = 50; // Fetch stands in batches of 50 company IDs

  for (let i = 0; i < companyDbIds.length; i += BATCH_SIZE) {
    const batchIds = companyDbIds.slice(i, i + BATCH_SIZE);
    if (batchIds.length === 0) continue;

    console.log(`[fetchStandsForCompanyDbIds] Fetching stands for batch of company DB IDs:`, batchIds);
    const { data: batchStandsData, error: batchStandsError } = await supabase
      .from('stands')
      .select('*')
      .in('company_db_id', batchIds); 

    if (batchStandsError) {
      console.error('[fetchStandsForCompanyDbIds] Error fetching stands in batch:', batchStandsError);
      throw new Error(batchStandsError.message);
    }
    console.log(`[fetchStandsForCompanyDbIds] Fetched ${batchStandsData.length} stands in batch.`);
    allStandsData = allStandsData.concat(batchStandsData);
  }
  return allStandsData;
}

/**
 * Fetches stands for a specific company database ID.
 */
export async function fetchStandsByCompanyDbId(userId: string, companyDbId: string): Promise<Stand[]> {
  if (!companyDbId) {
    return [];
  }

  console.log(`[fetchStandsByCompanyDbId] Fetching stands for company DB ID: ${companyDbId}`);
  const { data: standsData, error: standsError } = await supabase
    .from('stands')
    .select('*')
    .eq('company_db_id', companyDbId);

  if (standsError) {
    console.error('[fetchStandsByCompanyDbId] Error fetching stands:', standsError);
    throw new Error(standsError.message);
  }

  console.log(`[fetchStandsByCompanyDbId] Fetched ${standsData?.length || 0} stands.`);
  return (standsData || []).map(mapSupabaseStandToCrmStand);
}

/**
 * Upserts stand data into Supabase.
 */
export async function upsertStands(stands: Stand[], companyDbIdMap: Map<string, string>): Promise<void> {
  console.log(`[upsertStands] Attempting to upsert ${stands.length} stands.`);
  
  const uniqueStandsToUpsertMap = new Map<string, any>();

  stands.forEach(stand => {
    const companyDbId = companyDbIdMap.get(stand.Company_id);
    if (!companyDbId) {
      console.warn(`Company DB ID not found for Excel Company_id: ${stand.Company_id}. Skipping stand: ${stand.Stand_ID}`);
      return null; // Skip stands that cannot be linked to a company
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
      leads_expiradas: stand.leads_expiradas,
      leads_financiadas: stand.Leads_Financiadas,
      whatsapp: stand.Whatsapp,
      stand_name: stand.Stand_Name,
    };
    
    // Create a unique key for the map based on the onConflict columns
    const uniqueKey = `${standData.stand_id}-${standData.company_db_id}`;
    uniqueStandsToUpsertMap.set(uniqueKey, standData);
  });

  const standsToUpsert = Array.from(uniqueStandsToUpsertMap.values());

  if (standsToUpsert.length === 0) {
    console.log('[upsertStands] No stands to upsert after filtering and deduplication.');
    return;
  }

  const { error } = await supabase
    .from('stands')
    .upsert(standsToUpsert, { onConflict: 'stand_id, company_db_id' }); // Ensure uniqueness per stand_id and company_db_id

  if (error) {
    console.error('[upsertStands] Error upserting stands:', error);
    throw new Error(error.message);
  }
  console.log(`[upsertStands] Successfully upserted ${standsToUpsert.length} unique stands.`);
}

/**
 * Deletes all stands for a given user's companies.
 */
export async function deleteStands(userId: string): Promise<void> {
  console.log(`[deleteStands] Deleting all stands for user: ${userId}`);
  // First, get all company_db_ids for the user
  const { data: companyIds, error: companyFetchError } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', userId);

  if (companyFetchError) {
    console.error('[deleteStands] Error fetching company IDs for stand deletion:', companyFetchError);
    throw new Error(companyFetchError.message);
  }

  const companyDbIds = companyIds.map(c => c.id);

  if (companyDbIds.length === 0) {
    console.log('[deleteStands] No companies found for user, no stands to delete.');
    return;
  }

  const BATCH_SIZE = 50; // Delete stands in batches of 50 company IDs
  for (let i = 0; i < companyDbIds.length; i += BATCH_SIZE) {
    const batchIds = companyDbIds.slice(i, i + BATCH_SIZE);
    if (batchIds.length === 0) continue;

    console.log(`[deleteStands] Deleting stands for batch of company DB IDs:`, batchIds);
    const { error: deleteError } = await supabase
      .from('stands')
      .delete()
      .in('company_db_id', batchIds);

    if (deleteError) {
      console.error('[deleteStands] Error deleting stands in batch:', deleteError);
      throw new Error(deleteError.message);
    }
    console.log(`[deleteStands] Successfully deleted stands for ${batchIds.length} companies in batch.`);
  }
  console.log(`[deleteStands] Successfully deleted all stands for user: ${userId}`);
}