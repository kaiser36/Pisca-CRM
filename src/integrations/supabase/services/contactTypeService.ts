import { supabase } from '../client';
import { showError, showSuccess } from '@/utils/toast';

export interface ContactType {
  id?: string;
  user_id: string;
  name: string;
  created_at?: string;
}

// Fetch all contact types for the current user
export const getContactTypes = async () => {
  const { data, error } = await supabase
    .from('contact_types')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    showError('Erro ao carregar os tipos de contacto');
    console.error('Error fetching contact types:', error);
    return [];
  }

  return data;
};

// Create a new contact type
export const createContactType = async (contactType: Omit<ContactType, 'id' | 'created_at' | 'user_id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        showError('Utilizador não autenticado');
        return null;
    }

    const { data, error } = await supabase
        .from('contact_types')
        .insert([{ ...contactType, user_id: user.id }])
        .select()
        .single();

    if (error) {
        showError('Erro ao criar o tipo de contacto');
        console.error('Error creating contact type:', error);
        return null;
    }

    showSuccess('Tipo de contacto criado com sucesso!');
    return data;
};

// Update an existing contact type
export const updateContactType = async (id: string, updates: Partial<ContactType>) => {
  const { data, error } = await supabase
    .from('contact_types')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    showError('Erro ao atualizar o tipo de contacto');
    console.error('Error updating contact type:', error);
    return null;
  }

  showSuccess('Tipo de contacto atualizado com sucesso!');
  return data;
};

// Delete a contact type
export const deleteContactType = async (id: string) => {
  const { error } = await supabase
    .from('contact_types')
    .delete()
    .eq('id', id);

  if (error) {
    showError('Erro ao apagar o tipo de contacto');
    console.error('Error deleting contact type:', error);
    return false;
  }

  showSuccess('Tipo de contacto apagado com sucesso!');
  return true;
};