import { supabase } from '../client';
import { Analytics } from '@/types/crm';

/**
 * Fetches all analytics data, joining with company commercial name.
 */
export async function fetchAllAnalytics(): Promise<Analytics[]> {
  const { data, error } = await supabase
    .from('analytics')
    .select(`
      *,
      company:companies (
        commercial_name
      ),
      campaign:campaigns (
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }

  return data.map(item => ({
      ...item,
      company_commercial_name: item.company?.commercial_name || 'N/A',
      campaign_name: item.campaign?.name || 'N/A'
  })) as Analytics[];
}

/**
 * Fetches analytics data for a specific company by its Excel ID.
 */
export async function fetchAnalyticsByCompanyExcelId(userId: string, companyExcelId: string): Promise<Analytics[]> {
  const { data, error } = await supabase
    .from('analytics')
    .select(`
      *,
      campaign:campaigns (
        name
      )
    `)
    .eq('user_id', userId)
    .eq('company_excel_id', companyExcelId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching analytics for company ${companyExcelId}:`, error);
    throw error;
  }

  return data.map(item => ({
    ...item,
    campaign_name: item.campaign?.name || 'N/A'
  })) as Analytics[];
}

/**
 * Creates a new analytic entry.
 */
export async function createAnalytic(analyticData: Omit<Analytics, 'id' | 'created_at' | 'updated_at' | 'company_commercial_name' | 'campaign_name'>) {
    const { data, error } = await supabase
        .from('analytics')
        .insert([analyticData])
        .select()
        .single();

    if (error) {
        console.error('Error creating analytic:', error);
        throw error;
    }
    return data;
}

/**
 * Updates an existing analytic entry.
 */
export async function updateAnalytic(analyticId: string, analyticData: Partial<Omit<Analytics, 'id' | 'created_at' | 'updated_at' | 'company_commercial_name' | 'user_id' | 'campaign_name'>>) {
    const { data, error } = await supabase
        .from('analytics')
        .update(analyticData)
        .eq('id', analyticId)
        .select()
        .single();

    if (error) {
        console.error('Error updating analytic:', error);
        throw error;
    }
    return data;
}

/**
 * Deletes an analytic entry.
 */
export async function deleteAnalytic(analyticId: string): Promise<void> {
    const { error } = await supabase
        .from('analytics')
        .delete()
        .eq('id', analyticId);

    if (error) {
        console.error('Error deleting analytic:', error);
        throw new Error(error.message);
    }
}