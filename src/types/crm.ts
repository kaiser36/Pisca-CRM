// src/types/crm.ts

export interface Company {
  id: string;
  created_at: string;
  user_id: string;
  company_id: string; // Changed from Company_id
  company_name: string; // Changed from Company_Name
  nif: string; // Changed from NIF
  company_email: string; // Changed from Company_Email
  company_contact_person: string; // Changed from Company_Contact_Person
  website: string; // Changed from Website
  plafond: number; // Changed from Plafond
  supervisor: string; // Changed from Supervisor
  is_crb_partner: boolean; // Changed from Is_CRB_Partner
  is_apdca_partner: boolean; // Changed from Is_APDCA_Partner
  creation_date: string; // Changed from Creation_Date
  last_login_date: string; // Changed from Last_Login_Date
  financing_simulator_on: boolean; // Changed from Financing_Simulator_On
  simulator_color: string; // Changed from Simulator_Color
  last_plan: string; // Changed from Last_Plan
  plan_price: number; // Changed from Plan_Price
  plan_expiration_date: string; // Changed from Plan_Expiration_Date
  plan_active: boolean; // Changed from Plan_Active
  plan_auto_renewal: boolean; // Changed from Plan_Auto_Renewal
  current_bumps: number; // Changed from Current_Bumps
  total_bumps: number; // Changed from Total_Bumps
  commercial_name: string; // Changed from Commercial_Name
  company_postal_code: string; // Changed from Company_Postal_Code
  district: string; // Changed from District
  company_city: string; // Changed from Company_City
  company_address: string; // Changed from Company_Address
  am_old: string; // Changed from AM_Old
  am_current: string; // Changed from AM_Current
  stock_stv: number; // Changed from Stock_STV
  company_api_info: string; // Changed from Company_API_Info
  company_stock: number; // Changed from Company_Stock
  logo_url: string; // Changed from Logo_URL
  classification: string; // Changed from Classification
  imported_percentage: number; // Changed from Imported_Percentage
  vehicle_source: string; // Changed from Vehicle_Source
  competition: string; // Changed from Competition
  social_media_investment: number; // Changed from Social_Media_Investment
  portal_investment: number; // Changed from Portal_Investment
  b2b_market: boolean; // Changed from B2B_Market
  uses_crm: boolean; // Changed from Uses_CRM
  crm_software: string; // Changed from CRM_Software
  recommended_plan: string; // Changed from Recommended_Plan
  credit_mediator: boolean; // Changed from Credit_Mediator
  bank_of_portugal_link: string; // Changed from Bank_Of_Portugal_Link
  financing_agreements: string; // Changed from Financing_Agreements
  last_visit_date: string; // Changed from Last_Visit_Date
  company_group: string; // Changed from Company_Group
  represented_brands: string; // Changed from Represented_Brands
  company_type: string; // Changed from Company_Type
  wants_ct: boolean; // Changed from Wants_CT
  wants_crb_partner: boolean; // Changed from Wants_CRB_Partner
  autobiz_info: string; // Changed from Autobiz_Info
  stand_name: string; // Changed from Stand_Name
}

export interface CompanyAdditionalExcelData {
  id: string;
  created_at: string;
  user_id: string;
  company_db_id: string | null;
  excel_company_id: string;
  "Nome Comercial": string;
  "Email da empresa": string;
  STAND_POSTAL_CODE: string;
  Distrito: string;
  Cidade: string;
  Morada: string;
  AM_OLD: string;
  AM: string;
  "Stock STV": number;
  API: string;
  Site: string;
  "Stock na empresa": number;
  Logotipo: string;
  Classificação: string;
  "Percentagem de Importados": number;
  "Onde compra as viaturas": string;
  Concorrencia: string;
  "Investimento redes sociais": number;
  "Investimento em portais": number;
  "Mercado b2b": boolean;
  "Utiliza CRM": boolean;
  "Qual o CRM": string;
  "Plano Indicado": string;
  "Mediador de credito": boolean;
  "Link do Banco de Portugal": string;
  "Financeiras com acordo": string;
  "Data ultima visita": string;
  Grupo: string;
  "Marcas representadas": string;
  "Tipo de empresa": string;
  "Quer CT": boolean;
  "Quer ser parceiro Credibom": boolean;
  Autobiz: string;
}

export interface Account {
  id: string;
  created_at: string;
  user_id: string;
  account_name: string;
  email: string;
  phone_number: string | null;
  role: string;
  am: string | null;
  district: string | null;
}

export interface Product {
  id: string;
  created_at: string;
  user_id: string;
  produto: string;
  categoria: string;
  unidade: string;
  preco_unitario: number;
  preco_total: number;
}

export interface Campaign {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  type: string;
  description: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  target_audience: string | null;
  budget: number | null;
  category: string | null;
}

export interface EasyvistaType {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  display_fields: string[];
}