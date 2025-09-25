import { supabase } from '../client';
import { EasyvistaType } from '@/types/crm';

/**
 * Fetches all Easyvista types for the current authenticated user.
 */
export async function fetchEasyvistaTypes(userId: string): Promise<EasyvistaType[]> {
  if (!userId) {
    throw new Error("User ID is required to fetch Easyvista types.");
  }

  const { data, error } = await supabase
    .from('easyvista_types')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching Easyvista types:', error);
    throw new Error(error.message);
  }

  return data as EasyvistaType[];
}

/**
 * Inserts a new Easyvista type into the easyvista_types table.
 */
export async function insertEasyvistaType(type: Omit<EasyvistaType, 'id' | 'created_at'>): Promise<EasyvistaType> {
  const { data, error } = await supabase
    .from('easyvista_types')
    .insert(type)
    .select()
    .single();

  if (error) {
    console.error('Error inserting Easyvista type:', error);
    throw new Error(error.message);
  }
  return data as EasyvistaType;
}

/**
 * Updates an existing Easyvista type in the easyvista_types table.
 */
export async function updateEasyvistaType(id: string, type: Partial<Omit<EasyvistaType, 'id' | 'created_at' | 'user_id'>>): Promise<EasyvistaType> {
  const { data, error } = await supabase
    .from('easyvista_types')
    .update(type)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating Easyvista type with id ${id}:`, error);
    throw new Error(error.message);
  }
  return data as EasyvistaType;
}

/**
 * Deletes an Easyvista type from the easyvista_types table.
 */
export async function deleteEasyvistaType(id: string): Promise<void> {
  const { error } = await supabase
    .from('easyvista_types')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting Easyvista type with id ${id}:`, error);
    throw new Error(error.message);
  }
}