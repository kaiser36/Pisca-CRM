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