import { supabase } from '../client';
import { showError } from '@/utils/toast';
import { ContactReportOption } from '@/types/crm';

export type { ContactReportOption };

export const getContactReportOptionsByContactTypeId = async (contactTypeId: string): Promise<ContactReportOption[]> => {
  const { data, error } = await supabase
    .from('contact_report_options')
    .select('*')
    .eq('contact_type_id', contactTypeId)
    .order('report_text', { ascending: true });

  if (error) {
    showError('Erro ao carregar as opções de relatório de contacto');
    console.error('Error fetching contact report options:', error);
    return [];
  }

  return data;
};