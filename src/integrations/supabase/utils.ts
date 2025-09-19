import { supabase } from './client';
import { Company, Stand } from '@/types/crm';

interface ParsedCrmData {
  companies: Company[];
  stands: Stand[];
}

// Fetches all companies and their associated stands for the current authenticated user
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

  const { data: standsData, error: standsError } = await supabase
    .from('stands')
    .select('*')
    .in('company_db_id', companyIds);

  if (standsError) {
    console.error('Error fetching stands:', standsError);
    throw new Error(standsError.message);
  }

  const companiesMap = new Map<string, Company>();
  companiesData.forEach(company => {
    companiesMap.set(company.id, {
      ...company,
      Company_id: company.company_id, // Map DB field to interface field
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
        Company_id: stand.company_id_excel, // Keep original Excel company ID for reference
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

// Upserts company data into Supabase
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
      credit_mediator: company.Credit_Mediator,
      bank_of_portugal_link: company.Bank_Of_Portugal_Link,
      financing_agreements: company.Financing_Agreements,
      last_visit_date: company.Last_Visit_Date,
      company_group: company.Company_Group,
      represented_brands: company.Represented_Brands,
      company_type: company.Company_Type,
      wants_ct: company.Wants_CT,
      wants_crb_partner: company.Wants_CRB_Partner,
      autobiz_info: company.Autobiz_Info,
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

// Upserts stand data into Supabase
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

// Updates specific additional company information
export async function updateCompanyAdditionalInfo(companyIdExcel: string, data: Partial<Company>, userId: string): Promise<void> {
  const { data: existingCompany, error: fetchError } = await supabase
    .from('companies')
    .select('id')
    .eq('company_id', companyIdExcel)
    .eq('user_id', userId)
    .single();

  if (fetchError) {
    console.error(`Company with Excel ID ${companyIdExcel} not found or error fetching:`, fetchError);
    throw new Error(`Company with Excel ID ${companyIdExcel} not found or error fetching: ${fetchError.message}`);
  }

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
  if (data.Autobiz_Info !== undefined) updatePayload.autobiz_info = data.Autobiz_Info;

  if (Object.keys(updatePayload).length === 0) {
    console.warn('No additional company data to update for company:', companyIdExcel);
    return;
  }

  const { error } = await supabase
    .from('companies')
    .update(updatePayload)
    .eq('id', existingCompany.id);

  if (error) {
    console.error('Error updating additional company info:', error);
    throw new Error(error.message);
  }
}