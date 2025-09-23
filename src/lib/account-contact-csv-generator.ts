export const generateAccountContactCsvTemplate = (): string => {
  const headers = [
    "AM da Conta",
    "Tipo de Contacto",
    "Texto do Relatório",
    "Data do Contacto (YYYY-MM-DD HH:MM:SS)",
    "Meio de Contacto",
    "Nome Comercial",
    "Nome da Empresa",
    "ID CRM",
    "ID da Empresa Excel (OBRIGATÓRIO)",
    "Nome do Stand",
    "Assunto",
    "Nome da Pessoa de Contacto",
    "Grupo da Empresa",
    "Account Armatis",
    "Trimestre",
    "É Parceiro Credibom? (1 para Sim, 0 para Não)",
    "Enviar Email? (1 para Sim, 0 para Não)",
    "Tipo de Email",
    "Assunto do Email",
    "Corpo do Email",
    "URL do Anexo",
    "Email de Envio"
  ];

  const exampleRow = [
    "AM_Exemplo",
    "Chamada",
    "Relatório de acompanhamento mensal",
    "2023-10-26 10:30:00",
    "Telefone",
    "Comercial Lda.",
    "Empresa Exemplo SA",
    "CRM12345",
    "EMP001", // Exemplo de Company_ID do Excel
    "Stand Principal",
    "Reunião de acompanhamento",
    "João Silva",
    "Grupo A",
    "Armatis_001",
    "Q4",
    "1", // true
    "0", // false
    "Boas-vindas",
    "Bem-vindo à nossa plataforma!",
    "Olá [Nome], esperamos que goste da nossa plataforma.",
    "https://example.com/anexo.pdf",
    "envio@empresa.com"
  ];

  // Convert to CSV format
  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    exampleRow.map(d => `"${String(d).replace(/"/g, '""')}"`).join(',')
  ].join('\n');

  return csvContent;
};