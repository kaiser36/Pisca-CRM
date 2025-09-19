export interface Stand {
  Stand_ID: string;
  Company_id: string;
  Company_Name: string; // Nome fiscal da empresa
  NIF: string; // NIF da empresa
  Address: string; // Morada do stand
  City: string; // Cidade do stand
  Postal_Code: string; // Código postal do stand
  Phone: string; // Telefone do stand
  Email: string; // Email do stand
  Contact_Person: string; // Nome da pessoa de contacto do stand
}

export interface Company {
  Company_id: string;
  Company_Name: string; // Nome fiscal da empresa
  NIF: string; // NIF da empresa
  Company_Email: string; // Email da empresa (Company Person Email)
  Company_Contact_Person: string; // Nome da pessoa que registou a conta (Company Person)
  stands: Stand[];
}