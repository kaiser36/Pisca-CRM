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