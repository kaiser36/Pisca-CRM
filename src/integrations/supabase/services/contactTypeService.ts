import { supabase } from '@/integrations/supabase/client';
import { ContactType } from '@/types/crm';

export const fetchContactTypesWithReports = async (userId: string): Promise<ContactType[]> => {
  const { data, error } = await supabase
    .from('contact_types')
    .select('*, contact_report_options(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching contact types:', error);
    throw new Error(error.message);
  }

  return data;
};

export const insertContactType = async (userId: string, name: string): Promise<ContactType> => {
  const { data, error } = await supabase
    .from('contact_types')
    .insert({ user_id: userId, name })
    .select()
    .single();

  if (error) {
    console.error('Error inserting contact type:', error);
    throw new Error(error.message);
  }

  return data;
};

export const deleteContactType = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('contact_types')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting contact type:', error);
    throw new Error(error.message);
  }
};

export const insertReportOption = async (userId: string, contactTypeId: string, reportText: string) => {
  const { data, error } = await supabase
    .from('contact_report_options')
    .insert({ user_id: userId, contact_type_id: contactTypeId, report_text: reportText })
    .select()
    .single();

  if (error) {
    console.error('Error inserting report option:', error);
    throw new Error(error.message);
  }

  return data;
};

export const deleteReportOption = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('contact_report_options')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting report option:', error);
    throw new Error(error.message);
  }
};