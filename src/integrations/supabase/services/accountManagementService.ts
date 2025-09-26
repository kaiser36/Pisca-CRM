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
 * Fetches a single account by its user_id.
 */
export async function fetchAccountByUserId(userId: string): Promise<Account | null> {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('Error fetching account by user ID:', error);
    throw new Error(error.message);
  }
  return data as Account | null;
}

/**
 * Fetches an account by email where user_id is NULL (not yet linked).
 */
export async function fetchAccountByEmailAndNullUserId(email: string): Promise<Account | null> {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('email', email)
    .is('user_id', null)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching account by email and null user ID:', error);
    throw new Error(error.message);
  }
  return data as Account | null;
}

/**
 * Links an existing account to a user by updating its user_id.
 */
export async function linkAccountToUser(accountId: string, userId: string): Promise<Account> {
  const { data, error } = await supabase
    .from('accounts')
    .update({ user_id: userId })
    .eq('id', accountId)
    .select()
    .single();

  if (error) {
    console.error(`Error linking account ${accountId} to user ${userId}:`, error);
    throw new Error(error.message);
  }
  return data as Account;
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

/**
 * Fetches distinct roles from the accounts table.
 */
export async function fetchDistinctAccountRoles(): Promise<string[]> {
  const { data, error } = await supabase
    .from('accounts')
    .select('role', { distinct: true }); // Corrigido: Use select com a opção distinct

  if (error) {
    console.error('Error fetching distinct account roles:', error);
    throw new Error(error.message);
  }
  return data.map(row => row.role).filter((role): role is string => role !== null);
}