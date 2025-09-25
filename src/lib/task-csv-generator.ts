export const generateTaskCsvTemplate = (): string => {
  const headers = [
    "company_excel_id (OBRIGATÓRIO)",
    "Nome Comercial da Empresa", // NEW: Added commercial name
    "Título (OBRIGATÓRIO)",
    "Descrição",
    "Data Limite (YYYY-MM-DD HH:MM:SS)",
    "Status (Pending, In Progress, Completed, Cancelled)",
    "Prioridade (Low, Medium, High)",
    "ID do Colaborador Atribuído (UUID)",
    "Nome do Colaborador Atribuído"
  ];

  const exampleRow = [
    "EMP001", // Deve corresponder a um Company_id existente na tabela 'companies'
    "Comercial Lda.", // NEW: Example commercial name
    "Contactar Cliente para Renovação",
    "Ligar para o cliente para discutir a renovação do plano e apresentar novas ofertas.",
    "2024-12-31 17:00:00",
    "Pending",
    "High",
    "a1b2c3d4-e5f6-7890-1234-567890abcdef", // Exemplo de UUID de um colaborador
    "João Silva"
  ];

  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    exampleRow.map(d => `"${String(d).replace(/"/g, '""')}"`).join(',')
  ].join('\n');

  return csvContent;
};