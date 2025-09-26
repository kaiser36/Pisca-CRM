import { supabase } from '../client';
import { Account } from '@/types/crm';

/**
 * Fetches all accounts for the current authenticated user.
 */
export async function fetchAccounts(userId: string): Promise<Account[]> {
  if (!userId) {
    throw new Error("User ID is required to fetch accounts.");
  }

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('account_name', { ascending: true });

  if (error) {
    console.error('Error fetching accounts:', error);
    throw new Error(error.message);
  }

  return data as Account[];
}

/**
 * Inserts a new account into the accounts table.
 */
export async function insertAccount(account: Omit<Account, 'id' | 'created_at'>): Promise<Account> {
  const { data, error } = await supabase
    .from('accounts')
    .insert(account)
    .select()
    .single();

  if (error) {
    console.error('Error inserting account:', error);
    throw new Error(error.message);
  }
  return data as Account;
}

/**
 * Updates an existing account in the accounts table.
 */
export async function updateAccount(id: string, account: Partial<Omit<Account, 'id' | 'created_at' | 'user_id'>>): Promise<Account> {
  const { data, error } = await supabase
    .from('accounts')
    .update(account)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating account with id ${id}:`, error);
    throw new Error(error.message);
  }
  return data as Account;
}

/**
 * Deletes an account from the accounts table.
 */
export async function deleteAccount(id: string): Promise<void> {
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting account with id ${id}:`, error);
    throw new Error(error.message);
  }
}