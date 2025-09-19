import * as XLSX from 'xlsx';
import { Company, Stand, EditableCompanyData } from '@/types/crm';

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
  return value ? parseFloat(value) : 0; // Use parseFloat for numbers that might have decimals (like Plafond, Plan_Price)
};

// Helper to find a boolean value (1 or 0/empty)
const findBooleanValue = (row: any, possibleKeys: string[]): boolean => {
  const value = findValue(row, possibleKeys);
  return value === '1' || value?.toLowerCase() === 'verdadeiro' || value?.toLowerCase() === 'true';
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
    const companyPlafond = findNumericValue(row, ['Plafond (€)', 'Plafond']);
    const companySupervisor = findValue(row, ['Supervisor']) || '';
    const isCRBPartner = findBooleanValue(row, ['Match Parceiro CRB', 'MatchParceiroCRB', 'Flag CRB']);
    const isAPDCA_Partner = findBooleanValue(row, ['Flag APDCA', 'FlagAPDCA']);
    const creationDate = findValue(row, ['DT_Criação', 'DTCriação']) || '';
    const lastLoginDate = findValue(row, ['DT_Log_in', 'DTLogin', 'DT Log in']) || '';
    const financingSimulatorOn = findBooleanValue(row, ['Financing Simulator ON', 'FinancingSimulatorON']);
    const simulatorColor = findValue(row, ['Simulator Color', 'SimulatorColor']) || '';
    const lastPlan = findValue(row, ['Ultimo Plano', 'UltimoPlano']) || '';
    const planPrice = findNumericValue(row, ['Preço', 'Preco']);
    const planExpirationDate = findValue(row, ['Data Expiração', 'DataExpiracao']) || '';
    const planActive = findBooleanValue(row, ['Plano ON', 'PlanoON']);
    const planAutoRenewal = findBooleanValue(row, ['Renovação do plano', 'RenovacaoDoPlano']);
    const currentBumps = findNumericValue(row, ['Bumps_atuais', 'Bumps Atuais']);
    const totalBumps = findNumericValue(row, ['Bumps_totais', 'Bumps Totais']);


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

export const parseEditableCompanyExcel = async (source: ArrayBuffer): Promise<EditableCompanyData[]> => {
  const workbook = XLSX.read(source, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const json: any[] = XLSX.utils.sheet_to_json(worksheet);

  return json.map((row: any) => ({
    Company_id: findValue(row, ['Company_id', 'Company ID', 'CompanyID']) || '',
    Company_Name: findValue(row, ['Company']) || '',
    NIF: findValue(row, ['NIF']) || '',
    Company_Email: findValue(row, ['Company Person Email', 'CompanyPersonEmail']) || '',
    Company_Contact_Person: findValue(row, ['Company Person', 'CompanyPerson']) || '',
    Website: findValue(row, ['Website']) || '',
    Plafond: findNumericValue(row, ['Plafond (€)', 'Plafond']),
    Supervisor: findValue(row, ['Supervisor']) || '',
    Is_CRB_Partner: findBooleanValue(row, ['Match Parceiro CRB', 'MatchParceiroCRB', 'Flag CRB']),
    Is_APDCA_Partner: findBooleanValue(row, ['Flag APDCA', 'FlagAPDCA']),
    Creation_Date: findValue(row, ['DT_Criação', 'DTCriação']) || '',
    Last_Login_Date: findValue(row, ['DT_Log_in', 'DTLogin', 'DT Log in']) || '',
    Financing_Simulator_On: findBooleanValue(row, ['Financing Simulator ON', 'FinancingSimulatorON']),
    Simulator_Color: findValue(row, ['Simulator Color', 'SimulatorColor']) || '',
    Last_Plan: findValue(row, ['Ultimo Plano', 'UltimoPlano']) || '',
    Plan_Price: findNumericValue(row, ['Preço', 'Preco']),
    Plan_Expiration_Date: findValue(row, ['Data Expiração', 'DataExpiracao']) || '',
    Plan_Active: findBooleanValue(row, ['Plano ON', 'PlanoON']),
    Plan_Auto_Renewal: findBooleanValue(row, ['Renovação do plano', 'RenovacaoDoPlano']),
    Current_Bumps: findNumericValue(row, ['Bumps_atuais', 'Bumps Atuais']),
    Total_Bumps: findNumericValue(row, ['Bumps_totais', 'Bumps Totais']),
  })).filter(data => data.Company_id !== ''); // Filter out entries without a Company_id
};