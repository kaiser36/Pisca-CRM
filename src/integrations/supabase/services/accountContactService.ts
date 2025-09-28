import { supabase } from '../client';
import { AccountContact } from '@/types/crm';

/**
 * Inserts a new account contact into the account_contacts table.
 */
export async function insertAccountContact(contact: Omit<AccountContact, 'id' | 'created_at' | 'company_db_id'> & { company_db_id?: string }): Promise<AccountContact> {
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

/**
 * Updates an existing account contact.
 */
export async function updateAccountContact(id: string, updates: Partial<AccountContact>): Promise<AccountContact> {
  const { data, error } = await supabase
    .from('account_contacts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating account contact:', error);
    throw new Error(error.message);
  }
  return data as AccountContact;
}

/**
 * Upserts account contact data into the account_contacts table.
 */
export async function upsertAccountContacts(contacts: AccountContact[], userId: string): Promise<void> {
  // Fetch company_db_ids for all unique company_excel_ids in the batch
  const uniqueCompanyExcelIds = Array.from(new Set(contacts.map(contact => contact.company_excel_id)));
  const { data: companies, error: companyError } = await supabase
    .from('companies')
    .select('id, company_id')
    .eq('user_id', userId)
    .in('company_id', uniqueCompanyExcelIds);

  if (companyError) {
    console.error('Error fetching company IDs for upserting account contacts:', companyError);
    throw new Error(companyError.message);
  }

  const companyIdMap = new Map<string, string>();
  companies.forEach(company => companyIdMap.set(company.company_id, company.id));

  const dataToUpsert = contacts.map(contact => {
    const companyDbId = companyIdMap.get(contact.company_excel_id);
    if (!companyDbId) {
      console.warn(`Company DB ID not found for excel_company_id: ${contact.company_excel_id}. Skipping contact.`);
      return null; // Skip contacts that cannot be linked
    }

    return {
      user_id: userId,
      company_db_id: companyDbId, // NEW: Populate company_db_id
      account_am: contact.account_am || null,
      contact_type: contact.contact_type || null,
      report_text: contact.report_text || null,
      contact_date: contact.contact_date || null,
      contact_method: contact.contact_method || null,
      commercial_name: contact.commercial_name || null,
      company_name: contact.company_name || null,
      crm_id: contact.crm_id || null,
      company_excel_id: contact.company_excel_id,
      stand_name: contact.stand_name || null,
      subject: contact.subject || null,
      contact_person_name: contact.contact_person_name || null,
      company_group: contact.company_group || null,
      account_armatis: contact.account_armatis || null,
      quarter: contact.quarter || null,
      is_credibom_partner: contact.is_credibom_partner || false,
      send_email: contact.send_email || false,
      email_type: contact.email_type || null,
      email_subject: contact.email_subject || null,
      email_body: contact.email_body || null,
      attachment_url: contact.attachment_url || null,
      sending_email: contact.sending_email || null,
    };
  }).filter(Boolean); // Filter out nulls

  if (dataToUpsert.length === 0) {
    return;
  }

  const { error } = await supabase
    .from('account_contacts')
    .upsert(dataToUpsert, { onConflict: 'company_excel_id, contact_person_name, contact_date, user_id' }); // Ensure uniqueness per user

  if (error) {
    console.error('Error upserting account contacts:', error);
    throw new Error(error.message);
  }
}