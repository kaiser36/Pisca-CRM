"use client";

import React, { createContext, useState, useContext, useCallback } from 'react';
import { Company, Stand } from '@/types/crm';
import { parseStandsExcel } from '@/lib/excel-parser';
import { showSuccess, showError } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client

interface CrmContextType {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
  updateCrmData: (newCompanies: Company[]) => Promise<void>; // Changed to return Promise<void>
  loadInitialData: () => Promise<void>;
}

const CrmDataContext = createContext<CrmContextType | undefined>(undefined);

export const CrmDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Placeholder user_id for now. This should come from Supabase auth.uid()
  // once authentication is implemented.
  const currentUserId = "00000000-0000-0000-0000-000000000000"; // Replace with actual auth.uid()

  const fetchCompaniesFromSupabase = useCallback(async () => {
    const { data: companiesData, error: companiesError } = await supabase
      .from('companies')
      .select('*, stands(*)') // Select companies and their related stands
      .eq('user_id', currentUserId); // Filter by user_id for RLS

    if (companiesError) {
      throw new Error(companiesError.message);
    }

    // Map Supabase data back to your Company/Stand types
    const fetchedCompanies: Company[] = companiesData.map((company: any) => ({
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
      stands: company.stands.map((stand: any) => ({
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
      })),
    }));
    return fetchedCompanies;
  }, [currentUserId]);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedCompanies = await fetchCompaniesFromSupabase();
      if (fetchedCompanies.length > 0) {
        setCompanies(fetchedCompanies);
        showSuccess("Dados CRM carregados do Supabase com sucesso!");
      } else {
        // If no data in Supabase, load from initial Excel file (if available)
        const data = await parseStandsExcel('/Stands_Pisca.xlsx');
        setCompanies(data);
        showSuccess("Dados CRM carregados do ficheiro inicial com sucesso!");
        // Optionally, save this initial data to Supabase
        await updateCrmData(data);
      }
    } catch (err: any) {
      console.error("Falha ao carregar os dados iniciais do CRM:", err);
      setError(`Falha ao carregar os dados iniciais do CRM: ${err.message}`);
      showError("Falha ao carregar os dados iniciais do CRM.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchCompaniesFromSupabase]);

  const updateCrmData = useCallback(async (newCompanies: Company[]) => {
    setIsLoading(true);
    setError(null);
    try {
      for (const company of newCompanies) {
        // Upsert company data
        const { data: companyUpserted, error: companyError } = await supabase
          .from('companies')
          .upsert({
            user_id: currentUserId,
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
          }, { onConflict: 'company_id' }) // Conflict on company_id to update existing
          .select('id') // Select the internal DB ID
          .single();

        if (companyError) {
          throw new Error(`Erro ao guardar empresa ${company.Company_Name}: ${companyError.message}`);
        }

        const companyDbId = companyUpserted.id;

        // Delete existing stands for this company to avoid duplicates before inserting new ones
        const { error: deleteStandsError } = await supabase
          .from('stands')
          .delete()
          .eq('company_db_id', companyDbId);

        if (deleteStandsError) {
          throw new Error(`Erro ao eliminar stands antigos para ${company.Company_Name}: ${deleteStandsError.message}`);
        }

        // Insert new stands
        const standsToInsert = company.stands.map(stand => ({
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
        }));

        const { error: standsError } = await supabase
          .from('stands')
          .insert(standsToInsert);

        if (standsError) {
          throw new Error(`Erro ao guardar stands para ${company.Company_Name}: ${standsError.message}`);
        }
      }
      setCompanies(newCompanies);
      showSuccess("Dados CRM atualizados e guardados no Supabase com sucesso!");
    } catch (err: any) {
      console.error("Falha ao atualizar os dados do CRM no Supabase:", err);
      setError(`Falha ao atualizar os dados do CRM: ${err.message}`);
      showError("Falha ao atualizar os dados do CRM.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return (
    <CrmDataContext.Provider value={{ companies, isLoading, error, updateCrmData, loadInitialData }}>
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