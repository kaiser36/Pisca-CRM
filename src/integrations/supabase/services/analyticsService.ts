// src/integrations/supabase/services/analyticsService.ts
import { supabase } from '../client'; // CORRECTED: Changed from '../supabaseClient' to '../client'
import { Analytics } from '../../../types/crm'; // Removed Campaign import as it's now in campaignService

// Fetch all analytics for a company, now including campaign data
export const fetchAnalyticsByCompanyExcelId = async (
  companyExcelId: string,
  userId: string,
  includeArchived: boolean = false
): Promise<Analytics[]> => {
  let query = supabase
    .from('analytics')
    .select('*, campaign:campaign_id (id, name)') // Fetch related campaign data
    .eq('company_excel_id', companyExcelId)
    .eq('user_id', userId);

  // Apply archive filter if not includeArchived
  if (!includeArchived) {
    query = query.not('category', 'eq', 'Arquivo');
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching analytics:', error);
    return [];
  }

  // Map the fetched data to the Analytics interface
  return data.map((item: any) => ({ // Use 'any' for item to handle dynamic 'campaign' property
    ...item,
    campaign_id: item.campaign?.id || null, // Access campaign_id and campaign_name from the joined data
    campaign_name: item.campaign?.name || null,
  })) as Analytics[];
};

// Insert a new analytics record, including campaign_id
export const insertAnalytics = async (
  analytics: Omit<Analytics, 'id' | 'created_at' | 'updated_at'> // ADDED 'updated_at' to Omit
): Promise<Analytics | null> => {
  // Destructure the analytics object and handle undefined campaign_id
  const { campaign_id, ...analyticsData } = analytics;
  const { data, error } = await supabase
    .from('analytics')
    .insert({
      ...analyticsData,
      ...(campaign_id && { campaign_id }), // Conditionally include campaign_id
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error inserting analytics:', error);
    return null;
  }
  // No need to map data here, Supabase returns the right format
  return data as Analytics;
};

// Update an existing analytics record, including campaign_id
export const updateAnalytics = async (
  analyticsId: string,
  // CORRECTED TYPE: Omit fields that are not updated by the form or are handled by the service
  updatedAnalytics: Partial<Omit<Analytics, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'company_excel_id'>>
): Promise<Analytics | null> => {
  // Destructure updatedAnalytics to conditionally include campaign_id
  const { campaign_id, ...updateData } = updatedAnalytics;

  // Set the update object
  const updateObj = {
    ...updateData,
    ...(campaign_id && { campaign_id }), // Conditionally include campaign_id
    updated_at: new Date().toISOString(), // This is added by the service
  };

  const { data, error } = await supabase
    .from('analytics')
    .update(updateObj)
    .eq('id', analyticsId)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating analytics:', error);
    return null;
  }
  return data as Analytics;
};

// Delete an analytics record
export const deleteAnalytics = async (analyticsId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('analytics')
    .delete()
    .eq('id', analyticsId);

  if (error) {
    console.error('Error deleting analytics:', error);
    return false;
  }
  return true;
};