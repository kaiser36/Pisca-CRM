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
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }

  return data.map(item => ({
      ...item,
      company_commercial_name: item.company?.commercial_name || 'N/A'
  })) as Analytics[];
}

/**
 * Creates a new analytic entry.
 */
export async function createAnalytic(analyticData: Omit<Analytics, 'id' | 'created_at' | 'updated_at' | 'company_commercial_name'>) {
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