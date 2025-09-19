"use client";

import React, { createContext, useState, useContext, useCallback } from 'react';
import { Company, Stand, EditableCompanyData } from '@/types/crm';
import { parseStandsExcel } from '@/lib/excel-parser';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { useSession } from './SessionContext'; // Caminho relativo correto

interface CrmContextType {
  companies: Company[];
  isLoading: boolean;
  error: string | null;
  loadCrmDataFromSupabase: () => Promise<void>;
  uploadInitialCrmData: (file: File) => Promise<void>;
  updateCompaniesFromExcel: (editableData: EditableCompanyData[]) => Promise<void>;
}

const CrmDataContext = createContext<CrmContextType | undefined>(undefined);

// Define a type for the stand data to be inserted into Supabase
interface SupabaseStandInsert {
  company_db_id: string;
  stand_id: string;
  company_id_excel: string;
  company_name: string;
  nif: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
  email: string;
  contact_person: string;
  anuncios: number;
  api: number;
  publicados: number;
  arquivados: number;
  guardados: number;
  tipo: string;
  delta_publicados_last_day_month: number;
  leads_recebidas: number;
  leads_pendentes: number;
  leads_expiradas: number;
  leads_financiadas: number;
  whatsapp: string;
}

export const CrmDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCrmDataFromSupabase = useCallback(async () => {
    if (!user) {
      setCompanies([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id);

      if (companiesError) throw companiesError;

      const { data: standsData, error: standsError } = await supabase
        .from('stands')
        .select('*'); // RLS will ensure only stands of user's companies are returned

      if (standsError) throw standsError;

      const companiesMap = new Map<string, Company>();
      companiesData.forEach(dbCompany => {
        companiesMap.set(dbCompany.id, {
          id: dbCompany.id,
          Company_id: dbCompany.company_id,
          Company_Name: dbCompany.company_name,
          NIF: dbCompany.nif,
          Company_Email: dbCompany.company_email,
          Company_Contact_Person: dbCompany.company_contact_person,
          Website: dbCompany.website,
          Plafond: parseFloat(dbCompany.plafond), // Convert numeric string to number
          Supervisor: dbCompany.supervisor,
          Is_CRB_Partner: dbCompany.is_crb_partner,
          Is_APDCA_Partner: dbCompany.is_apdca_partner,
          Creation_Date: dbCompany.creation_date,
          Last_Login_Date: dbCompany.last_login_date,
          Financing_Simulator_On: dbCompany.financing_simulator_on,
          Simulator_Color: dbCompany.simulator_color,
          Last_Plan: dbCompany.last_plan,
          Plan_Price: parseFloat(dbCompany.plan_price), // Convert numeric string to number
          Plan_Expiration_Date: dbCompany.plan_expiration_date,
          Plan_Active: dbCompany.plan_active,
          Plan_Auto_Renewal: dbCompany.plan_auto_renewal,
          Current_Bumps: dbCompany.current_bumps,
          Total_Bumps: dbCompany.total_bumps,
          stands: [],
        });
      });

      standsData.forEach(dbStand => {
        const company = companiesMap.get(dbStand.company_db_id);
        if (company) {
          company.stands.push({
            Stand_ID: dbStand.stand_id,
            Company_id: dbStand.company_id_excel, // Use original Excel company ID
            Company_Name: dbStand.company_name,
            NIF: dbStand.nif,
            Address: dbStand.address,
            City: dbStand.city,
            Postal_Code: dbStand.postal_code,
            Phone: dbStand.phone,
            Email: dbStand.email,
            Contact_Person: dbStand.contact_person,
            Anuncios: dbStand.anuncios,
            API: dbStand.api,
            Publicados: dbStand.publicados,
            Arquivados: dbStand.arquivados,
            Guardados: dbStand.guardados,
            Tipo: dbStand.tipo,
            Delta_Publicados_Last_Day_Month: dbStand.delta_publicados_last_day_month,
            Leads_Recebidas: dbStand.leads_recebidas,
            Leads_Pendentes: dbStand.leads_pendentes,
            Leads_Expiradas: dbStand.leads_expiradas,
            Leads_Financiadas: dbStand.leads_financiadas,
            Whatsapp: dbStand.whatsapp,
          });
        }
      });

      setCompanies(Array.from(companiesMap.values()));
      showSuccess("Dados CRM carregados do Supabase com sucesso!");
    } catch (err: any) {
      console.error("Failed to load CRM data from Supabase:", err);
      setError(`Falha ao carregar os dados do CRM: ${err.message}`);
      showError("Falha ao carregar os dados do CRM.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const uploadInitialCrmData = useCallback(async (file: File) => {
    if (!user) {
      showError("Utilizador não autenticado. Por favor, faça login.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const parsedCompanies = await parseStandsExcel(arrayBuffer);

      // Clear existing data for the user before uploading new data
      const { error: deleteStandsError } = await supabase
        .from('stands')
        .delete()
        .in('company_db_id', companies.filter(c => c.id && c.stands.length > 0).map(c => c.id)); // Delete stands of current user's companies

      if (deleteStandsError) throw deleteStandsError;

      const { error: deleteCompaniesError } = await supabase
        .from('companies')
        .delete()
        .eq('user_id', user.id);

      if (deleteCompaniesError) throw deleteCompaniesError;

      const newCompaniesToInsert = parsedCompanies.map(company => ({
        user_id: user.id,
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
      }));

      const { data: insertedCompanies, error: insertCompaniesError } = await supabase
        .from('companies')
        .insert(newCompaniesToInsert)
        .select();

      if (insertCompaniesError) throw insertCompaniesError;

      const standsToInsert: SupabaseStandInsert[] = []; // Using the new interface
      for (const parsedCompany of parsedCompanies) {
        const matchingInsertedCompany = insertedCompanies.find(
          (c: any) => c.company_id === parsedCompany.Company_id
        );
        if (matchingInsertedCompany) {
          parsedCompany.stands.forEach(stand => {
            standsToInsert.push({
              company_db_id: matchingInsertedCompany.id,
              stand_id: stand.Stand_ID,
              company_id_excel: stand.Company_id, // Store original Excel company ID
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
            });
          });
        }
      }

      const { error: insertStandsError } = await supabase
        .from('stands')
        .insert(standsToInsert);

      if (insertStandsError) throw insertStandsError;

      await loadCrmDataFromSupabase(); // Reload data from Supabase
      showSuccess("Dados CRM carregados e guardados no Supabase com sucesso!");
    } catch (err: any) {
      console.error("Erro ao carregar dados CRM para Supabase:", err);
      setError(`Falha ao carregar dados CRM: ${err.message}`);
      showError("Falha ao carregar dados CRM.");
    } finally {
      setIsLoading(false);
    }
  }, [user, loadCrmDataFromSupabase, companies]);


  const updateCompaniesFromExcel = useCallback(async (editableData: EditableCompanyData[]) => {
    if (!user) {
      showError("Utilizador não autenticado. Por favor, faça login.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      for (const data of editableData) {
        const { Company_id, ...fieldsToUpdate } = data;

        // Find the company in Supabase using the Excel Company_id
        const { data: existingCompany, error: fetchError } = await supabase
          .from('companies')
          .select('id')
          .eq('company_id', Company_id)
          .eq('user_id', user.id) // Ensure user owns the company
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
          throw fetchError;
        }

        if (existingCompany) {
          // Map fields from EditableCompanyData to Supabase table column names
          const supabaseUpdateData = {
            company_name: fieldsToUpdate.Company_Name,
            nif: fieldsToUpdate.NIF,
            company_email: fieldsToUpdate.Company_Email,
            company_contact_person: fieldsToUpdate.Company_Contact_Person,
            website: fieldsToUpdate.Website,
            plafond: fieldsToUpdate.Plafond,
            supervisor: fieldsToUpdate.Supervisor,
            is_crb_partner: fieldsToUpdate.Is_CRB_Partner,
            is_apdca_partner: fieldsToUpdate.Is_APDCA_Partner,
            creation_date: fieldsToUpdate.Creation_Date,
            last_login_date: fieldsToUpdate.Last_Login_Date,
            financing_simulator_on: fieldsToUpdate.Financing_Simulator_On,
            simulator_color: fieldsToUpdate.Simulator_Color,
            last_plan: fieldsToUpdate.Last_Plan,
            plan_price: fieldsToUpdate.Plan_Price,
            plan_expiration_date: fieldsToUpdate.Plan_Expiration_Date,
            plan_active: fieldsToUpdate.Plan_Active,
            plan_auto_renewal: fieldsToUpdate.Plan_Auto_Renewal,
            current_bumps: fieldsToUpdate.Current_Bumps,
            total_bumps: fieldsToUpdate.Total_Bumps,
          };

          const { error: updateError } = await supabase
            .from('companies')
            .update(supabaseUpdateData)
            .eq('id', existingCompany.id)
            .eq('user_id', user.id); // Ensure user owns the company

          if (updateError) throw updateError;
        } else {
          console.warn(`Empresa com Company_ID '${Company_id}' não encontrada para atualização.`);
        }
      }
      await loadCrmDataFromSupabase(); // Reload data after updates
      showSuccess("Campos editáveis das empresas atualizados no Supabase com sucesso!");
    } catch (err: any) {
      console.error("Erro ao atualizar campos editáveis das empresas no Supabase:", err);
      setError(`Falha ao atualizar campos editáveis: ${err.message}`);
      showError("Falha ao atualizar campos editáveis das empresas.");
    } finally {
      setIsLoading(false);
    }
  }, [user, loadCrmDataFromSupabase]);


  React.useEffect(() => {
    if (!isSessionLoading && user) {
      loadCrmDataFromSupabase();
    } else if (!isSessionLoading && !user) {
      setCompanies([]);
      setIsLoading(false);
    }
  }, [user, isSessionLoading, loadCrmDataFromSupabase]);

  return (
    <CrmDataContext.Provider value={{ companies, isLoading: isLoading || isSessionLoading, error, loadCrmDataFromSupabase, uploadInitialCrmData, updateCompaniesFromExcel }}>
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