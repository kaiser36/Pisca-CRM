export interface Stand {
  Stand_ID: string;
  Company_id: string;
  Company_Name: string;
  Address: string;
  City: string;
  Postal_Code: string;
  Phone: string;
  Email: string;
  Contact_Person: string;
  // Add any other columns from your Excel file here
  // Example:
  // Latitude?: number;
  // Longitude?: number;
}

export interface Company {
  Company_id: string;
  Company_Name: string;
  stands: Stand[];
}