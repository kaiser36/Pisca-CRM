import { supabase } from '../client';
import { Analytics } from '@/types/crm';

/**
 * Inserts a new analytics record into the analytics table.
 */
export async function insertAnalytics(analytics: Omit<Analytics, 'id' | 'created_at' | 'updated_at'>): Promise<Analytics> {
  const { data, error } = await supabase
    .from('analytics')
    .insert({
      user_id: analytics.user_id,
      company_db_id: analytics.company_db_id || null,
      company_excel_id: analytics.company_excel_id,
      title: analytics.title,
      description: analytics.description || null,
      analysis_date: analytics.analysis_date || null,
      category: analytics.category || null,
      result: analytics.result || null,
      start_date: analytics.start_date || null,
      end_date: analytics.end_date || null,
      views: analytics.views || null,
      clicks: analytics.clicks || null,
      phone_views: analytics.phone_views || null,
      whatsapp_interactions: analytics.whatsapp_interactions || null,
      leads_email: analytics.leads_email || null,
      location_clicks: analytics.location_clicks || null,
      total_ads: analytics.total_ads || null,
      favorites: analytics.favorites || null,
      total_cost: analytics.total_cost || null,
      revenue: analytics.revenue || null,
      phone_views_percentage: analytics.phone_views_percentage || 100, // NEW
      whatsapp_interactions_percentage: analytics.whatsapp_interactions_percentage || 100, // NEW
      total_leads: analytics.total_leads || null, // NEW
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting analytics:', error);
    throw new Error(error.message);
  }
  return data as Analytics;
}

/**
 * Fetches all analytics records for a given company_excel_id and user_id.
 */
export async function fetchAnalyticsByCompanyExcelId(userId: string, companyExcelId: string): Promise<Analytics[]> {
  const { data, error } = await supabase
    .from('analytics')
    .select('*')
    .eq('user_id', userId)
    .eq('company_excel_id', companyExcelId)
    .order('analysis_date', { ascending: false });

  if (error) {
    console.error(`Error fetching analytics for company_excel_id ${companyExcelId}:`, error);
    throw new Error(error.message);
  }
  return data as Analytics[];
}

/**
 * Updates an existing analytics record in the analytics table.
 */
export async function updateAnalytics(id: string, analytics: Partial<Omit<Analytics, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'company_excel_id'>>): Promise<Analytics> {
  const { data, error } = await supabase
    .from('analytics')
    .update({
      title: analytics.title,
      description: analytics.description,
      analysis_date: analytics.analysis_date,
      category: analytics.category,
      result: analytics.result,
      company_db_id: analytics.company_db_id,
      start_date: analytics.start_date,
      end_date: analytics.end_date,
      views: analytics.views,
      clicks: analytics.clicks,
      phone_views: analytics.phone_views,
      whatsapp_interactions: analytics.whatsapp_interactions,
      leads_email: analytics.leads_email,
      location_clicks: analytics.location_clicks,
      total_ads: analytics.total_ads,
      favorites: analytics.favorites,
      total_cost: analytics.total_cost,
      revenue: analytics.revenue,
      phone_views_percentage: analytics.phone_views_percentage, // NEW
      whatsapp_interactions_percentage: analytics.whatsapp_interactions_percentage, // NEW
      total_leads: analytics.total_leads, // NEW
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating analytics with id ${id}:`, error);
    throw new Error(error.message);
  }
  return data as Analytics;
}

/**
 * Deletes an analytics record from the analytics table.
 */
export async function deleteAnalytics(id: string): Promise<void> {
  const { error } = await supabase
    .from('analytics')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting analytics with id ${id}:`, error);
    throw new Error(error.message);
  }
}