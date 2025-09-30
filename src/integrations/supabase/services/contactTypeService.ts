import { supabase } from '../client';
import { showSuccess, showError } from '@/utils/toast';

export interface ContactType {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export const getContactTypes = async (): Promise<ContactType[]> => {
  const { data, error } = await supabase.from('contact_types').select('*');
  if (error) {
    showError(`Error fetching contact types: ${error.message}`);
    return [];
  }
  return data || [];
};

export const addContactType = async (name: string, userId: string): Promise<ContactType | null> => {
  const { data, error } = await supabase
    .from('contact_types')
    .insert([{ name, user_id: userId }])
    .select()
    .single();
  if (error) {
    showError(`Error adding contact type: ${error.message}`);
    return null;
  }
  showSuccess('Contact type added successfully');
  return data;
};

export const deleteContactType = async (id: string) => {
  const { error } = await supabase.from('contact_types').delete().eq('id', id);
  if (error) {
    showError(`Error deleting contact type: ${error.message}`);
    return;
  }
  showSuccess('Contact type deleted successfully');
};