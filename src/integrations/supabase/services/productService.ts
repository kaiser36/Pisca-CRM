import { supabase } from '../client';
import { Product } from '@/types/crm';

/**
 * Fetches all products for the current authenticated user.
 */
export async function fetchProducts(userId: string): Promise<Product[]> {
  if (!userId) {
    throw new Error("User ID is required to fetch products.");
  }

  const { data, error } = await supabase
    .from('produtos')
    .select('*')
    .eq('user_id', userId)
    .order('produto', { ascending: true });

  if (error) {
    console.error('Error fetching products:', error);
    throw new Error(error.message);
  }

  return data as Product[];
}

/**
 * Inserts a new product into the produtos table.
 */
export async function insertProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
  const { data, error } = await supabase
    .from('produtos')
    .insert(product)
    .select()
    .single();

  if (error) {
    console.error('Error inserting product:', error);
    throw new Error(error.message);
  }
  return data as Product;
}

/**
 * Updates an existing product in the produtos table.
 */
export async function updateProduct(id: string, product: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<Product> {
  const { data, error } = await supabase
    .from('produtos')
    .update(product)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating product with id ${id}:`, error);
    throw new Error(error.message);
  }
  return data as Product;
}

/**
 * Deletes a product from the produtos table.
 */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting product with id ${id}:`, error);
    throw new Error(error.message);
  }
}