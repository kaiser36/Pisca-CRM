import { supabase } from '../client';
import { AccountContact } from '@/types/crm';

/**
 * Inserts a new account contact into the account_contacts table.
 */
export async function insertAccountContact(contact: Omit<AccountContact, 'id' | 'created_at'>): Promise<AccountContact> {
  const { data, error } = await supabase
    .from('account_contacts')
    .insert(contact)
    .select()
    .single();

  if (error) {
    console.error('Error inserting account contact:', error);
    throw new Error(error.message);
  }
  return data as AccountContact;
}

/**
 * Fetches all account contacts for a given company_excel_id and user_id.
 */
export async function fetchAccountContactsByCompanyExcelId(userId: string, companyExcelId: string): Promise<AccountContact[]> {
  const { data, error } = await supabase
    .from('account_contacts')
    .select('*')
    .eq('user_id', userId)
    .eq('company_excel_id', companyExcelId)
    .order('contact_date', { ascending: false });

  if (error) {
    console.error(`Error fetching account contacts for company_excel_id ${companyExcelId}:`, error);
    throw new Error(error.message);
  }
  return data as AccountContact[];
}