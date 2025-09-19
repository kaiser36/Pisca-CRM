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
  Leads_Expiradas: number; // Numero de leads expiradas pelo stand
  Leads_Financiadas: number; // Numero de leads financiadas pelo stand
  Whatsapp: string; // Numero de Whatsapp de cada stand
}

export interface Company {
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
  stands: Stand[];

  // New fields from the second Excel file
  Commercial_Name?: string; // Nome Comercial
  Company_Postal_Code?: string; // STAND_POSTAL_CODE (for company)
  District?: string; // Distrito
  Company_City?: string; // Cidade
  Company_Address?: string; // Morada
  AM_OLD?: string; // AM_OLD
  AM_Current?: string; // AM
  Stock_STV?: number; // Stock STV
  Company_API_Info?: string; // API (company level)
  Company_Stock?: number; // Stock na empresa
  Logo_URL?: string; // Logotipo
  Classification?: string; // Classificação
  Imported_Percentage?: number; // Percentagem de Importados
  Vehicle_Source?: string; // Onde compra as viaturas
  Competition?: string; // Concorrencia
  Social_Media_Investment?: number; // Investimento redes sociais
  Portal_Investment?: number; // Investimento em portais
  B2B_Market?: boolean; // Mercado b2b
  Uses_CRM?: boolean; // Utiliza CRM
  CRM_Software?: string; // Qual o CRM
  Recommended_Plan?: string; // Plano Indicado
  Credit_Mediator?: boolean; // Mediador de credito
  Bank_of_Portugal_Link?: string; // Link do Banco de Portugal
  Financing_Agreements?: string; // Financeiras com acordo
  Last_Visit_Date?: string; // Data ultima visita
  Company_Group?: string; // Grupo
  Represented_Brands?: string; // Marcas representadas
  Company_Type?: string; // Tipo de empresa
  Wants_CT?: boolean; // Quer CT
  Wants_CRB_Partner?: boolean; // Quer ser parceiro Credibom
  Autobiz_Info?: string; // Autobiz
}