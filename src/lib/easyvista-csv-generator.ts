export const generateEasyvistaCsvTemplate = (): string => {
  const headers = [
    "company_excel_id (OBRIGATÓRIO)",
    "Nome comercial",
    "EV_ID (OBRIGATÓRIO)",
    "Data Criação (YYYY-MM-DD HH:MM:SS)",
    "Status (Criado, Em validação, Em tratamento, Resolvido, Cancelado)", // UPDATED: Status options
    "Account",
    "Titulo",
    "Descrição",
    "Anexos (URLs separados por ';')",
    "Ultima actualização (YYYY-MM-DD HH:MM:SS)",
    "Tipo de report",
    "PV (1 para Sim, 0 para Não)",
    "Tipo EVS",
    "Urgência (Alto, Médio, Baixo)",
    "Email Pisca",
    "Pass Pisca",
    "Client ID",
    "Client Secret",
    "Integração",
    "NIF da empresa",
    "Campanha",
    "Duração do acordo",
    "Plano do acordo",
    "Valor sem iva",
    "ID_Proposta",
    "Account Armatis"
  ];

  const exampleRow = [
    "EMP001", // Deve corresponder a um Company_id existente na tabela 'companies'
    "Comercial Lda.",
    "EV001",
    "2023-10-26 10:00:00",
    "Criado", // UPDATED: Example status
    "Account Manager A",
    "Implementação de Nova Funcionalidade",
    "Detalhes sobre a implementação da funcionalidade X para o cliente Y.",
    "https://example.com/anexo1.pdf;https://example.com/anexo2.jpg",
    "2023-10-26 11:30:00",
    "Geral",
    "1", // PV
    "EVS Tipo A",
    "Médio",
    "email@pisca.com",
    "password123",
    "client_id_abc",
    "client_secret_xyz",
    "API Direta",
    "987654321",
    "Campanha de Natal",
    "12 meses",
    "Plano Básico",
    "1500.00",
    "PROP2023-001",
    "Armatis_AM_001"
  ];

  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    exampleRow.map(d => `"${String(d).replace(/"/g, '""')}"`).join(',')
  ].join('\n');

  return csvContent;
};