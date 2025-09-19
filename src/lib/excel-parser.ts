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
  return value ? parseFloat(value) : 0; // Use parseFloat for numeric values, including decimals
};

// Helper to find a boolean value (1 or 0/empty)
const findBooleanValue = (row: any, possibleKeys: string[]): boolean => {
  const value = findValue(row, possibleKeys);
  return value === '1' || value?.toLowerCase() === 'verdadeiro' || value?.toLowerCase() === 'true'; // Returns true if value is '1', 'verdadeiro', or 'true', false otherwise
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
    const companyPersonEmail = findValue(row, ['Company Person Email', 'CompanyPersonEmail', 'Email da empresa']) || '';
    const companyPerson = findValue(row, ['Company Person', 'CompanyPerson', 'Company_Contact_Person']) || '';
    const companyWebsite = findValue(row, ['Website', 'Site']) || '';
    const companyPlafond = findNumericValue(row, ['Plafond (€)', 'Plafond']) || 0;
    const companySupervisor = findValue(row, ['Supervisor', 'AM']) || '';
    const isCRBPartner = findBooleanValue(row, ['Match Parceiro CRB', 'MatchParceiroCRB', 'Flag CRB', 'Quer ser parceiro Credibom']);
    const isAPDCA_Partner = findBooleanValue(row, ['Flag APDCA', 'FlagAPDCA']);
    const creationDate = findValue(row, ['DT_Criação', 'DTCriação', 'Creation_Date']) || '';
    const lastLoginDate = findValue(row, ['DT_Log_in', 'DTLogin', 'DT Log in', 'Last_Login_Date']) || '';
    const financingSimulatorOn = findBooleanValue(row, ['Financing Simulator ON', 'FinancingSimulatorON']);
    const simulatorColor = findValue(row, ['Simulator Color', 'SimulatorColor']) || '';
    const lastPlan = findValue(row, ['Ultimo Plano', 'UltimoPlano', 'Last_Plan']) || '';
    const planPrice = findNumericValue(row, ['Preço', 'Preco', 'Plan_Price']) || 0;
    const planExpirationDate = findValue(row, ['Data Expiração', 'DataExpiracao', 'Plan_Expiration_Date']) || '';
    const planActive = findBooleanValue(row, ['Plano ON', 'PlanoON']);
    const planAutoRenewal = findBooleanValue(row, ['Renovação do plano', 'RenovacaoDoPlano']);
    const currentBumps = findNumericValue(row, ['Bumps_atuais', 'Bumps Atuais']) || 0;
    const totalBumps = findNumericValue(row, ['Bumps_totais', 'Bumps Totais']) || 0;

    // New fields
    const commercialName = findValue(row, ['Nome Comercial', 'Commercial_Name']) || '';
    const companyPostalCode = findValue(row, ['STAND_POSTAL_CODE', 'Company_Postal_Code']) || '';
    const district = findValue(row, ['Distrito', 'District']) || '';
    const companyCity = findValue(row, ['Cidade', 'Company_City']) || '';
    const companyAddress = findValue(row, ['Morada', 'Company_Address']) || '';
    const amOld = findValue(row, ['AM_OLD', 'AM Old']) || '';
    const amCurrent = findValue(row, ['AM', 'AM_Current']) || '';
    const stockStv = findNumericValue(row, ['Stock STV', 'Stock_STV']) || 0;
    const companyApiInfo = findValue(row, ['API', 'Company_API_Info']) || ''; // Re-using API for company level if it's different from stand API
    const companyStock = findNumericValue(row, ['Stock na empresa', 'Company_Stock']) || 0;
    const logoUrl = findValue(row, ['Logotipo', 'Logo_URL']) || '';
    const classification = findValue(row, ['Classificação', 'Classification']) || '';
    const importedPercentage = findNumericValue(row, ['Percentagem de Importados', 'Imported_Percentage']) || 0;
    const vehicleSource = findValue(row, ['Onde compra as viaturas', 'Vehicle_Source']) || '';
    const competition = findValue(row, ['Concorrencia', 'Competition']) || '';
    const socialMediaInvestment = findNumericValue(row, ['Investimento redes sociais', 'Social_Media_Investment']) || 0;
    const portalInvestment = findNumericValue(row, ['Investimento em portais', 'Portal_Investment']) || 0;
    const b2bMarket = findBooleanValue(row, ['Mercado b2b', 'B2B_Market']);
    const usesCrm = findBooleanValue(row, ['Utiliza CRM', 'Uses_CRM']);
    const crmSoftware = findValue(row, ['Qual o CRM', 'CRM_Software']) || '';
    const recommendedPlan = findValue(row, ['Plano Indicado', 'Recommended_Plan']) || '';
    const creditMediator = findBooleanValue(row, ['Mediador de credito', 'Credit_Mediator']);
    const bankOfPortugalLink = findValue(row, ['Link do Banco de Portugal', 'Bank_Of_Portugal_Link']) || '';
    const financingAgreements = findValue(row, ['Financeiras com acordo', 'Financing_Agreements']) || '';
    const lastVisitDate = findValue(row, ['Data ultima visita', 'Last_Visit_Date']) || '';
    const companyGroup = findValue(row, ['Grupo', 'Company_Group']) || '';
    const representedBrands = findValue(row, ['Marcas representadas', 'Represented_Brands']) || '';
    const companyType = findValue(row, ['Tipo de empresa', 'Company_Type']) || '';
    const wantsCt = findBooleanValue(row, ['Quer CT', 'Wants_CT']);
    const wantsCrbPartner = findBooleanValue(row, ['Quer ser parceiro Credibom', 'Wants_CRB_Partner']);
    const autobizInfo = findValue(row, ['Autobiz', 'Autobiz_Info']) || '';


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
          
          // New fields
          Commercial_Name: commercialName,
          Company_Postal_Code: companyPostalCode,
          District: district,
          Company_City: companyCity,
          Company_Address: companyAddress,
          AM_Old: amOld,
          AM_Current: amCurrent,
          Stock_STV: stockStv,
          Company_API_Info: companyApiInfo,
          Company_Stock: companyStock,
          Logo_URL: logoUrl,
          Classification: classification,
          Imported_Percentage: importedPercentage,
          Vehicle_Source: vehicleSource,
          Competition: competition,
          Social_Media_Investment: socialMediaInvestment,
          Portal_Investment: portalInvestment,
          B2B_Market: b2bMarket,
          Uses_CRM: usesCrm,
          CRM_Software: crmSoftware,
          Recommended_Plan: recommendedPlan,
          Credit_Mediator: creditMediator,
          Bank_Of_Portugal_Link: bankOfPortugalLink,
          Financing_Agreements: financingAgreements,
          Last_Visit_Date: lastVisitDate,
          Company_Group: companyGroup,
          Represented_Brands: representedBrands,
          Company_Type: companyType,
          Wants_CT: wantsCt,
          Wants_CRB_Partner: wantsCrbPartner,
          Autobiz_Info: autobizInfo,

          stands: [],
        });
      }
      companiesMap.get(stand.Company_id)?.stands.push(stand);
    }
  });

  return Array.from(companiesMap.values());
};