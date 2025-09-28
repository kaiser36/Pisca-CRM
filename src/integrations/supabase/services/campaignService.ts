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
    return [];
  }
  return data as Campaign[];
};