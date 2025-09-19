import * as XLSX from 'xlsx';
import { Company, Stand } from '@/types/crm';

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
  return value ? parseFloat(value) : 0; // Use parseFloat for numbers, including percentages/currency
};

// Helper to find an integer value in a row
const findIntegerValue = (row: any, possibleKeys: string[]): number => {
  const value = findValue(row, possibleKeys);
  return value ? parseInt(value, 10) : 0;
};

// Helper to find a boolean value (1 or 0/empty, or "sim"/"não")
const findBooleanValue = (row: any, possibleKeys: string[]): boolean => {
  const value = findValue(row, possibleKeys);
  if (value === '1' || value?.toLowerCase() === 'verdadeiro' || value?.toLowerCase() === 'sim') {
    return true;
  }
  return false; // Returns true if value is '1', 'verdadeiro', or 'sim', false otherwise
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
    const isAPDCA_Partner = findBooleanValue(row, ['Flag APDCA', 'FlagAPDCA']);
    const creationDate = findValue(row, ['DT_Criação', 'DTCriação']) || '';
    const lastLoginDate = findValue(row, ['DT_Log_in', 'DTLogin', 'DT Log in']) || '';
    const financingSimulatorOn = findBooleanValue(row, ['Financing Simulator ON', 'FinancingSimulatorON']);
    const simulatorColor = findValue(row, ['Simulator Color', 'SimulatorColor']) || '';
    const lastPlan = findValue(row, ['Ultimo Plano', 'UltimoPlano']) || '';
    const planPrice = findNumericValue(row, ['Preço', 'Preco']) || 0;
    const planExpirationDate = findValue(row, ['Data Expiração', 'DataExpiracao']) || '';
    const planActive = findBooleanValue(row, ['Plano ON', 'PlanoON']);
    const planAutoRenewal = findBooleanValue(row, ['Renovação do plano', 'RenovacaoDoPlano']);
    const currentBumps = findIntegerValue(row, ['Bumps_atuais', 'Bumps Atuais']) || 0;
    const totalBumps = findIntegerValue(row, ['Bumps_totais', 'Bumps Totais']) || 0;


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
      Anuncios: findIntegerValue(row, ['Anúncios', 'Anuncios']),
      API: findIntegerValue(row, ['API']),
      Publicados: findIntegerValue(row, ['Publicados']),
      Arquivados: findIntegerValue(row, ['Arquivados']),
      Guardados: findIntegerValue(row, ['Guardados']),
      Tipo: findValue(row, ['Tipo']) || '',
      Delta_Publicados_Last_Day_Month: findIntegerValue(row, ['Δ Publicados_Last_Day_Month(-1)', 'Delta Publicados Last Day Month(-1)', 'Delta_Publicados_Last_Day_Month']),
      Leads_Recebidas: findIntegerValue(row, ['Leads Recebidas', 'LeadsRecebidas']),
      Leads_Pendentes: findIntegerValue(row, ['Leads Pendentes', 'LeadsPendentes']),
      Leads_Expiradas: findIntegerValue(row, ['Leads Expiradas', 'LeadsExpiradas']),
      Leads_Financiadas: findIntegerValue(row, ['Leads Financiadas', 'LeadsFinanciadas']),
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

export const parseCompanyDetailsExcel = async (source: ArrayBuffer): Promise<Map<string, Partial<Company>>> => {
  const workbook = XLSX.read(source, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const json: any[] = XLSX.utils.sheet_to_json(worksheet);

  const companyDetailsMap = new Map<string, Partial<Company>>();

  json.forEach((row: any) => {
    const companyId = findValue(row, ['Company_id', 'Company ID', 'CompanyID']) || '';

    if (companyId) {
      const details: Partial<Company> = {
        Commercial_Name: findValue(row, ['Nome Comercial', 'NomeComercial']),
        Company_Email: findValue(row, ['Email da empresa', 'EmailDaEmpresa']) || findValue(row, ['Company Person Email', 'CompanyPersonEmail']), // Use existing if present
        Company_Postal_Code: findValue(row, ['STAND_POSTAL_CODE', 'Stand Postal Code', 'Company Postal Code']),
        District: findValue(row, ['Distrito']),
        Company_City: findValue(row, ['Cidade', 'Company City']),
        Company_Address: findValue(row, ['Morada', 'Company Address']),
        AM_OLD: findValue(row, ['AM_OLD', 'AM Old']),
        AM_Current: findValue(row, ['AM', 'AM Current']),
        Stock_STV: findIntegerValue(row, ['Stock STV', 'StockSTV']),
        Company_API_Info: findValue(row, ['API', 'Company API']), // Renamed to avoid conflict
        Website: findValue(row, ['Site', 'Website']), // Use existing if present
        Company_Stock: findIntegerValue(row, ['Stock na empresa', 'StockNaEmpresa']),
        Logo_URL: findValue(row, ['Logotipo', 'Logo']),
        Classification: findValue(row, ['Classificação', 'Classificacao']),
        Imported_Percentage: findNumericValue(row, ['Percentagem de Importados', 'PercentagemDeImportados']),
        Vehicle_Source: findValue(row, ['Onde compra as viaturas', 'OndeCompraAsViaturas']),
        Competition: findValue(row, ['Concorrencia']),
        Social_Media_Investment: findNumericValue(row, ['Investimento redes sociais', 'InvestimentoRedesSociais']),
        Portal_Investment: findNumericValue(row, ['Investimento em portais', 'InvestimentoEmPortais']),
        B2B_Market: findBooleanValue(row, ['Mercado b2b', 'MercadoB2B']),
        Uses_CRM: findBooleanValue(row, ['Utiliza CRM', 'UtilizaCRM']),
        CRM_Software: findValue(row, ['Qual o CRM', 'QualOCRM']),
        Recommended_Plan: findValue(row, ['Plano Indicado', 'PlanoIndicado']),
        Credit_Mediator: findBooleanValue(row, ['Mediador de credito', 'MediadorDeCredito']),
        Bank_of_Portugal_Link: findValue(row, ['Link do Banco de Portugal', 'LinkDoBancoDePortugal']),
        Financing_Agreements: findValue(row, ['Financeiras com acordo', 'FinanceirasComAcordo']),
        Last_Visit_Date: findValue(row, ['Data ultima visita', 'DataUltimaVisita']),
        Company_Group: findValue(row, ['Grupo', 'Company Group']),
        Represented_Brands: findValue(row, ['Marcas representadas', 'MarcasRepresentadas']),
        Company_Type: findValue(row, ['Tipo de empresa', 'TipoDeEmpresa']),
        Wants_CT: findBooleanValue(row, ['Quer CT', 'QuerCT']),
        Wants_CRB_Partner: findBooleanValue(row, ['Quer ser parceiro Credibom', 'QuerSerParceiroCredibom']),
        Autobiz_Info: findValue(row, ['Autobiz', 'Autobiz Info']),
      };
      companyDetailsMap.set(companyId, details);
    }
  });

  return companyDetailsMap;
};