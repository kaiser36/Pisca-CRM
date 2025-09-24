export const generateCrmDataCsvTemplate = (): string => {
  const headers = [
    "Company_id (OBRIGATÓRIO)",
    "Company (Nome da Empresa)",
    "NIF",
    "Company Person Email",
    "Company Person",
    "Website",
    "Plafond (€)",
    "Supervisor",
    "Match Parceiro CRB (1 para Sim, 0 para Não)",
    "Flag APDCA (1 para Sim, 0 para Não)",
    "DT_Criação (YYYY-MM-DD HH:MM:SS)",
    "DT_Log_in (YYYY-MM-DD HH:MM:SS)",
    "Financing Simulator ON (1 para Sim, 0 para Não)",
    "Simulator Color",
    "Ultimo Plano",
    "Preço",
    "Data Expiração (YYYY-MM-DD)",
    "Plano ON (1 para Sim, 0 para Não)",
    "Renovação do plano (1 para Sim, 0 para Não)",
    "Bumps_atuais",
    "Bumps_totais",
    "Stand Name", // NEW: Added Stand Name to the template
    "Stand_ID (OBRIGATÓRIO)",
    "Stand Address",
    "Stand City",
    "Stand Postal Code",
    "Stand_Phone",
    "Stand Email",
    "Contact_Person",
    "Anúncios",
    "API",
    "Publicados",
    "Arquivados",
    "Guardados",
    "Tipo",
    "Δ Publicados_Last_Day_Month(-1)",
    "Leads Recebidas",
    "Leads Pendentes",
    "Leads Expiradas",
    "Leads Financiadas",
    "Whatsapp"
  ];

  const exampleRow = [
    "EMP001",
    "Empresa Exemplo SA",
    "123456789",
    "empresa@exemplo.com",
    "João Silva",
    "https://www.empresaexemplo.com",
    "10000",
    "Maria Santos",
    "1", // Is_CRB_Partner
    "0", // Is_APDCA_Partner
    "2022-01-15 09:00:00",
    "2023-10-25 14:30:00",
    "1", // Financing_Simulator_On
    "Azul",
    "Plano Premium",
    "99.99",
    "2024-01-15",
    "1", // Plan_Active
    "1", // Plan_Auto_Renewal
    "50",
    "100",
    "Stand Principal", // NEW: Example Stand Name
    "STAND001",
    "Rua Principal, 123",
    "Lisboa",
    "1000-000",
    "210000000",
    "stand@exemplo.com",
    "Ana Costa",
    "150",
    "100",
    "120",
    "20",
    "10",
    "Concessionário",
    "5",
    "30",
    "5",
    "2",
    "1",
    "912345678"
  ];

  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    exampleRow.map(d => `"${String(d).replace(/"/g, '""')}"`).join(',')
  ].join('\n');

  return csvContent;
};