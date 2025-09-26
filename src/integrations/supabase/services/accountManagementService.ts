import { supabase } from '../client';
import { Account, UserProfile } from '@/types/crm';

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

/**
 * Updates a user's profile in the profiles table.
 */
export async function updateUserProfile(userId: string, profile: Partial<Omit<UserProfile, 'id' | 'updated_at'>>): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...profile, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating user profile for user ${userId}:`, error);
    throw new Error(error.message);
  }
  return data as UserProfile;
}

/**
 * Uploads a user avatar to Supabase storage.
 * Returns the public URL of the uploaded image.
 */
export async function uploadUserAvatar(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`; // Unique file name
  const filePath = `${userId}/avatars/${fileName}`; // Store under user's ID in 'avatars' subfolder

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    throw new Error(`Falha ao carregar a imagem: ${uploadError.message}`);
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Deletes a user avatar from Supabase storage.
 * Expects the full path within the 'avatars' bucket (e.g., 'user_id/avatars/filename.jpg').
 */
export async function deleteUserAvatar(filePath: string): Promise<void> {
  const { error: deleteError } = await supabase.storage
    .from('avatars')
    .remove([filePath]);

  if (deleteError) {
    console.error('Error deleting avatar:', deleteError);
    throw new Error(`Falha ao eliminar a imagem: ${deleteError.message}`);
  }
}