import { supabase } from '../client';
import { GeneralInfo } from '@/types/crm';

/**
 * Fetches general information for a given user.
 */
export async function fetchGeneralInfo(userId: string): Promise<GeneralInfo | null> {
  const { data, error } = await supabase
    .from('general_info')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows found"
    console.error('Error fetching general info:', error);
    throw new Error(error.message);
  }

  return data as GeneralInfo | null;
}

/**
 * Upserts general information for a given user.
 */
export async function upsertGeneralInfo(info: Partial<GeneralInfo>, userId: string): Promise<GeneralInfo> {
  const dataToUpsert = {
    user_id: userId,
    title: info.title || 'Informação Geral', // Default title if not provided
    content: info.content || null,
    updated_at: new Date().toISOString(),
  };

  if (info.id) {
    // Update existing record
    const { data, error } = await supabase
      .from('general_info')
      .update(dataToUpsert)
      .eq('id', info.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating general info:', error);
      throw new Error(error.message);
    }
    return data as GeneralInfo;
  } else {
    // Insert new record
    const { data, error } = await supabase
      .from('general_info')
      .insert(dataToUpsert)
      .select('*')
      .single();

    if (error) {
      console.error('Error inserting general info:', error);
      throw new Error(error.message);
    }
    return data as GeneralInfo;
  }
}