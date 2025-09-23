export const generateAdditionalCompanyDataCsvTemplate = (): string => {
  const headers = [
    "excel_company_id (OBRIGATÓRIO)",
    "Nome Comercial",
    "Email da empresa",
    "STAND_POSTAL_CODE",
    "Distrito",
    "Cidade",
    "Morada",
    "AM_OLD",
    "AM",
    "Stock STV",
    "API",
    "Site",
    "Stock na empresa",
    "Logotipo",
    "Classificação",
    "Percentagem de Importados",
    "Onde compra as viaturas",
    "Concorrencia",
    "Investimento redes sociais",
    "Investimento em portais",
    "Mercado b2b (1 para Sim, 0 para Não)",
    "Utiliza CRM (1 para Sim, 0 para Não)",
    "Qual o CRM",
    "Plano Indicado",
    "Mediador de credito (1 para Sim, 0 para Não)",
    "Link do Banco de Portugal",
    "Financeiras com acordo",
    "Data ultima visita (YYYY-MM-DD)",
    "Grupo",
    "Marcas representadas",
    "Tipo de empresa",
    "Quer CT (1 para Sim, 0 para Não)",
    "Quer ser parceiro Credibom (1 para Sim, 0 para Não)",
    "Autobiz"
  ];

  const exampleRow = [
    "EMP001", // Deve corresponder a um Company_id existente na tabela 'companies'
    "Comercial Lda.",
    "info@comercial.pt",
    "1000-123",
    "Lisboa",
    "Lisboa",
    "Rua da Liberdade, 45",
    "AM_Antigo_01",
    "AM_Atual_02",
    "500",
    "API_XYZ",
    "https://www.comercial.pt",
    "1200",
    "https://www.comercial.pt/logo.png",
    "Premium",
    "25.5",
    "Leilões",
    "Concorrente A, Concorrente B",
    "1500",
    "2000",
    "1", // Mercado b2b
    "1", // Utiliza CRM
    "Salesforce",
    "Plano Ouro",
    "1", // Mediador de credito
    "https://www.bancodeportugal.pt/link",
    "Banco X, Banco Y",
    "2023-10-20",
    "Grupo Alfa",
    "Marca A, Marca B",
    "Retalhista",
    "1", // Quer CT
    "0", // Quer ser parceiro Credibom
    "Info Autobiz Detalhada"
  ];

  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    exampleRow.map(d => `"${String(d).replace(/"/g, '""')}"`).join(',')
  ].join('\n');

  return csvContent;
};