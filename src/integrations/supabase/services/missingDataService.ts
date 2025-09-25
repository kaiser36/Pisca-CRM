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

  // Call the PostgreSQL function to get the IDs of companies missing additional data
  const { data: companyIdsData, error: rpcError } = await supabase.rpc('get_companies_missing_additional_data', { p_user_id: userId });

  if (rpcError) {
    console.error('Error calling RPC function get_companies_missing_additional_data:', rpcError);
    throw new Error(rpcError.message);
  }

  // The RPC function returns an array of objects, each with a key matching the function name.
  // We need to extract the UUIDs from these objects and filter out any invalid values.
  const missingCompanyDbIds = companyIdsData
    .map((row: { get_companies_missing_additional_data: string | null | undefined }) => row.get_companies_missing_additional_data)
    .filter((id): id is string => typeof id === 'string' && id.trim() !== ''); // Filter out null, undefined, and empty strings

  if (missingCompanyDbIds.length === 0) {
    return []; // No companies missing additional data or no valid IDs returned
  }

  // Now fetch the full company details for these IDs
  const { data: companiesData, error: companiesError } = await supabase
    .from('companies')
    .select('*')
    .in('id', missingCompanyDbIds)
    .eq('user_id', userId); // Add user_id filter for extra security and RLS

  if (companiesError) {
    console.error('Error fetching companies details:', companiesError);
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
    autobiz_info: company.autobiz_info, // Updated to snake_case
    Stand_Name: company.stand_name, // NEW
    stands: []
  }));
}