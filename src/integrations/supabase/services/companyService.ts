import { supabase } from '../client';
import { Company, Stand } from '@/types/crm';
import { fetchStandsForCompanyDbIds } from './standService'; // Import the function

/**
 * Maps a Supabase company object to the CRM Company interface.
 */
function mapSupabaseCompanyToCrmCompany(supabaseCompany: any): Company {
  return {
    id: supabaseCompany.id, // NEW: Mapear o ID da base de dados
    Company_id: supabaseCompany.company_id,
    Company_Name: supabaseCompany.company_name,
    NIF: supabaseCompany.nif,
    Company_Email: supabaseCompany.company_email,
    Company_Contact_Person: supabaseCompany.company_contact_person,
    Website: supabaseCompany.website,
    Plafond: supabaseCompany.plafond,
    Supervisor: supabaseCompany.supervisor,
    Is_CRB_Partner: supabaseCompany.is_crb_partner,
    Is_APDCA_Partner: supabaseCompany.is_apdca_partner,
    Creation_Date: supabaseCompany.creation_date,
    Last_Login_Date: supabaseCompany.last_login_date,
    Financing_Simulator_On: supabaseCompany.financing_simulator_on,
    Simulator_Color: supabaseCompany.simulator_color,
    Last_Plan: supabaseCompany.last_plan,
    Plan_Price: supabaseCompany.plan_price,
    Plan_Expiration_Date: supabaseCompany.plan_expiration_date,
    Plan_Active: supabaseCompany.plan_active,
    Plan_Auto_Renewal: supabaseCompany.plan_auto_renewal,
    Current_Bumps: supabaseCompany.current_bumps,
    Total_Bumps: supabaseCompany.total_bumps, // Corrected column name here
    Commercial_Name: supabaseCompany.commercial_name,
    Company_Postal_Code: supabaseCompany.company_postal_code,
    District: supabaseCompany.district,
    Company_City: supabaseCompany.company_city,
    Company_Address: supabaseCompany.company_address,
    AM_Old: supabaseCompany.am_old,
    AM_Current: supabaseCompany.am_current,
    Stock_STV: supabaseCompany.stock_stv,
    Company_API_Info: supabaseCompany.company_api_info,
    Company_Stock: supabaseCompany.company_stock,
    Logo_URL: supabaseCompany.logo_url,
    Classification: supabaseCompany.classification,
    Imported_Percentage: supabaseCompany.imported_percentage,
    Vehicle_Source: supabaseCompany.vehicle_source,
    Competition: supabaseCompany.competition,
    Social_Media_Investment: supabaseCompany.social_media_investment,
    Portal_Investment: supabaseCompany.portal_investment,
    B2B_Market: supabaseCompany.b2b_market,
    Uses_CRM: supabaseCompany.uses_crm,
    CRM_Software: supabaseCompany.crm_software,
    Recommended_Plan: supabaseCompany.recommended_plan,
    Credit_Mediator: supabaseCompany.credit_mediator,
    Bank_Of_Portugal_Link: supabaseCompany.bank_of_portugal_link,
    Financing_Agreements: supabaseCompany.financing_agreements,
    Last_Visit_Date: supabaseCompany.last_visit_date,
    Company_Group: supabaseCompany.company_group,
    Represented_Brands: supabaseCompany.represented_brands,
    Company_Type: supabaseCompany.company_type,
    Wants_CT: supabaseCompany.wants_ct,
    Wants_CRB_Partner: supabaseCompany.wants_crb_partner,
    autobiz_info: supabaseCompany.autobiz_info, // Updated to snake_case
    Stand_Name: supabaseCompany.stand_name,
    stands: [] // Stands are populated separately
  };
}

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
    leads_expiradas: supabaseStand.leads_expiradas, // Corrected here
    Leads_Financiadas: supabaseStand.leads_financiadas,
    Whatsapp: supabaseStand.whatsapp,
    Stand_Name: supabaseStand.stand_name,
  };
}

/**
 * Fetches all companies and their associated stands for the current authenticated user.
 */
export async function fetchCompaniesWithStands(userId: string): Promise<Company[]> {
  console.log(`[fetchCompaniesWithStands] Fetching companies for user: ${userId}`);
  const { data: companiesData, error: companiesError } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', userId);

  if (companiesError) {
    console.error('[fetchCompaniesWithStands] Error fetching companies:', companiesError);
    throw new Error(companiesError.message);
  }
  console.log(`[fetchCompaniesWithStands] Fetched ${companiesData.length} companies.`);

  const companyDbIds = companiesData.map(c => c.id);
  const allStandsData = await fetchStandsForCompanyDbIds(userId, companyDbIds); // Use imported function
  console.log(`[fetchCompaniesWithStands] Total stands fetched: ${allStandsData.length}`);

  const companiesMap = new Map<string, Company>();
  companiesData.forEach(supabaseCompany => {
    companiesMap.set(supabaseCompany.id, mapSupabaseCompanyToCrmCompany(supabaseCompany));
  });

  allStandsData.forEach(supabaseStand => {
    const company = companiesMap.get(supabaseStand.company_db_id);
    if (company) {
      company.stands.push(mapSupabaseStandToCrmStand(supabaseStand));
    } else {
      console.warn(`[fetchCompaniesWithStands] Stand with company_db_id ${supabaseStand.company_db_id} found but no matching company in map. Stand:`, supabaseStand);
    }
  });

  const result = Array.from(companiesMap.values());
  console.log(`[fetchCompaniesWithStands] Final companies with stands count: ${result.length}`);
  result.forEach(c => console.log(`  - Company ${c.Company_Name} (${c.Company_id}) has ${c.stands.length} stands.`));
  return result;
}

/**
 * Fetches companies and their associated stands for the current authenticated user,
 * filtered by a list of Excel company IDs.
 */
export async function fetchCompaniesByExcelCompanyIds(userId: string, excelCompanyIds: string[]): Promise<Company[]> {
  if (excelCompanyIds.length === 0) {
    return [];
  }

  console.log(`[fetchCompaniesByExcelCompanyIds] Fetching companies by Excel IDs for user: ${userId}, IDs:`, excelCompanyIds);
  const { data: companiesData, error: companiesError } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', userId)
    .in('company_id', excelCompanyIds); // Filter by company_id (which is the excel_company_id)

  if (companiesError) {
    console.error('[fetchCompaniesByExcelCompanyIds] Error fetching companies by Excel IDs:', companiesError);
    throw new Error(companiesError.message);
  }
  console.log(`[fetchCompaniesByExcelCompanyIds] Fetched ${companiesData.length} companies by Excel IDs.`);

  const companyDbIds = companiesData.map(c => c.id);
  const allStandsData = await fetchStandsForCompanyDbIds(userId, companyDbIds); // Use imported function
  console.log(`[fetchCompaniesByExcelCompanyIds] Total stands fetched for specific companies: ${allStandsData.length}`);

  const companiesMap = new Map<string, Company>();
  companiesData.forEach(supabaseCompany => {
    // Use company.company_id (Excel ID) as key for mapping
    companiesMap.set(supabaseCompany.company_id, mapSupabaseCompanyToCrmCompany(supabaseCompany));
  });

  allStandsData.forEach(supabaseStand => {
    // Find the company using its Excel ID (company_id_excel)
    const company = companiesMap.get(supabaseStand.company_id_excel);
    if (company) {
      company.stands.push(mapSupabaseStandToCrmStand(supabaseStand));
    } else {
      console.warn(`[fetchCompaniesByExcelCompanyIds] Stand with company_id_excel ${supabaseStand.company_id_excel} found but no matching company in map. Stand:`, supabaseStand);
    }
  });

  const result = Array.from(companiesMap.values());
  console.log(`[fetchCompaniesByExcelCompanyIds] Final companies with stands count: ${result.length}`);
  result.forEach(c => console.log(`  - Company ${c.Company_Name} (${c.Company_id}) has ${c.stands.length} stands.`));
  return result;
}

/**
 * Upserts company data into Supabase.
 * Maps Excel Company_id to Supabase DB UUID.
 */
export async function upsertCompanies(companies: Company[], userId: string): Promise<Map<string, string>> {
  console.log(`[upsertCompanies] Attempting to upsert ${companies.length} companies for user: ${userId}.`);
  const companyDbIdMap = new Map<string, string>();

  const companiesToUpsert = companies.map(company => ({
    user_id: userId,
    company_id: company.Company_id,
    company_name: company.Company_Name,
    nif: company.NIF,
    company_email: company.Company_Email,
    company_contact_person: company.Company_Contact_Person,
    website: company.Website,
    plafond: company.Plafond,
    supervisor: company.Supervisor,
    is_crb_partner: company.Is_CRB_Partner,
    is_apdca_partner: company.Is_APDCA_Partner,
    creation_date: company.Creation_Date,
    last_login_date: company.Last_Login_Date,
    financing_simulator_on: company.Financing_Simulator_On,
    simulator_color: company.Simulator_Color,
    last_plan: company.Last_Plan,
    plan_price: company.Plan_Price,
    plan_expiration_date: company.Plan_Expiration_Date,
    plan_active: company.Plan_Active,
    plan_auto_renewal: company.Plan_Auto_Renewal,
    current_bumps: company.Current_Bumps,
    total_bumps: company.Total_Bumps, // Corrected column name here
    commercial_name: company.Commercial_Name,
    company_postal_code: company.Company_Postal_Code,
    district: company.District,
    company_city: company.Company_City,
    company_address: company.Company_Address,
    am_old: company.AM_Old,
    am_current: company.AM_Current,
    stock_stv: company.Stock_STV,
    company_api_info: company.Company_API_Info,
    company_stock: company.Company_Stock,
    logo_url: company.Logo_URL,
    classification: company.Classification,
    imported_percentage: company.Imported_Percentage,
    vehicle_source: company.Vehicle_Source,
    competition: company.Competition,
    social_media_investment: company.Social_Media_Investment,
    portal_investment: company.Portal_Investment,
    b2b_market: company.B2B_Market,
    uses_crm: company.Uses_CRM,
    crm_software: company.CRM_Software,
    recommended_plan: company.Recommended_Plan,
    credit_mediator: company.Credit_Mediator,
    bank_of_portugal_link: company.Bank_Of_Portugal_Link,
    financing_agreements: company.Financing_Agreements,
    last_visit_date: company.Last_Visit_Date,
    company_group: company.Company_Group,
    represented_brands: company.Represented_Brands,
    company_type: company.Company_Type,
    wants_ct: company.Wants_CT,
    wants_crb_partner: company.Wants_CRB_Partner,
    autobiz_info: company.autobiz_info, // Updated to snake_case
    stand_name: company.Stand_Name,
  }));

  if (companiesToUpsert.length === 0) {
    console.log('[upsertCompanies] No companies to upsert.');
    return companyDbIdMap;
  }

  const { data, error } = await supabase
    .from('companies')
    .upsert(companiesToUpsert, { onConflict: 'company_id, user_id' })
    .select('id, company_id');

  if (error) {
    console.error('[upsertCompanies] Error upserting companies:', error);
    throw new Error(error.message);
  }

  data?.forEach(c => {
    companyDbIdMap.set(c.company_id, c.id);
  });
  console.log(`[upsertCompanies] Successfully upserted ${data?.length || 0} companies. Mapped Excel IDs to DB IDs:`, Array.from(companyDbIdMap.entries()));

  return companyDbIdMap;
}

/**
 * Updates specific additional company information in the 'companies' table.
 */
export async function updateCompanyAdditionalInfo(companyIdExcel: string, data: Partial<Company>, userId: string): Promise<void> {
  console.log(`[updateCompanyAdditionalInfo] Attempting to update additional info for company Excel ID: ${companyIdExcel}`);
  const { data: existingCompany, error: fetchError } = await supabase
    .from('companies')
    .select('id')
    .eq('company_id', companyIdExcel)
    .eq('user_id', userId)
    .single();

  if (fetchError) {
    console.error(`[updateCompanyAdditionalInfo] Company with Excel ID ${companyIdExcel} not found or error fetching:`, fetchError);
    throw new Error(`Company with Excel ID ${companyIdExcel} not found or error fetching: ${fetchError.message}`);
  }
  console.log(`[updateCompanyAdditionalInfo] Found company DB ID: ${existingCompany.id} for Excel ID: ${companyIdExcel}`);

  const updatePayload: { [key: string]: any } = {};
  if (data.Commercial_Name !== undefined) updatePayload.commercial_name = data.Commercial_Name;
  if (data.Company_Postal_Code !== undefined) updatePayload.company_postal_code = data.Company_Postal_Code;
  if (data.District !== undefined) updatePayload.district = data.District;
  if (data.Company_City !== undefined) updatePayload.company_city = data.Company_City;
  if (data.Company_Address !== undefined) updatePayload.company_address = data.Company_Address;
  if (data.AM_Old !== undefined) updatePayload.am_old = data.AM_Old;
  if (data.AM_Current !== undefined) updatePayload.am_current = data.AM_Current;
  if (data.Stock_STV !== undefined) updatePayload.stock_stv = data.Stock_STV;
  if (data.Company_API_Info !== undefined) updatePayload.company_api_info = data.Company_API_Info;
  if (data.Company_Stock !== undefined) updatePayload.company_stock = data.Company_Stock;
  if (data.Logo_URL !== undefined) updatePayload.logo_url = data.Logo_URL;
  if (data.Classification !== undefined) updatePayload.classification = data.Classification;
  if (data.Imported_Percentage !== undefined) updatePayload.imported_percentage = data.Imported_Percentage;
  if (data.Vehicle_Source !== undefined) updatePayload.vehicle_source = data.Vehicle_Source;
  if (data.Competition !== undefined) updatePayload.competition = data.Competition;
  if (data.Social_Media_Investment !== undefined) updatePayload.social_media_investment = data.Social_Media_Investment;
  if (data.Portal_Investment !== undefined) updatePayload.portal_investment = data.Portal_Investment;
  if (data.B2B_Market !== undefined) updatePayload.b2b_market = data.B2B_Market;
  if (data.Uses_CRM !== undefined) updatePayload.uses_crm = data.Uses_CRM;
  if (data.CRM_Software !== undefined) updatePayload.crm_software = data.CRM_Software;
  if (data.Recommended_Plan !== undefined) updatePayload.recommended_plan = data.Recommended_Plan;
  if (data.Credit_Mediator !== undefined) updatePayload.credit_mediator = data.Credit_Mediator;
  if (data.Bank_Of_Portugal_Link !== undefined) updatePayload.bank_of_portugal_link = data.Bank_Of_Portugal_Link;
  if (data.Financing_Agreements !== undefined) updatePayload.financing_agreements = data.Financing_Agreements;
  if (data.Last_Visit_Date !== undefined) updatePayload.last_visit_date = data.Last_Visit_Date;
  if (data.Company_Group !== undefined) updatePayload.company_group = data.Company_Group;
  if (data.Represented_Brands !== undefined) updatePayload.represented_brands = data.Represented_Brands;
  if (data.Company_Type !== undefined) updatePayload.company_type = data.Company_Type;
  if (data.Wants_CT !== undefined) updatePayload.wants_ct = data.Wants_CT;
  if (data.Wants_CRB_Partner !== undefined) updatePayload.wants_crb_partner = data.Wants_CRB_Partner;
  if (data.autobiz_info !== undefined) updatePayload.autobiz_info = data.autobiz_info; // Updated to snake_case
  if (data.Stand_Name !== undefined) updatePayload.stand_name = data.Stand_Name;

  if (Object.keys(updatePayload).length === 0) {
    console.warn('[updateCompanyAdditionalInfo] No additional company data to update for company:', companyIdExcel);
    return;
  }
  console.log(`[updateCompanyAdditionalInfo] Update payload for company ${companyIdExcel}:`, updatePayload);

  const { error } = await supabase
    .from('companies')
    .update(updatePayload)
    .eq('id', existingCompany.id);

  if (error) {
    console.error('[updateCompanyAdditionalInfo] Error updating additional company info:', error);
    throw new Error(error.message);
  }
  console.log(`[updateCompanyAdditionalInfo] Successfully updated additional info for company ${companyIdExcel}.`);
}

/**
 * Fetches a company by its email for a given user.
 */
export async function fetchCompanyByEmail(userId: string, email: string): Promise<Company | null> {
  console.log(`[fetchCompanyByEmail] Fetching company by email: ${email} for user: ${userId}`);
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', userId)
    .eq('company_email', email)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows found"
    console.error('[fetchCompanyByEmail] Error fetching company by email:', error);
    throw new Error(error.message);
  }

  if (!data) {
    console.log(`[fetchCompanyByEmail] No company found for email: ${email}`);
    return null;
  }

  console.log(`[fetchCompanyByEmail] Found company for email ${email}:`, data.company_id);
  return mapSupabaseCompanyToCrmCompany(data);
}

/**
 * Deletes all companies for a given user.
 */
export async function deleteCompanies(userId: string): Promise<void> {
  console.log(`[deleteCompanies] Deleting all companies for user: ${userId}`);
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('[deleteCompanies] Error deleting companies:', error);
    throw new Error(error.message);
  }
  console.log(`[deleteCompanies] Successfully deleted companies for user: ${userId}`);
}