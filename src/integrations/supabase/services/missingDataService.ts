import { supabase } from '../client';
import { Company } from '@/types/crm';

/**
 * Fetches companies from the main CRM (companies table) that do not have
 * a corresponding entry in the additional company data (company_additional_excel_data table)
 * based on the company email for the authenticated user.
 */
export async function fetchCompaniesMissingAdditionalData(userId: string): Promise<Company[]> {
  if (!userId) {
    throw new Error("User ID is required to fetch missing additional data.");
  }

  // Step 1: Fetch all emails from company_additional_excel_data for the current user
  const { data: additionalEmailsData, error: additionalEmailsError } = await supabase
    .from('company_additional_excel_data')
    .select('"Email da empresa"')
    .eq('user_id', userId);

  if (additionalEmailsError) {
    console.error('Error fetching additional company emails:', additionalEmailsError);
    throw new Error(additionalEmailsError.message);
  }

  const existingAdditionalEmails = additionalEmailsData
    .map(row => row['Email da empresa'])
    .filter((email): email is string => typeof email === 'string' && email.length > 0);

  // Step 2: Fetch companies from the main 'companies' table that are NOT in the list of existing additional emails
  let query = supabase
    .from('companies')
    .select('*')
    .eq('user_id', userId);

  if (existingAdditionalEmails.length > 0) {
    query = query.not('company_email', 'in', existingAdditionalEmails);
  }
  // If existingAdditionalEmails is empty, it means no additional data exists, so all companies are "missing"
  // The query will naturally return all companies for the user in this case.

  const { data: companiesData, error: companiesError } = await query;

  if (companiesError) {
    console.error('Error fetching companies missing additional data:', companiesError);
    throw new Error(companiesError.message);
  }

  // Map Supabase data to Company type
  return companiesData.map(company => ({
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
    stands: [] // Stands are not fetched by this function
  }));
}