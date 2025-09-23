import { supabase } from '../client';
import { Negocio } from '@/types/crm';

/**
 * Inserts a new deal into the negocios table.
 */
export async function insertDeal(deal: Omit<Negocio, 'id' | 'created_at' | 'updated_at' | 'commercial_name' | 'product_name' | 'product_category' | 'product_total_price'>): Promise<Negocio> {
  const { data, error } = await supabase
    .from('negocios')
    .insert(deal)
    .select()
    .single();

  if (error) {
    console.error('Error inserting deal:', error);
    throw new Error(error.message);
  }
  return data as Negocio;
}

/**
 * Fetches all deals for a given company_excel_id and user_id,
 * manually joining commercial names and product names from related tables.
 */
export async function fetchDealsByCompanyExcelId(userId: string, companyExcelId: string): Promise<Negocio[]> {
  // 1. Fetch deals from the 'negocios' table
  const { data: dealsData, error: dealsError } = await supabase
    .from('negocios')
    .select('*')
    .eq('user_id', userId)
    .eq('company_excel_id', companyExcelId)
    .order('created_at', { ascending: false });

  if (dealsError) {
    console.error(`Error fetching deals for company_excel_id ${companyExcelId}:`, dealsError);
    throw new Error(dealsError.message);
  }

  if (!dealsData || dealsData.length === 0) {
    return [];
  }

  // 2. Get unique company_excel_ids from the fetched deals
  const uniqueExcelCompanyIds = Array.from(new Set(dealsData.map(deal => deal.company_excel_id)));
  const uniqueProductIds = Array.from(new Set(dealsData.map(deal => deal.product_id).filter((id): id is string => id !== null && id !== undefined)));

  // 3. Fetch commercial names from 'company_additional_excel_data'
  const { data: additionalData, error: additionalError } = await supabase
    .from('company_additional_excel_data')
    .select('excel_company_id, "Nome Comercial"')
    .eq('user_id', userId)
    .in('excel_company_id', uniqueExcelCompanyIds);

  if (additionalError) {
    console.error('Error fetching additional company data:', additionalError);
    // Don't throw, just log and proceed without this data if it fails
  }

  const additionalNamesMap = new Map<string, string>();
  additionalData?.forEach(row => {
    if (row.excel_company_id && row["Nome Comercial"]) {
      additionalNamesMap.set(row.excel_company_id, row["Nome Comercial"]);
    }
  });

  // 4. Fetch commercial names from 'companies' table
  const { data: companiesData, error: companiesError } = await supabase
    .from('companies')
    .select('company_id, commercial_name')
    .eq('user_id', userId)
    .in('company_id', uniqueExcelCompanyIds);

  if (companiesError) {
    console.error('Error fetching companies data:', companiesError);
    // Don't throw, just log and proceed without this data if it fails
  }

  const companyNamesMap = new Map<string, string>();
  companiesData?.forEach(row => {
    if (row.company_id && row.commercial_name) {
      companyNamesMap.set(row.company_id, row.commercial_name);
    }
  });

  // 5. Fetch product names, categories, and total prices from 'produtos' table
  let productDetailsMap = new Map<string, { produto: string; categoria: string | null; preco_total: number | null }>();
  if (uniqueProductIds.length > 0) {
    const { data: productsData, error: productsError } = await supabase
      .from('produtos')
      .select('id, produto, categoria, preco_total')
      .eq('user_id', userId)
      .in('id', uniqueProductIds);

    if (productsError) {
      console.error('Error fetching products data:', productsError);
    } else {
      productsData?.forEach(row => {
        if (row.id && row.produto) {
          productDetailsMap.set(row.id, {
            produto: row.produto,
            categoria: row.categoria,
            preco_total: row.preco_total,
          });
        }
      });
    }
  }

  // 6. Map the fetched deals and add the commercial_name and product_name/category/total_price based on priority
  return dealsData.map(deal => {
    const commercialName = additionalNamesMap.get(deal.company_excel_id) || companyNamesMap.get(deal.company_excel_id) || null;
    const productDetails = deal.product_id ? productDetailsMap.get(deal.product_id) : null;
    return {
      ...deal,
      commercial_name: commercialName,
      product_name: productDetails?.produto || null,
      product_category: productDetails?.categoria || null,
      product_total_price: productDetails?.preco_total || null,
    } as Negocio;
  });
}

/**
 * Updates an existing deal in the negocios table.
 */
export async function updateDeal(id: string, deal: Partial<Omit<Negocio, 'id' | 'created_at' | 'user_id' | 'commercial_name' | 'product_name' | 'product_category' | 'product_total_price'>>): Promise<Negocio> {
  const { data, error } = await supabase
    .from('negocios')
    .update({ ...deal, updated_at: new Date().toISOString() }) // Update updated_at timestamp
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating deal with id ${id}:`, error);
    throw new Error(error.message);
  }
  return data as Negocio;
}

/**
 * Deletes a deal from the negocios table.
 */
export async function deleteDeal(id: string): Promise<void> {
  const { error } = await supabase
    .from('negocios')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting deal with id ${id}:`, error);
    throw new Error(error.message);
  }
}