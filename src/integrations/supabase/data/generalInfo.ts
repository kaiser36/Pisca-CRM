import { supabase } from '../client';
import { GeneralInfo } from '@/types/crm';

// Fetches general information for the current authenticated user
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

// Upserts general information for the current authenticated user
export async function upsertGeneralInfo(info: Partial<GeneralInfo>, userId: string): Promise<GeneralInfo> {
  const { data: existingInfo, error: fetchError } = await supabase
    .from('general_info')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching existing general info:', fetchError);
    throw new Error(fetchError.message);
  }

  const generalInfoData = {
    user_id: userId,
    title: info.title || 'Informação Geral', // Default title if not provided
    content: info.content,
    updated_at: new Date().toISOString(),
  };

  if (existingInfo) {
    // Update existing general info
    const { data, error } = await supabase
      .from('general_info')
      .update(generalInfoData)
      .eq('id', existingInfo.id)
      .select('*')
      .single();
    if (error) {
      console.error('Error updating general info:', error);
      throw new Error(error.message);
    }
    return data as GeneralInfo;
  } else {
    // Insert new general info
    const { data, error } = await supabase
      .from('general_info')
      .insert(generalInfoData)
      .select('*')
      .single();
    if (error) {
      console.error('Error inserting general info:', error);
      throw new Error(error.message);
    }
    return data as GeneralInfo;
  }
}