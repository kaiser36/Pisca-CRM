import { supabase } from '../client';
import { showSuccess, showError } from '@/utils/toast';

export interface ContactReportOption {
  id: string;
  user_id: string;
  contact_type_id: string;
  report_text: string;
  created_at: string;
}

export const getContactReportOptionsByContactTypeId = async (contactTypeId: string): Promise<ContactReportOption[]> => {
  const { data, error } = await supabase
    .from('contact_report_options')
    .select('*')
    .eq('contact_type_id', contactTypeId);
  if (error) {
    showError(`Error fetching report options: ${error.message}`);
    return [];
  }
  return data || [];
};

export const addContactReportOption = async (contactTypeId: string, reportText: string, userId: string): Promise<ContactReportOption | null> => {
  const { data, error } = await supabase
    .from('contact_report_options')
    .insert([{ contact_type_id: contactTypeId, report_text: reportText, user_id: userId }])
    .select()
    .single();
  if (error) {
    showError(`Error adding report option: ${error.message}`);
    return null;
  }
  showSuccess('Report option added successfully');
  return data;
};

export const deleteContactReportOption = async (id: string) => {
  const { error } = await supabase.from('contact_report_options').delete().eq('id', id);
  if (error) {
    showError(`Error deleting report option: ${error.message}`);
    return;
  }
  showSuccess('Report option deleted successfully');
};