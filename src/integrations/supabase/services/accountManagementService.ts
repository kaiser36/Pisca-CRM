import { supabase } from '../client';
import { Account, UserProfile } from '@/types/crm';
import { User } from '@supabase/supabase-js';

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
 * Fetches all users from auth.users that are not currently linked to an AM account.
 * (This function is now less relevant for the new linking flow, but kept for other potential uses)
 */
export async function fetchAuthUsersNotLinkedToAccount(): Promise<{ id: string; email: string }[]> {
  const { data, error: authUsersError } = await supabase.auth.admin.listUsers();

  if (authUsersError) {
    console.error('Error fetching auth users:', authUsersError);
    throw new Error(authUsersError.message);
  }

  if (!data || !data.users) {
    return [];
  }

  const authUsersList: User[] = data.users;

  const { data: linkedAccounts, error: linkedAccountsError } = await supabase
    .from('accounts')
    .select('auth_user_id')
    .not('auth_user_id', 'is', null);

  if (linkedAccountsError) {
    console.error('Error fetching linked accounts:', linkedAccountsError);
    throw new Error(linkedAccountsError.message);
  }

  const linkedAuthUserIds = new Set(linkedAccounts.map(acc => acc.auth_user_id));

  const unlinkedUsers = authUsersList
    .filter((user: User) => !linkedAuthUserIds.has(user.id))
    .map((user: User) => ({ id: user.id, email: user.email || 'N/A' }));

  return unlinkedUsers;
}

/**
 * Fetches a single AM account by its auth_user_id.
 */
export async function fetchAccountByAuthUserId(authUserId: string): Promise<Account | null> {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching account by auth_user_id:', error);
    throw new Error(error.message);
  }

  return data as Account | null;
}

/**
 * Fetches AM accounts that are either unlinked or currently linked to the specified userId.
 * This is used to populate the dropdown for linking an AM to a user profile.
 */
export async function fetchAvailableAmAccountsForLinking(userId: string): Promise<Account[]> {
  if (!userId) {
    throw new Error("User ID is required to fetch available AM accounts for linking.");
  }

  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId) // Ensure only AMs belonging to the current user's scope are fetched
    .or('auth_user_id.is.null,auth_user_id.eq.' + userId) // Either unlinked OR linked to current user
    .order('account_name', { ascending: true });

  if (error) {
    console.error('Error fetching available AM accounts for linking:', error);
    throw new Error(error.message);
  }

  return data as Account[];
}

/**
 * Links or unlinks a user to an AM account by updating the auth_user_id in the accounts table.
 * This function handles clearing previous links and setting new ones.
 */
export async function updateAmAccountLink(userId: string, newAmAccountId: string | null): Promise<void> {
  // 1. Find the currently linked AM account for this user (if any)
  const { data: currentLinkedAm, error: fetchCurrentError } = await supabase
    .from('accounts')
    .select('id')
    .eq('auth_user_id', userId)
    .eq('user_id', userId) // Ensure it's within the user's scope
    .maybeSingle(); // Use maybeSingle to handle no rows found gracefully

  if (fetchCurrentError) {
    console.error('Error fetching current linked AM account:', fetchCurrentError);
    throw new Error(fetchCurrentError.message);
  }

  // 2. If there's a currently linked AM and it's different from the new one, unlink it
  if (currentLinkedAm && currentLinkedAm.id !== newAmAccountId) {
    const { error: unlinkError } = await supabase
      .from('accounts')
      .update({ auth_user_id: null })
      .eq('id', currentLinkedAm.id);

    if (unlinkError) {
      console.error(`Error unlinking previous AM account ${currentLinkedAm.id}:`, unlinkError);
      throw new Error(unlinkError.message);
    }
  }

  // 3. If a new AM account is provided, link it to the user
  if (newAmAccountId) {
    const { error: linkError } = await supabase
      .from('accounts')
      .update({ auth_user_id: userId })
      .eq('id', newAmAccountId)
      .eq('user_id', userId); // Ensure it's within the user's scope

    if (linkError) {
      console.error(`Error linking new AM account ${newAmAccountId} to user ${userId}:`, linkError);
      throw new Error(linkError.message);
    }
  }
}


/**
 * Inserts a new account into the accounts table.
 */
export async function insertAccount(account: Omit<Account, 'id' | 'created_at'>): Promise<Account> {
  const { data, error } = await supabase
    .from('accounts')
    .insert({
      user_id: account.user_id,
      account_name: account.account_name,
      am: account.am,
      phone_number: account.phone_number,
      email: account.email,
      photo_url: account.photo_url,
      district: account.district,
      credibom_email: account.credibom_email,
      role: account.role,
      auth_user_id: account.auth_user_id || null,
    })
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
    .update({
      account_name: account.account_name,
      am: account.am,
      phone_number: account.phone_number,
      email: account.email,
      photo_url: account.photo_url,
      district: account.district,
      credibom_email: account.credibom_email,
      role: account.role,
      auth_user_id: account.auth_user_id === '' ? null : account.auth_user_id,
    })
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
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${userId}/avatars/${fileName}`;

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