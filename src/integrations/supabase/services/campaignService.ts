import { supabase } from '../client';
import { Campaign } from '@/types/crm';

/**
 * Fetches all campaigns for the current authenticated user, including associated product IDs.
 */
export async function fetchCampaigns(userId: string): Promise<Campaign[]> {
  if (!userId) {
    throw new Error("User ID is required to fetch campaigns.");
  }

  const { data, error } = await supabase
    .from('campaigns')
    .select('*, campaign_products(product_id)') // Select campaign_products to get associated product_ids
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching campaigns:', error);
    throw new Error(error.message);
  }

  // Map the fetched data to include product_ids directly in the Campaign object
  return data.map(campaign => ({
    ...campaign,
    product_ids: campaign.campaign_products ? campaign.campaign_products.map((cp: { product_id: string }) => cp.product_id) : [],
  })) as Campaign[];
}

/**
 * Inserts a new campaign into the campaigns table and associates it with products.
 */
export async function insertCampaign(campaign: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>): Promise<Campaign> {
  const { product_ids, ...campaignData } = campaign; // Extract product_ids

  // 1. Insert the main campaign data
  const { data: newCampaign, error: campaignError } = await supabase
    .from('campaigns')
    .insert(campaignData)
    .select()
    .single();

  if (campaignError) {
    console.error('Error inserting main campaign:', campaignError);
    throw new Error(campaignError.message);
  }

  // 2. Insert associated products into campaign_products table
  if (product_ids && product_ids.length > 0) {
    const campaignProductsToInsert = product_ids.map(productId => ({
      campaign_id: newCampaign.id,
      product_id: productId,
    }));

    const { error: cpError } = await supabase
      .from('campaign_products')
      .insert(campaignProductsToInsert);

    if (cpError) {
      console.error('Error inserting campaign products:', cpError);
      // Optionally, you might want to roll back the main campaign insertion here
      throw new Error(cpError.message);
    }
  }

  return { ...newCampaign, product_ids: product_ids || [] } as Campaign;
}

/**
 * Updates an existing campaign in the campaigns table and its associated products.
 */
export async function updateCampaign(id: string, campaign: Partial<Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<Campaign> {
  const { product_ids, ...campaignData } = campaign; // Extract product_ids

  // 1. Update the main campaign data
  const { data: updatedCampaign, error: campaignError } = await supabase
    .from('campaigns')
    .update(campaignData)
    .eq('id', id)
    .select()
    .single();

  if (campaignError) {
    console.error(`Error updating main campaign with id ${id}:`, campaignError);
    throw new Error(campaignError.message);
  }

  // 2. Handle associated products in campaign_products table
  if (product_ids !== undefined) { // Only update if product_ids is provided in the payload
    // For simplicity, delete all existing campaign_products for this campaign and re-insert
    const { error: deleteError } = await supabase
      .from('campaign_products')
      .delete()
      .eq('campaign_id', id);

    if (deleteError) {
      console.error(`Error deleting existing campaign products for campaign ${id}:`, deleteError);
      throw new Error(deleteError.message);
    }

    if (product_ids.length > 0) {
      const campaignProductsToInsert = product_ids.map(productId => ({
        campaign_id: id,
        product_id: productId,
      }));

      const { error: insertError } = await supabase
        .from('campaign_products')
        .insert(campaignProductsToInsert);

      if (insertError) {
        console.error(`Error re-inserting campaign products for campaign ${id}:`, insertError);
        throw new Error(insertError.message);
      }
    }
  }

  return { ...updatedCampaign, product_ids: product_ids || [] } as Campaign;
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