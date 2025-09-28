// src/integrations/supabase/services/campaignService.ts
import { supabase } from '../client'; // Correct import path
import { Campaign } from '../../../types/crm';

// Fetch all campaigns for a user
export const fetchCampaigns = async (userId: string): Promise<Campaign[]> => {
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
};

/**
 * Inserts a new campaign into the campaigns table.
 */
export async function insertCampaign(campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>): Promise<Campaign> {
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      user_id: campaign.user_id,
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      discount_type: campaign.discount_type,
      discount_value: campaign.discount_value,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      is_active: campaign.is_active,
      product_ids: campaign.product_ids,
      category: campaign.category,
    })
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
    .update({
      name: campaign.name,
      description: campaign.description,
      type: campaign.type,
      discount_type: campaign.discount_type,
      discount_value: campaign.discount_value,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      is_active: campaign.is_active,
      product_ids: campaign.product_ids,
      category: campaign.category,
      updated_at: new Date().toISOString(),
    })
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