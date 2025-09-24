export const generateDealCsvTemplate = (): string => {
  const headers = [
    "ID da Empresa Excel (OBRIGATÓRIO)",
    "Nome do Negócio (OBRIGATÓRIO)",
    "Status do Negócio (Prospecting, Qualification, Proposal, Negotiation, Closed Won, Closed Lost)",
    "Moeda (EUR, USD, GBP)",
    "Data de Fecho Esperada (YYYY-MM-DD)",
    "Etapa",
    "Prioridade (Low, Medium, High)",
    "Notas",
    "Tipo de Desconto Geral (none, percentage, amount)",
    "Valor do Desconto Geral"
  ];

  const exampleRow = [
    "EMP001", // Deve corresponder a um Company_id existente na tabela 'companies'
    "Venda de Viaturas Novas",
    "Prospecting",
    "EUR",
    "2024-12-31",
    "Initial Contact",
    "High",
    "Cliente interessado em 5 viaturas para a sua frota.",
    "percentage",
    "10"
  ];

  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    exampleRow.map(d => `"${String(d).replace(/"/g, '""')}"`).join(',')
  ].join('\n');

  return csvContent;
};