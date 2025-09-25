import { supabase } from '../client';
import { Campaign } from '@/types/crm';

/**
 * Fetches all campaigns for the current authenticated user.
 */
export async function fetchCampaigns(userId: string): Promise<Campaign[]> {
  if (!userId) {
    throw new Error("User ID is required to fetch campaigns.");
  }

  const { data, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching campaigns:', error);
    throw new Error(error.message);
  }

  return data as Campaign[];
}

/**
 * Inserts a new campaign into the campaigns table.
 */
export async function insertCampaign(campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .insert(campaign)
    .select()
    .single();

  if (error) {
    console.error('Error inserting campaign:', error);
    throw new Error(error.message);
  }
  return data as Campaign;
}

/**
 * Updates an existing campaign in the campaigns table.
 */
export async function updateCampaign(id: string, campaign: Partial<Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .update(campaign)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating campaign with id ${id}:`, error);
    throw new Error(error.message);
  }
  return data as Campaign;
}

/**
 * Deletes a campaign from the campaigns table.
 */
export async function deleteCampaign(id: string): Promise<void> {
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting campaign with id ${id}:`, error);
    throw new Error(error.message);
  }
}