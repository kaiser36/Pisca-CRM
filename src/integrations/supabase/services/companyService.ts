import { supabase } from '../client';
import { Company, Stand } from '@/types/crm';

/**
 * Fetches all companies and their associated stands for the current authenticated user.
 * Note: This function now only fetches data directly from the 'companies' table.
 * Additional Excel data is not merged here, as per the request for independent tables.
 */
export async function fetchCompaniesWithStands(userId: string): Promise<Company[]> {
  const { data: companiesData, error: companiesError } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', userId);

  if (companiesError) {
    console.error('Error fetching companies:', companiesError);
    throw new Error(companiesError.message);
  }

  const companyIds = companiesData.map(c => c.id);

  let allStandsData: any[] = [];
  const BATCH_SIZE = 50; // Fetch stands in batches of 50 company IDs to avoid URI Too Long error

  for (let i = 0; i < companyIds.length; i += BATCH_SIZE) {
    const batchIds = companyIds.slice(i, i + BATCH_SIZE);
    if (batchIds.length === 0) continue;

    const { data: batchStandsData, error: batchStandsError } = await supabase
      .from('stands')
      .select('*')
      .in('company_db_id', batchIds);

    if (batchStandsError) {
      console.error('Error fetching stands in batch:', batchStandsError);
      throw new Error(batchStandsError.message);
    }
    allStandsData = allStandsData.concat(batchStandsData);
  }

  const standsData = allStandsData;

  const companiesMap = new Map<string, Company>();
  companiesData.forEach(company => {
    companiesMap.set(company.id, {
      Company_id: company.company_id,
      Company_Name: company.company_name,
      NIF: company.nif,
      Company_Email: company.company_email,
      Company_Contact_Person: company.company_contact_person,
      Website: company.website,
      Plafond: company.plafond,
      Supervisor: company.supervisor,
      Is_CRB_Partner: company.is_crb_partner,
      Is_APDCA_Partner: company.is_apdca_partner,
      Creation_Date: company.creation_date,
      Last_Login_Date: company.last_login_date,
      Financing_Simulator_On: company.financing_simulator_on,
      Simulator_Color: company.simulator_color,
      Last_Plan: company.last_plan,
      Plan_Price: company.plan_price,
      Plan_Expiration_Date: company.plan_expiration_date,
      Plan_Active: company.plan_active,
      Plan_Auto_Renewal: company.plan_auto_renewal,
      Current_Bumps: company.current_bumps,
      Total_Bumps: company.total_bumps,
      
      Commercial_Name: company.commercial_name,
      Company_Postal_Code: company.company_postal_code,
      District: company.district,
      Company_City: company.company_city,
      Company_Address: company.company_address,
      AM_Old: company.am_old,
      AM_Current: company.am_current,
      Stock_STV: company.stock_stv,
      Company_API_Info: company.company_api_info,
      Company_Stock: company.company_stock,
      Logo_URL: company.logo_url,
      Classification: company.classification,
      Imported_Percentage: company.imported_percentage,
      Vehicle_Source: company.vehicle_source,
      Competition: company.competition,
      Social_Media_Investment: company.social_media_investment,
      Portal_Investment: company.portal_investment,
      B2B_Market: company.b2b_market,
      Uses_CRM: company.uses_crm,
      CRM_Software: company.crm_software,
      Recommended_Plan: company.recommended_plan,
      Credit_Mediator: company.credit_mediator,
      Bank_Of_Portugal_Link: company.bank_of_portugal_link,
      Financing_Agreements: company.financing_agreements,
      Last_Visit_Date: company.last_visit_date,
      Company_Group: company.company_group,
      Represented_Brands: company.represented_brands,
      Company_Type: company.company_type,
      Wants_CT: company.wants_ct,
      Wants_CRB_Partner: company.wants_crb_partner,
      Autobiz_Info: company.autobiz_info,
      
      stands: []
    });
  });

  standsData.forEach(stand => {
    const company = companiesMap.get(stand.company_db_id);
    if (company) {
      company.stands.push({
        ...stand,
        Stand_ID: stand.stand_id,
        Company_id: stand.company_id_excel,
        Company_Name: stand.company_name,
        NIF: stand.nif,
        Address: stand.address,
        City: stand.city,
        Postal_Code: stand.postal_code,
        Phone: stand.phone,
        Email: stand.email,
        Contact_Person: stand.contact_person,
        Anuncios: stand.anuncios,
        API: stand.api,
        Publicados: stand.publicados,
        Arquivados: stand.arquivados,
        Guardados: stand.guardados,
        Tipo: stand.tipo,
        Delta_Publicados_Last_Day_Month: stand.delta_publicados_last_day_month,
        Leads_Recebidas: stand.leads_recebidas,
        Leads_Pendentes: stand.leads_pendentes,
        Leads_Expiradas: stand.leads_expiradas,
        Leads_Financiadas: stand.leads_financiadas,
        Whatsapp: stand.whatsapp,
      });
    }
  });

  return Array.from(companiesMap.values());
}

/**
 * Fetches companies and their associated stands for the current authenticated user,
 * filtered by a list of Excel company IDs.
 */
export async function fetchCompaniesByExcelCompanyIds(userId: string, excelCompanyIds: string[]): Promise<Company[]> {
  if (excelCompanyIds.length === 0) {
    return [];
  }

  const { data: companiesData, error: companiesError } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', userId)
    .in('company_id', excelCompanyIds); // Filter by company_id (which is the excel_company_id)

  if (companiesError) {
    console.error('Error fetching companies by Excel IDs:', companiesError);
    throw new Error(companiesError.message);
  }

  const companyDbIds = companiesData.map(c => c.id);

  let allStandsData: any[] = [];
  const BATCH_SIZE = 50; // Fetch stands in batches of 50 company IDs to avoid URI Too Long error

  for (let i = 0; i < companyDbIds.length; i += BATCH_SIZE) {
    const batchIds = companyDbIds.slice(i, i + BATCH_SIZE);
    if (batchIds.length === 0) continue;

    const { data: batchStandsData, error: batchStandsError } = await supabase
      .from('stands')
      .select('*')
      .in('company_db_id', batchIds);

    if (batchStandsError) {
      console.error('Error fetching stands in batch for specific companies:', batchStandsError);
      throw new Error(batchStandsError.message);
    }
    allStandsData = allStandsData.concat(batchStandsData);
  }

  const standsData = allStandsData;

  const companiesMap = new Map<string, Company>();
  companiesData.forEach(company => {
    companiesMap.set(company.company_id, { // Use company.company_id (Excel ID) as key for mapping
      Company_id: company.company_id,
      Company_Name: company.company_name,
      NIF: company.nif,
      Company_Email: company.company_email,
      Company_Contact_Person: company.company_contact_person,
      Website: company.website,
      Plafond: company.plafond,
      Supervisor: company.supervisor,
      Is_CRB_Partner: company.is_crb_partner,
      Is_APDCA_Partner: company.is_apdca_partner,
      Creation_Date: company.creation_date,
      Last_Login_Date: company.last_login_date,
      Financing_Simulator_On: company.financing_simulator_on,
      Simulator_Color: company.simulator_color,
      Last_Plan: company.last_plan,
      Plan_Price: company.plan_price,
      Plan_Expiration_Date: company.plan_expiration_date,
      Plan_Active: company.plan_active,
      Plan_Auto_Renewal: company.plan_auto_renewal,
      Current_Bumps: company.current_bumps,
      Total_Bumps: company.total_bumps,
      
      Commercial_Name: company.commercial_name,
      Company_Postal_Code: company.company_postal_code,
      District: company.district,
      Company_City: company.company_city,
      Company_Address: company.company_address,
      AM_Old: company.am_old,
      AM_Current: company.am_current,
      Stock_STV: company.stock_stv,
      Company_API_Info: company.company_api_info,
      Company_Stock: company.company_stock,
      Logo_URL: company.logo_url,
      Classification: company.classification,
      Imported_Percentage: company.imported_percentage,
      Vehicle_Source: company.vehicle_source,
      Competition: company.competition,
      Social_Media_Investment: company.social_media_investment,
      Portal_Investment: company.portal_investment,
      B2B_Market: company.b2b_market,
      Uses_CRM: company.uses_crm,
      CRM_Software: company.crm_software,
      Recommended_Plan: company.recommended_plan,
      Credit_Mediator: company.credit_mediator,
      Bank_Of_Portugal_Link: company.bank_of_portugal_link,
      Financing_Agreements: company.financing_agreements,
      Last_Visit_Date: company.last_visit_date,
      Company_Group: company.company_group,
      Represented_Brands: company.represented_brands,
      Company_Type: company.company_type,
      Wants_CT: company.wants_ct,
      Wants_CRB_Partner: company.wants_crb_partner,
      Autobiz_Info: company.autobiz_info,
      
      stands: []
    });
  });

  standsData.forEach(stand => {
    // Find the company using its Excel ID (company_id_excel)
    const company = companiesMap.get(stand.company_id_excel);
    if (company) {
      company.stands.push({
        ...stand,
        Stand_ID: stand.stand_id,
        Company_id: stand.company_id_excel,
        Company_Name: stand.company_name,
        NIF: stand.nif,
        Address: stand.address,
        City: stand.city,
        Postal_Code: stand.postal_code,
        Phone: stand.phone,
        Email: stand.email,
        Contact_Person: stand.contact_person,
        Anuncios: stand.anuncios,
        API: stand.api,
        Publicados: stand.publicados,
        Arquivados: stand.arquivados,
        Guardados: stand.guardados,
        Tipo: stand.tipo,
        Delta_Publicados_Last_Day_Month: stand.delta_publicados_last_day_month,
        Leads_Recebidas: stand.leads_recebidas,
        Leads_Pendentes: stand.leads_pendentes,
        Leads_Expiradas: stand.leads_expiradas,
        Leads_Financiadas: stand.leads_financiadas,
        Whatsapp: stand.whatsapp,
      });
    }
  });

  return Array.from(companiesMap.values());
}

/**
 * Upserts company data into Supabase.
 * Maps Excel Company_id to Supabase DB UUID.
 */
export async function upsertCompanies(companies: Company[], userId: string): Promise<Map<string, string>> {
  const companyDbIdMap = new Map<string, string>(); // Map Excel Company_id to Supabase DB UUID

  for (const company of companies) {
    const { data: existingCompany, error: fetchError } = await supabase
      .from('companies')
      .select('id')
      .eq('company_id', company.Company_id)
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means "no rows found"
      console.error('Error fetching existing company:', fetchError);
      throw new Error(fetchError.message);
    }

    const companyData = {
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
      total_bumps: company.Total_Bumps,
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
      Credit_Mediator: company.Credit_Mediator,
      Bank_Of_Portugal_Link: company.Bank_Of_Portugal_Link,
      Financing_Agreements: company.Financing_Agreements,
      Last_Visit_Date: company.Last_Visit_Date,
      Company_Group: company.Company_Group,
      Represented_Brands: company.Represented_Brands,
      Company_Type: company.Company_Type,
      Wants_CT: company.Wants_CT,
      Wants_CRB_Partner: company.Wants_CRB_Partner,
      Autobiz_Info: company.Autobiz_Info,
    };

    if (existingCompany) {
      // Update existing company
      const { data, error } = await supabase
        .from('companies')
        .update(companyData)
        .eq('id', existingCompany.id)
        .select('id')
        .single();
      if (error) {
        console.error('Error updating company:', error);
        throw new Error(error.message);
      }
      companyDbIdMap.set(company.Company_id, data.id);
    } else {
      // Insert new company
      const { data, error } = await supabase
        .from('companies')
        .insert(companyData)
        .select('id')
        .single();
      if (error) {
        console.error('Error inserting company:', error);
        throw new Error(error.message);
      }
      companyDbIdMap.set(company.Company_id, data.id);
    }
  }
  return companyDbIdMap;
}

/**
 * Fetches a company by its email for a given user.
 */
export async function fetchCompanyByEmail(userId: string, email: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', userId)
    .eq('company_email', email)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows found"
    console.error('Error fetching company by email:', error);
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  // Map Supabase data to Company type
  return {
    Company_id: data.company_id,
    Company_Name: data.company_name,
    NIF: data.nif,
    Company_Email: data.company_email,
    Company_Contact_Person: data.company_contact_person,
    Website: data.website,
    Plafond: data.plafond,
    Supervisor: data.supervisor,
    Is_CRB_Partner: data.is_crb_partner,
    Is_APDCA_Partner: data.is_apdca_partner,
    Creation_Date: data.creation_date,
    Last_Login_Date: data.last_login_date,
    Financing_Simulator_On: data.financing_simulator_on,
    Simulator_Color: data.simulator_color,
    Last_Plan: data.last_plan,
    Plan_Price: data.plan_price,
    Plan_Expiration_Date: data.plan_expiration_date,
    Plan_Active: data.plan_active,
    Plan_Auto_Renewal: data.plan_auto_renewal,
    Current_Bumps: data.current_bumps,
    Total_Bumps: data.total_bumps,
    Commercial_Name: data.commercial_name,
    Company_Postal_Code: data.company_postal_code,
    District: data.district,
    Company_City: data.company_city,
    Company_Address: data.company_address,
    AM_Old: data.am_old,
    AM_Current: data.am_current,
    Stock_STV: data.stock_stv,
    Company_API_Info: data.company_api_info,
    Company_Stock: data.company_stock,
    Logo_URL: data.logo_url,
    Classification: data.classification,
    Imported_Percentage: data.imported_percentage,
    Vehicle_Source: data.vehicle_source,
    Competition: data.competition,
    Social_Media_Investment: data.social_media_investment,
    Portal_Investment: data.portal_investment,
    B2B_Market: data.b2b_market,
    Uses_CRM: data.uses_crm,
    CRM_Software: data.crm_software,
    Recommended_Plan: data.recommended_plan,
    Credit_Mediator: data.credit_mediator,
    Bank_Of_Portugal_Link: data.bank_of_portugal_link,
    Financing_Agreements: data.financing_agreements,
    Last_Visit_Date: data.last_visit_date,
    Company_Group: data.company_group,
    Represented_Brands: data.represented_brands,
    Company_Type: data.company_type,
    Wants_CT: data.wants_ct,
    Wants_CRB_Partner: data.wants_crb_partner,
    Autobiz_Info: data.autobiz_info,
    stands: [] // Stands are not fetched by this function
  };
}

/**
 * Fetches companies from the main CRM that do not have corresponding additional data entries.
 */
export async function fetchCompaniesMissingAdditionalData(userId: string): Promise<Company[]> {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      company_additional_excel_data!left(
        id
      )
    `)
    .eq('user_id', userId)
    .is('company_additional_excel_data.id', null);

  if (error) {
    console.error('Error fetching companies missing additional data:', error);
    throw new Error(error.message);
  }

  // Filter out the joined `company_additional_excel_data` and map to Company type
  const missingCompanies: Company[] = data
    .filter(item => item.company_additional_excel_data.length === 0) // Ensure no additional data
    .map(item => ({
      Company_id: item.company_id,
      Company_Name: item.company_name,
      NIF: item.nif,
      Company_Email: item.company_email,
      Company_Contact_Person: item.company_contact_person,
      Website: item.website,
      Plafond: item.plafond,
      Supervisor: item.supervisor,
      Is_CRB_Partner: item.is_crb_partner,
      Is_APDCA_Partner: item.is_apdca_partner,
      Creation_Date: item.creation_date,
      Last_Login_Date: item.last_login_date,
      Financing_Simulator_On: item.financing_simulator_on,
      Simulator_Color: item.simulator_color,
      Last_Plan: item.last_plan,
      Plan_Price: item.plan_price,
      Plan_Expiration_Date: item.plan_expiration_date,
      Plan_Active: item.plan_active,
      Plan_Auto_Renewal: item.plan_auto_renewal,
      Current_Bumps: item.current_bumps,
      Total_Bumps: item.total_bumps,
      Commercial_Name: item.commercial_name,
      Company_Postal_Code: item.company_postal_code,
      District: item.district,
      Company_City: item.company_city,
      Company_Address: item.company_address,
      AM_Old: item.am_old,
      AM_Current: item.am_current,
      Stock_STV: item.stock_stv,
      Company_API_Info: item.company_api_info,
      Company_Stock: item.company_stock,
      Logo_URL: item.logo_url,
      Classification: item.classification,
      Imported_Percentage: item.imported_percentage,
      Vehicle_Source: item.vehicle_source,
      Competition: item.competition,
      Social_Media_Investment: item.social_media_investment,
      Portal_Investment: item.portal_investment,
      B2B_Market: item.b2b_market,
      Uses_CRM: item.uses_crm,
      CRM_Software: item.crm_software,
      Recommended_Plan: item.recommended_plan,
      Credit_Mediator: item.credit_mediator,
      Bank_Of_Portugal_Link: item.bank_of_portugal_link,
      Financing_Agreements: item.financing_agreements,
      Last_Visit_Date: item.last_visit_date,
      Company_Group: item.company_group,
      Represented_Brands: item.represented_brands,
      Company_Type: item.company_type,
      Wants_CT: item.wants_ct,
      Wants_CRB_Partner: item.wants_crb_partner,
      Autobiz_Info: item.autobiz_info,
      stands: [] // Stands are not fetched by this function
    }));

  return missingCompanies;
}