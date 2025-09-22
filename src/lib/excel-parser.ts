import * as XLSX from 'xlsx';
import { Company, Stand, CompanyAdditionalExcelData } from '@/types/crm';

// Helper to find a key in a row, trying common variations
const findValue = (row: any, possibleKeys: string[]): string | undefined => {
  for (const key of possibleKeys) {
    // Try exact match
    if (row[key] !== undefined && row[key] !== null) return String(row[key]);
    // Try trimmed match
    const trimmedKey = key.trim();
    if (row[trimmedKey] !== undefined && row[trimmedKey] !== null) return String(row[trimmedKey]);
    // Try lowercase match
    const lowerKey = key.toLowerCase();
    if (row[lowerKey] !== undefined && row[lowerKey] !== null) return String(row[lowerKey]);
    // Try lowercase and trimmed match
    const lowerTrimmedKey = key.toLowerCase().trim();
    if (row[lowerTrimmedKey] !== undefined && row[lowerTrimmedKey] !== null) return String(row[lowerTrimmedKey]);
    // Try replacing spaces with underscores
    const snakeCaseKey = key.replace(/\s/g, '_');
    if (row[snakeCaseKey] !== undefined && row[snakeCaseKey] !== null) return String(row[snakeCaseKey]);
    // Try replacing underscores with spaces
    const spaceCaseKey = key.replace(/_/g, ' ');
    if (row[spaceCaseKey] !== undefined && row[spaceCaseKey] !== null) return String(row[spaceCaseKey]);
    // Try PascalCase (e.g., "StandId")
    const pascalCaseKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase()).replace(/^./, (g) => g.toUpperCase());
    if (row[pascalCaseKey] !== undefined && row[pascalCaseKey] !== null) return String(row[pascalCaseKey]);
  }
  return undefined; // If no key found
};

// Helper to find a numeric value in a row, trying common variations
const findNumericValue = (row: any, possibleKeys: string[]): number => {
  const value = findValue(row, possibleKeys);
  return value ? parseInt(value, 10) : 0; // Default to 0 if not found or not a valid number
};

// Helper to find a boolean value (1 or 0/empty)
const findBooleanValue = (row: any, possibleKeys: string[]): boolean => {
  const value = findValue(row, possibleKeys);
  return value === '1' || value?.toLowerCase() === 'verdadeiro'; // Returns true if value is '1' or 'verdadeiro', false otherwise
};

// Modified to accept ArrayBuffer or a file path
export const parseStandsExcel = async (source: string | ArrayBuffer): Promise<Company[]> => {
  let arrayBuffer: ArrayBuffer;

  if (typeof source === 'string') {
    // If source is a string, assume it's a file path and fetch it
    const response = await fetch(source);
    arrayBuffer = await response.arrayBuffer();
  } else {
    // If source is an ArrayBuffer, use it directly
    arrayBuffer = source;
  }

  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const json: any[] = XLSX.utils.sheet_to_json(worksheet);

  const companiesMap = new Map<string, Company>();

  json.forEach((row: any) => {
    const companyId = findValue(row, ['Company_id', 'Company ID', 'CompanyID']) || '';
    const companyName = findValue(row, ['Company']) || '';
    const companyNIF = findValue(row, ['NIF']) || '';
    const companyPersonEmail = findValue(row, ['Company Person Email', 'CompanyPersonEmail']) || '';
    const companyPerson = findValue(row, ['Company Person', 'CompanyPerson']) || '';
    const companyWebsite = findValue(row, ['Website']) || '';
    const companyPlafond = findNumericValue(row, ['Plafond (€)', 'Plafond']) || 0;
    const companySupervisor = findValue(row, ['Supervisor']) || '';
    const isCRBPartner = findBooleanValue(row, ['Match Parceiro CRB', 'MatchParceiroCRB', 'Flag CRB']);
    const isAPDCA_Partner = findBooleanValue(row, ['Flag APDCA', 'FlagAPDCA']); // Mapeado para 'Flag APDCA'
    const creationDate = findValue(row, ['DT_Criação', 'DTCriação']) || ''; // Mapeado para 'DT_Criação'
    const lastLoginDate = findValue(row, ['DT_Log_in', 'DTLogin', 'DT Log in']) || ''; // Mapeado para 'DT_Log_in'
    const financingSimulatorOn = findBooleanValue(row, ['Financing Simulator ON', 'FinancingSimulatorON']); // Mapeado para 'Financing Simulator ON'
    const simulatorColor = findValue(row, ['Simulator Color', 'SimulatorColor']) || ''; // Mapeado para 'Simulator Color'
    const lastPlan = findValue(row, ['Ultimo Plano', 'UltimoPlano']) || ''; // Mapeado para 'Ultimo Plano'
    const planPrice = findNumericValue(row, ['Preço', 'Preco']) || 0; // Mapeado para 'Preço'
    const planExpirationDate = findValue(row, ['Data Expiração', 'DataExpiracao']) || ''; // Mapeado para 'Data Expiração'
    const planActive = findBooleanValue(row, ['Plano ON', 'PlanoON']); // Mapeado para 'Plano ON'
    const planAutoRenewal = findBooleanValue(row, ['Renovação do plano', 'RenovacaoDoPlano']); // Mapeado para 'Renovação do plano'
    const currentBumps = findNumericValue(row, ['Bumps_atuais', 'Bumps Atuais']) || 0; // Mapeado para 'Bumps_atuais'
    const totalBumps = findNumericValue(row, ['Bumps_totais', 'Bumps Totais']) || 0;


    const stand: Stand = {
      Stand_ID: findValue(row, ['Stand_ID', 'Stand ID', 'StandID']) || '',
      Company_id: companyId,
      Company_Name: companyName,
      NIF: companyNIF,
      Address: findValue(row, ['Stand Address', 'StandAddress', 'Address']) || '',
      City: findValue(row, ['Stand City', 'StandCity', 'City']) || '',
      Postal_Code: findValue(row, ['Stand Postal Code', 'StandPostalCode', 'Postal Code']) || '',
      Phone: findValue(row, ['Stand_Phone', 'Stand Phone', 'StandPhone', 'Phone']) || '',
      Email: findValue(row, ['Stand Email', 'StandEmail', 'Email']) || '',
      Contact_Person: findValue(row, ['Contact_Person', 'Contact Person', 'ContactPerson']) || '',
      Anuncios: findNumericValue(row, ['Anúncios', 'Anuncios']),
      API: findNumericValue(row, ['API']),
      Publicados: findNumericValue(row, ['Publicados']),
      Arquivados: findNumericValue(row, ['Arquivados']),
      Guardados: findNumericValue(row, ['Guardados']),
      Tipo: findValue(row, ['Tipo']) || '',
      Delta_Publicados_Last_Day_Month: findNumericValue(row, ['Δ Publicados_Last_Day_Month(-1)', 'Delta Publicados Last Day Month(-1)', 'Delta_Publicados_Last_Day_Month']),
      Leads_Recebidas: findNumericValue(row, ['Leads Recebidas', 'LeadsRecebidas']),
      Leads_Pendentes: findNumericValue(row, ['Leads Pendentes', 'LeadsPendentes']),
      Leads_Expiradas: findNumericValue(row, ['Leads Expiradas', 'LeadsExpiradas']),
      Leads_Financiadas: findNumericValue(row, ['Leads Financiadas', 'LeadsFinanciadas']),
      Whatsapp: findValue(row, ['Whatsapp']) || '',
    };

    // Only process if Company_id is not empty
    if (stand.Company_id) {
      if (!companiesMap.has(stand.Company_id)) {
        companiesMap.set(stand.Company_id, {
          Company_id: companyId,
          Company_Name: companyName,
          NIF: companyNIF,
          Company_Email: companyPersonEmail,
          Company_Contact_Person: companyPerson,
          Website: companyWebsite,
          Plafond: companyPlafond,
          Supervisor: companySupervisor,
          Is_CRB_Partner: isCRBPartner,
          Is_APDCA_Partner: isAPDCA_Partner,
          Creation_Date: creationDate,
          Last_Login_Date: lastLoginDate,
          Financing_Simulator_On: financingSimulatorOn,
          Simulator_Color: simulatorColor,
          Last_Plan: lastPlan,
          Plan_Price: planPrice,
          Plan_Expiration_Date: planExpirationDate,
          Plan_Active: planActive,
          Plan_Auto_Renewal: planAutoRenewal,
          Current_Bumps: currentBumps,
          Total_Bumps: totalBumps,
          stands: [],
        });
      }
      companiesMap.get(stand.Company_id)?.stands.push(stand);
    }
  });

  return Array.from(companiesMap.values());
};

export const parseCompanyAdditionalExcel = async (file: File, userId: string): Promise<CompanyAdditionalExcelData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        const parsedData: CompanyAdditionalExcelData[] = json.map((row: any) => ({
          id: '', // Will be generated by Supabase
          user_id: userId,
          excel_company_id: findValue(row, ['Company_ID', 'Company ID', 'CompanyID']) || '',
          excel_commercial_name: findValue(row, ['Nome Comercial', 'NomeComercial']),
          excel_company_email: findValue(row, ['Email da empresa', 'EmailDaEmpresa']),
          excel_stand_postal_code: findValue(row, ['STAND_POSTAL_CODE', 'Stand Postal Code']),
          excel_district: findValue(row, ['Distrito']),
          excel_city: findValue(row, ['Cidade']),
          excel_address: findValue(row, ['Morada']),
          excel_am_old: findValue(row, ['AM_OLD', 'AM Old']),
          excel_am_current: findValue(row, ['AM', 'AM Current']),
          excel_stock_stv: findNumericValue(row, ['Stock STV', 'StockSTV']),
          excel_api_value: findValue(row, ['API']),
          excel_website: findValue(row, ['Site', 'Website']),
          excel_company_stock: findNumericValue(row, ['Stock na empresa', 'StockNaEmpresa']),
          excel_logo_url: findValue(row, ['Logotipo']),
          excel_classification: findValue(row, ['Classificação', 'Classificacao']),
          excel_imported_percentage: parseFloat(findValue(row, ['Percentagem de Importados', 'PercentagemDeImportados']) || '0'),
          excel_vehicle_source: findValue(row, ['Onde compra as viaturas', 'OndeCompraAsViaturas']),
          excel_competition: findValue(row, ['Concorrencia']),
          excel_social_media_investment: parseFloat(findValue(row, ['Investimento redes sociais', 'InvestimentoRedesSociais']) || '0'),
          excel_portal_investment: parseFloat(findValue(row, ['Investimento em portais', 'InvestimentoEmPortais']) || '0'),
          excel_b2b_market: findBooleanValue(row, ['Mercado b2b', 'MercadoB2B']),
          excel_uses_crm: findBooleanValue(row, ['Utiliza CRM', 'UtilizaCRM']),
          excel_crm_software: findValue(row, ['Qual o CRM', 'QualOCRM']),
          excel_recommended_plan: findValue(row, ['Plano Indicado', 'PlanoIndicado']),
          excel_credit_mediator: findBooleanValue(row, ['Mediador de credito', 'MediadorDeCredito']),
          excel_bank_of_portugal_link: findValue(row, ['Link do Banco de Portugal', 'LinkDoBancoDePortugal']),
          excel_financing_agreements: findValue(row, ['Financeiras com acordo', 'FinanceirasComAcordo']),
          excel_last_visit_date: findValue(row, ['Data ultima visita', 'DataUltimaVisita']),
          excel_company_group: findValue(row, ['Grupo', 'Grupo Marcas representadas']), // Assuming 'Grupo Marcas representadas' is part of 'Grupo'
          excel_represented_brands: findValue(row, ['Marcas representadas']),
          excel_company_type: findValue(row, ['Tipo de empresa', 'TipoDeEmpresa']),
          excel_wants_ct: findBooleanValue(row, ['Quer CT', 'QuerCT']),
          excel_wants_crb_partner: findBooleanValue(row, ['Quer ser parceiro Credibom', 'QuerSerParceiroCredibom']),
          excel_autobiz_info: findValue(row, ['Autobiz']),
          created_at: new Date().toISOString(),
        }));

        resolve(parsedData);
      } catch (error) {
        reject(new Error("Falha ao analisar o ficheiro Excel. Verifique o formato."));
      }
    };

    reader.onerror = (error) => {
      reject(new Error("Erro ao ler o ficheiro."));
    };

    reader.readAsArrayBuffer(file);
  });
};