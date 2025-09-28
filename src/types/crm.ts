export interface Stand {
  Stand_ID: string;
  Company_id: string;
  Company_Name: string; // Nome fiscal da empresa
  NIF: string; // NIF da empresa
  Address: string; // Morada do stand
  City: string; // Cidade do stand
  Postal_Code: string; // Código postal do stand
  Phone: string; // Telefone do stand
  Email: string; // Email do stand
  Contact_Person: string; // Nome da pessoa de contacto do stand
  Anuncios: number; // Quantos anuncios no Pisca Pisca esse stand tem
  API: number; // Quantos anuncios estão a ser exportados por API para esse stand
  Publicados: number; // Quantos anuncios estão publicados no Pisca Pisca
  Arquivados: number; // Quantos anuncios estão arquivados no Pisca Pisca
  Guardados: number; // Quantos anuncios estão guardados no Pisca Pisca
  Tipo: string; // informação do Tipo de empresa
  Delta_Publicados_Last_Day_Month: number; // diferença entre os anuncios que estão publicados no stand este mês para o mês passado
  Leads_Recebidas: number; // Numero de leads recebidas no Pisca Pisca pelo stand
  Leads_Pendentes: number; // Numero de leads pendentes pelo stand
  leads_expiradas: number; // Numero de leads expiradas pelo stand
  Leads_Financiadas: number; // Numero de leads financiadas pelo stand
  Whatsapp: string; // Numero de Whatsapp de cada stand
  Stand_Name?: string; // Nome comercial do ponto de venda
}

export interface Company {
  id?: string; // NEW: Adicionado o ID interno da base de dados (UUID)
  Company_id: string;
  Company_Name: string; // Nome fiscal da empresa
  NIF: string; // NIF da empresa
  Company_Email: string; // Email da empresa (Company Person Email)
  Company_Contact_Person: string; // Nome da pessoa que registou a conta (Company Person)
  Website: string; // Website da empresa
  Plafond: number; // Plafond disponivel na conta Pisca Pisca referente a empresa
  Supervisor: string; // Dcom Credibom referente a empresa
  Is_CRB_Partner: boolean; // Se a empresa é parceiro Credibom (1 = true, 0/vazio = false)
  Is_APDCA_Partner: boolean; // Informação se a empresa é APDCA ou não
  Creation_Date: string; // data da criação da conta da empresa no Pisca Pisca
  Last_Login_Date: string; // data do ultimo login na conta da empresa
  Financing_Simulator_On: boolean; // Se a empresa tem o Simulador de Financiamento ativo
  Simulator_Color: string; // indicação da Cor do simulador
  Last_Plan: string; // Ultimo plano comprado da empresa
  Plan_Price: number; // Preço desse plano comprado pela empresa
  Plan_Expiration_Date: string; // Data que o plano vai expirar
  Plan_Active: boolean; // Indicação se o plano está ativo ou não
  Plan_Auto_Renewal: boolean; // Indicação se a renovação automática do plano está ativa ou desativada
  Current_Bumps: number; // Quantos Bumps a empresa ainda tem para gastar até ao fim do plano
  Total_Bumps: number; // Quantos Bumps totais a empresa tem
  
  // New fields for additional company information
  Commercial_Name?: string;
  Company_Postal_Code?: string;
  District?: string;
  Company_City?: string;
  Company_Address?: string;
  AM_Old?: string;
  AM_Current?: string;
  Stock_STV?: number;
  Company_API_Info?: string;
  Company_Stock?: number;
  Logo_URL?: string;
  Classification?: string;
  Imported_Percentage?: number;
  Vehicle_Source?: string;
  Competition?: string;
  Social_Media_Investment?: number;
  Portal_Investment?: number;
  B2B_Market?: boolean;
  Uses_CRM?: boolean;
  CRM_Software?: string;
  Recommended_Plan?: string;
  Credit_Mediator?: boolean;
  Bank_Of_Portugal_Link?: string;
  Financing_Agreements?: string;
  Last_Visit_Date?: string;
  Company_Group?: string;
  Represented_Brands?: string;
  Company_Type?: string;
  Wants_CT?: boolean;
  Wants_CRB_Partner?: boolean;
  autobiz_info?: string; // Renamed to snake_case
  Stand_Name?: string; // Nome comercial do ponto de venda

  stands: Stand[];
}

export interface CompanyAdditionalExcelData {
  id?: string;
  user_id: string;
  excel_company_id: string;
  company_db_id?: string; // NEW: Add company_db_id
  "Nome Comercial"?: string | null;
  "Email da empresa"?: string | null;
  "STAND_POSTAL_CODE"?: string | null;
  "Distrito"?: string | null;
  "Cidade"?: string | null;
  "Morada"?: string | null;
  "AM_OLD"?: string | null;
  "AM"?: string | null;
  "Stock STV"?: number | null;
  "API"?: string | null;
  "Site"?: string | null;
  "Stock na empresa"?: number | null;
  "Logotipo"?: string | null;
  "Classificação"?: string | null;
  "Percentagem de Importados"?: number | null;
  "Onde compra as viaturas"?: string | null;
  "Concorrencia"?: string | null;
  "Investimento redes sociais"?: number | null;
  "Investimento em portais"?: number | null;
  "Mercado b2b"?: boolean | null;
  "Utiliza CRM"?: boolean | null;
  "Qual o CRM"?: string | null;
  "Plano Indicado"?: string | null;
  "Mediador de credito"?: boolean | null;
  "Link do Banco de Portugal"?: string | null;
  "Financeiras com acordo"?: string | null;
  "Data ultima visita"?: string | null;
  "Grupo"?: string | null;
  "Marcas representadas"?: string | null;
  "Tipo de empresa"?: string | null;
  "Quer CT"?: boolean | null;
  "Quer ser parceiro Credibom"?: boolean | null;
  "Autobiz"?: string | null;
  created_at?: string;
  crmCompany?: Company; // Adicionado para incluir dados do CRM principal
}

export interface AccountContact {
  id?: string;
  user_id: string;
  company_db_id?: string; // NEW: Add company_db_id
  account_am?: string | null;
  contact_type?: string | null;
  report_text?: string | null;
  contact_date?: string | null; // ISO string for timestamp
  contact_method?: string | null;
  commercial_name?: string | null;
  company_name?: string | null;
  crm_id?: string | null;
  company_excel_id: string; // Links to Company.Company_id
  stand_name?: string | null;
  subject?: string | null;
  contact_person_name?: string | null;
  company_group?: string | null;
  account_armatis?: string | null;
  quarter?: string | null;
  is_credibom_partner?: boolean | null;
  send_email?: boolean | null;
  email_type?: string | null;
  email_subject?: string | null;
  email_body?: string | null;
  attachment_url?: string | null;
  sending_email?: string | null;
  created_at?: string;
}

export type EasyvistaStatus = 'Criado' | 'Em validação' | 'Em tratamento' | 'Resolvido' | 'Cancelado'; // NEW: Define EasyvistaStatus type

export interface EasyvistaType { // NEW: Interface for custom Easyvista types
  id?: string;
  user_id: string;
  name: string;
  display_fields?: string[] | null; // NEW: Array of field names to display
  created_at?: string;
}

export interface Easyvista {
  id?: number;
  created_at?: string;
  user_id: string;
  company_excel_id?: string | null; // New field to link to CompanyAdditionalExcelData
  company_db_id?: string; // NEW: Add company_db_id
  "Nome comercial"?: string | null;
  "Data Criação"?: string | null;
  "Status"?: EasyvistaStatus | null; // UPDATED: Use EasyvistaStatus type
  "Account"?: string | null;
  "Titulo"?: string | null;
  "Descrição"?: string | null;
  "Anexos"?: string[] | null; // Array of URLs
  "Ultima actualização"?: string | null;
  "Tipo de report"?: string | null;
  "PV"?: boolean | null;
  "Tipo EVS"?: string | null; // UPDATED: Now references EasyvistaType.name
  "Urgência"?: 'Alto' | 'Médio' | 'Baixo' | null;
  "Email Pisca"?: string | null;
  "Pass Pisca"?: string | null;
  "Client ID"?: string | null;
  "Client Secret"?: string | null;
  "Integração"?: string | null;
  "NIF da empresa"?: string | null;
  "Campanha"?: string | null;
  "Duração do acordo"?: string | null;
  "Plano do acordo"?: string | null;
  "Valor sem iva"?: number | null;
  "ID_Proposta"?: string | null;
  "Account Armatis"?: string | null;
}

export interface Account {
  id: string;
  created_at: string;
  user_id: string;
  account_name: string | null;
  am: string | null;
  phone_number: string | null;
  email: string | null;
  photo_url: string | null;
  district: string | null;
  credibom_email: string | null;
  role: string | null;
  auth_user_id?: string | null; // NEW: Link to auth.users.id
}

export interface DealProduct {
  id?: string;
  deal_id: string;
  product_id: string;
  quantity: number;
  unit_price_at_deal_time?: number | null;
  total_price_at_deal_time?: number | null; // quantity * unit_price_at_deal_time (after individual product discount)
  product_name?: string | null; // For display purposes
  product_category?: string | null; // For display purposes
  discount_type?: 'none' | 'percentage' | 'amount' | null; // NEW: Individual product discount type
  discount_value?: number | null; // NEW: Individual product discount value
  created_at?: string;
}

export interface Negocio {
  id?: string;
  user_id: string;
  company_excel_id: string;
  company_db_id?: string; // NEW: Add company_db_id
  commercial_name?: string | null; // Adicionado para exibir o nome comercial da empresa
  deal_name: string;
  deal_status?: string | null;
  deal_value?: number | null; // Valor do negócio ANTES do desconto GERAL (Soma de todos os total_price_at_deal_time dos deal_products, que já incluem descontos individuais)
  currency?: string | null;
  expected_close_date?: string | null; // ISO string for timestamp
  stage?: string | null;
  priority?: string | null;
  notes?: string | null;
  discount_type?: 'none' | 'percentage' | 'amount' | null; // Tipo de desconto aplicado ao negócio total
  discount_value?: number | null; // Valor do desconto
  final_deal_value?: number | null; // Valor do negócio APÓS o desconto GERAL
  created_at?: string;
  updated_at?: string;
  deal_products?: DealProduct[]; // Lista de produtos associados a este negócio
  campaign_id?: string | null; // NEW: ID da campanha associada
  campaign_name?: string | null; // NEW: Nome da campanha para exibição
}

export interface Product {
  id: string; // Changed from optional to required
  user_id: string;
  categoria?: string | null;
  produto: string;
  unidade?: number | null; // Changed to number for calculation
  preco_unitario?: number | null;
  preco_total?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Employee {
  id?: string;
  user_id: string;
  company_excel_id: string;
  company_db_id?: string; // NEW: Add company_db_id
  id_people?: string | null; // Made optional
  nome_colaborador: string;
  telemovel?: string | null;
  email?: string | null;
  cargo?: string | null;
  commercial_name?: string | null;
  image_url?: string | null;
  stand_id?: string | null; // Excel ID of the stand
  stand_name?: string | null; // Name of the stand
  created_at?: string;
}

export interface Task {
  id?: string;
  user_id: string;
  company_excel_id: string;
  company_db_id?: string; // NEW: Add company_db_id
  commercial_name?: string | null; // NEW: Added commercial_name
  title: string;
  description?: string | null;
  due_date?: string | null; // ISO string for timestamp
  status?: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled' | null;
  priority?: 'Low' | 'Medium' | 'High' | null;
  assigned_to_employee_id?: string | null; // UUID of the employee
  assigned_to_employee_name?: string | null; // Name of the employee for display
  created_at?: string;
  updated_at?: string;
}

export interface Campaign {
  id?: string;
  user_id: string;
  name: string;
  description?: string | null;
  type: 'discount' | 'offer' | 'other';
  discount_type?: 'percentage' | 'amount' | 'none' | null;
  discount_value?: number | null;
  start_date?: string | null; // ISO string for timestamp
  end_date?: string | null; // ISO string for timestamp
  is_active?: boolean | null;
  created_at?: string;
  updated_at?: string;
  product_ids?: string[]; // Array of product IDs associated with the campaign
  category?: string | null; // NEW: Category for the campaign
}

export interface UserProfile { // NEW: User profile interface
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
}

export interface Analytics { // NEW: Analytics interface
  id?: string;
  user_id: string;
  company_db_id?: string;
  company_excel_id: string;
  title: string;
  description?: string | null;
  analysis_date?: string | null; // ISO string for timestamp
  category?: string | null;
  result?: string | null;
  created_at?: string;
  updated_at?: string;
}