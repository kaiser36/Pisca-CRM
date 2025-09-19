"use client";

import React, { createContext, useState, useContext, useCallback } from 'react';
import { Company, Stand } from '@/types/crm';
import { parseStandsExcel, parseCompanyDetailsExcel } from '@/lib/excel-parser';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client
import { useSession } from '@/components/auth/SessionContextProvider'; // Import useSession

interface CrmContextType {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
  updateCrmData: (newCompanies: Company[]) => Promise<void>;
  updateCompanyDetails: (detailsMap: Map<string, Partial<Company>>) => Promise<void>;
  loadInitialData: () => Promise<void>;
}

const CrmDataContext = createContext<CrmContextType | undefined>(undefined);

export const CrmDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, isLoading: isSessionLoading } = useSession(); // Get session from context
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompaniesFromSupabase = useCallback(async (userId: string) => {
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select('*, stands(*)') // Select companies and their related stands
      .eq('user_id', userId) // Filter by user_id for explicit RLS compliance
      .order('company_name', { ascending: true });

    if (companiesError) {
      throw companiesError;
    }

    // Map Supabase data to your Company interface
    const mappedCompanies: Company[] = companiesData.map(dbCompany => ({
      Company_id: dbCompany.company_id,
      Company_Name: dbCompany.company_name,
      NIF: dbCompany.nif || '',
      Company_Email: dbCompany.company_email || '',
      Company_Contact_Person: dbCompany.company_contact_person || '',
      Website: dbCompany.website || '',
      Plafond: parseFloat(dbCompany.plafond) || 0,
      Supervisor: dbCompany.supervisor || '',
      Is_CRB_Partner: dbCompany.is_crb_partner,
      Is_APDCA_Partner: dbCompany.is_apdca_partner,
      Creation_Date: dbCompany.creation_date || '',
      Last_Login_Date: dbCompany.last_login_date || '',
      Financing_Simulator_On: dbCompany.financing_simulator_on,
      Simulator_Color: dbCompany.simulator_color || '',
      Last_Plan: dbCompany.last_plan || '',
      Plan_Price: parseFloat(dbCompany.plan_price) || 0,
      Plan_Expiration_Date: dbCompany.plan_expiration_date || '',
      Plan_Active: dbCompany.plan_active,
      Plan_Auto_Renewal: dbCompany.plan_auto_renewal,
      Current_Bumps: dbCompany.current_bumps || 0,
      Total_Bumps: dbCompany.total_bumps || 0,
      stands: dbCompany.stands.map((dbStand: any) => ({
        Stand_ID: dbStand.stand_id,
        Company_id: dbStand.company_id_excel,
        Company_Name: dbStand.company_name,
        NIF: dbStand.nif || '',
        Address: dbStand.address || '',
        City: dbStand.city || '',
        Postal_Code: dbStand.postal_code || '',
        Phone: dbStand.phone || '',
        Email: dbStand.email || '',
        Contact_Person: dbStand.contact_person || '',
        Anuncios: dbStand.anuncios || 0,
        API: dbStand.api || 0,
        Publicados: dbStand.publicados || 0,
        Arquivados: dbStand.arquivados || 0,
        Guardados: dbStand.guardados || 0,
        Tipo: dbStand.tipo || '',
        Delta_Publicados_Last_Day_Month: dbStand.delta_publicados_last_day_month || 0,
        Leads_Recebidas: dbStand.leads_recebidas || 0,
        Leads_Pendentes: dbStand.leads_pendentes || 0,
        Leads_Expiradas: dbStand.leads_expiradas || 0,
        Leads_Financiadas: dbStand.leads_financiadas || 0,
        Whatsapp: dbStand.whatsapp || '',
      })),
      // Map new fields
      Commercial_Name: dbCompany.commercial_name || '',
      Company_Postal_Code: dbCompany.company_postal_code || '',
      District: dbCompany.district || '',
      Company_City: dbCompany.company_city || '',
      Company_Address: dbCompany.company_address || '',
      AM_OLD: dbCompany.am_old || '',
      AM_Current: dbCompany.am_current || '',
      Stock_STV: dbCompany.stock_stv || 0,
      Company_API_Info: dbCompany.company_api_info || '',
      Company_Stock: dbCompany.company_stock || 0,
      Logo_URL: dbCompany.logo_url || '',
      Classification: dbCompany.classification || '',
      Imported_Percentage: parseFloat(dbCompany.imported_percentage) || 0,
      Vehicle_Source: dbCompany.vehicle_source || '',
      Competition: dbCompany.competition || '',
      Social_Media_Investment: parseFloat(dbCompany.social_media_investment) || 0,
      Portal_Investment: parseFloat(dbCompany.portal_investment) || 0,
      B2B_Market: dbCompany.b2b_market,
      Uses_CRM: dbCompany.uses_crm,
      CRM_Software: dbCompany.crm_software || '',
      Recommended_Plan: dbCompany.recommended_plan || '',
      Credit_Mediator: dbCompany.credit_mediator,
      Bank_of_Portugal_Link: dbCompany.bank_of_portugal_link || '',
      Financing_Agreements: dbCompany.financing_agreements || '',
      Last_Visit_Date: dbCompany.last_visit_date || '',
      Company_Group: dbCompany.company_group || '',
      Represented_Brands: dbCompany.represented_brands || '',
      Company_Type: dbCompany.company_type || '',
      Wants_CT: dbCompany.wants_ct,
      Wants_CRB_Partner: dbCompany.wants_crb_partner,
      Autobiz_Info: dbCompany.autobiz_info || '',
    }));

    return mappedCompanies;
  }, []);

  const saveCompaniesToSupabase = useCallback(async (companiesToSave: Company[], userId: string) => {
    const companyInserts = companiesToSave.map(company => ({
      user_id: userId, // Use actual authenticated user ID
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
      // New fields
      commercial_name: company.Commercial_Name,
      company_postal_code: company.Company_Postal_Code,
      district: company.District,
      company_city: company.Company_City,
      company_address: company.Company_Address,
      am_old: company.AM_OLD,
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
      bank_of_portugal_link: company.Bank_of_Portugal_Link,
      financing_agreements: company.Financing_Agreements,
      last_visit_date: company.Last_Visit_Date,
      company_group: company.Company_Group,
      represented_brands: company.Represented_Brands,
      company_type: company.Company_Type,
      wants_ct: company.Wants_CT,
      wants_crb_partner: company.Wants_CRB_Partner,
      autobiz_info: company.Autobiz_Info,
    }));

    const { data: upsertedCompanies, error: upsertError } = await supabase
      .from('companies')
      .upsert(companyInserts, { onConflict: 'company_id', ignoreDuplicates: false })
      .select('id, company_id'); // Select the internal DB ID and company_id

    if (upsertError) {
      throw upsertError;
    }

    if (upsertedCompanies) {
      for (const company of companiesToSave) {
        const dbCompany = upsertedCompanies.find(uc => uc.company_id === company.Company_id);
        if (dbCompany) {
          const standInserts = company.stands.map(stand => ({
            company_db_id: dbCompany.id,
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
          }));

          const { error: standUpsertError } = await supabase
            .from('stands')
            .upsert(standInserts, { onConflict: 'stand_id, company_db_id', ignoreDuplicates: false });

          if (standUpsertError) {
            console.error(`Error upserting stands for company ${company.Company_id}:`, standUpsertError);
            throw standUpsertError;
          }
        }
      }
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    if (!session?.user?.id) {
      setIsLoading(false);
      return; // Do not load data if no user is authenticated
    }

    setIsLoading(true);
    setError(null);
    try {
      const fetchedCompanies = await fetchCompaniesFromSupabase(session.user.id);
      if (fetchedCompanies.length === 0) {
        // If no data in Supabase for this user, load from static Excel and save
        const initialExcelData = await parseStandsExcel('/Stands_Pisca.xlsx');
        if (initialExcelData.length > 0) {
          await saveCompaniesToSupabase(initialExcelData, session.user.id);
          setCompanies(initialExcelData);
          showSuccess("Dados CRM carregados do Excel inicial e guardados no Supabase!");
        } else {
          setCompanies([]);
          showSuccess("Nenhum dado CRM encontrado ou carregado.");
        }
      } else {
        setCompanies(fetchedCompanies);
        showSuccess("Dados CRM carregados do Supabase com sucesso!");
      }
    } catch (err: any) {
      console.error("Failed to load initial CRM data:", err);
      setError(`Falha ao carregar os dados iniciais do CRM: ${err.message}. Por favor, tente novamente.`);
      showError("Falha ao carregar os dados iniciais do CRM.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchCompaniesFromSupabase, saveCompaniesToSupabase, session?.user?.id]);

  const updateCrmData = useCallback(async (newCompanies: Company[]) => {
    if (!session?.user?.id) {
      showError("Não autenticado. Por favor, inicie sessão para atualizar os dados.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await saveCompaniesToSupabase(newCompanies, session.user.id);
      const updatedCompanies = await fetchCompaniesFromSupabase(session.user.id); // Re-fetch to ensure consistency
      setCompanies(updatedCompanies);
      showSuccess("Dados CRM atualizados e guardados no Supabase com sucesso!");
    } catch (err: any) {
      console.error("Erro ao atualizar dados CRM:", err);
      setError(`Falha ao atualizar os dados CRM: ${err.message}.`);
      showError("Falha ao atualizar os dados CRM.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchCompaniesFromSupabase, saveCompaniesToSupabase, session?.user?.id]);

  const updateCompanyDetails = useCallback(async (detailsMap: Map<string, Partial<Company>>) => {
    if (!session?.user?.id) {
      showError("Não autenticado. Por favor, inicie sessão para atualizar os detalhes da empresa.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const updates = Array.from(detailsMap.entries()).map(async ([companyId, details]) => {
        // Find the company's internal DB ID using its company_id_excel
        const { data: existingCompany, error: fetchError } = await supabase
          .from('companies')
          .select('id')
          .eq('company_id', companyId)
          .eq('user_id', session.user.id) // Ensure RLS is respected when fetching
          .single();

        if (fetchError || !existingCompany) {
          console.warn(`Company with Company_id ${companyId} not found for user ${session.user.id}, skipping update.`);
          return; // Skip if company not found or not owned by user
        }

        const { error: updateError } = await supabase
          .from('companies')
          .update({
            commercial_name: details.Commercial_Name,
            company_postal_code: details.Company_Postal_Code,
            district: details.District,
            company_city: details.Company_City,
            company_address: details.Company_Address,
            am_old: details.AM_OLD,
            am_current: details.AM_Current,
            stock_stv: details.Stock_STV,
            company_api_info: details.Company_API_Info,
            company_stock: details.Company_Stock,
            logo_url: details.Logo_URL,
            classification: details.Classification,
            imported_percentage: details.Imported_Percentage,
            vehicle_source: details.Vehicle_Source,
            competition: details.Competition,
            social_media_investment: details.Social_Media_Investment,
            portal_investment: details.Portal_Investment,
            b2b_market: details.B2B_Market,
            uses_crm: details.Uses_CRM,
            crm_software: details.CRM_Software,
            recommended_plan: details.Recommended_Plan,
            credit_mediator: details.Credit_Mediator,
            bank_of_portugal_link: details.Bank_of_Portugal_Link,
            financing_agreements: details.Financing_Agreements,
            last_visit_date: details.Last_Visit_Date,
            company_group: details.Company_Group,
            represented_brands: details.Represented_Brands,
            company_type: details.Company_Type,
            wants_ct: details.Wants_CT,
            wants_crb_partner: details.Wants_CRB_Partner,
            autobiz_info: details.Autobiz_Info,
            // Also update existing fields if they are present in the new Excel
            company_email: details.Company_Email || undefined,
            website: details.Website || undefined,
          })
          .eq('id', existingCompany.id)
          .eq('user_id', session.user.id); // Ensure RLS is respected when updating

        if (updateError) {
          console.error(`Error updating company ${companyId}:`, updateError);
          throw updateError;
        }
      });

      await Promise.all(updates);
      const updatedCompanies = await fetchCompaniesFromSupabase(session.user.id); // Re-fetch all data
      setCompanies(updatedCompanies);
      showSuccess("Detalhes da empresa atualizados e guardados no Supabase com sucesso!");
    } catch (err: any) {
      console.error("Erro ao atualizar detalhes da empresa:", err);
      setError(`Falha ao atualizar os detalhes da empresa: ${err.message}.`);
      showError("Falha ao atualizar os detalhes da empresa.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchCompaniesFromSupabase, session?.user?.id]);


  React.useEffect(() => {
    if (!isSessionLoading) {
      loadInitialData();
    }
  }, [loadInitialData, isSessionLoading]);

  // Only render children if session is loaded and CrmData is loaded
  if (isSessionLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <CrmDataContext.Provider value={{ companies, isLoading, error, updateCrmData, updateCompanyDetails, loadInitialData }}>
      {children}
    </CrmDataContext.Provider>
  );
};

export const useCrmData = () => {
  const context = useContext(CrmDataContext);
  if (context === undefined) {
    throw new Error('useCrmData must be used within a CrmDataProvider');
  }
  return context;
};