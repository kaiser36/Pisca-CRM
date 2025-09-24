export const generateEmployeeCsvTemplate = (): string => {
  const headers = [
    "company_excel_id (OBRIGATÓRIO)",
    "Nome do Colaborador (OBRIGATÓRIO)",
    "Telemóvel",
    "Email",
    "Cargo",
    "Nome Comercial da Empresa",
    "URL da Imagem",
    "ID do Stand (Excel)",
    "Nome do Stand"
  ];

  const exampleRow = [
    "EMP001", // Deve corresponder a um Company_id existente na tabela 'companies'
    "Ana Silva",
    "912345678",
    "ana.silva@empresa.com",
    "Vendedor",
    "Comercial Lda.",
    "https://example.com/ana_silva.jpg",
    "STAND001", // Deve corresponder a um Stand_ID existente na tabela 'stands'
    "Stand Principal"
  ];

  const csvContent = [
    headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
    exampleRow.map(d => `"${String(d).replace(/"/g, '""')}"`).join(',')
  ].join('\n');

  return csvContent;
};