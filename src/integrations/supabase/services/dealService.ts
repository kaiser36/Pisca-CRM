import { supabase } from '../client';
import { Negocio, DealProduct } from '@/types/crm';

/**
 * Inserts a new deal into the negocios table.
 */
export async function insertDeal(deal: Omit<Negocio, 'id' | 'created_at' | 'updated_at' | 'commercial_name'>): Promise<Negocio> {
  const { deal_products, ...dealData } = deal; // Extract deal_products from the main deal object

  // 1. Insert the main deal data
  const { data: newDeal, error: dealError } = await supabase
    .from('negocios')
    .insert(dealData)
    .select()
    .single();

  if (dealError) {
    console.error('Error inserting main deal:', dealError);
    throw new Error(dealError.message);
  }

  // 2. Insert associated deal products
  if (deal_products && deal_products.length > 0) {
    const dealProductsToInsert = deal_products.map(dp => ({
      deal_id: newDeal.id,
      product_id: dp.product_id,
      quantity: dp.quantity,
      unit_price_at_deal_time: dp.unit_price_at_deal_time,
      total_price_at_deal_time: dp.total_price_at_deal_time,
      discount_type: dp.discount_type, // NEW
      discount_value: dp.discount_value, // NEW
    }));

    const { error: dealProductsError } = await supabase
      .from('deal_products')
      .insert(dealProductsToInsert);

    if (dealProductsError) {
      console.error('Error inserting deal products:', dealProductsError);
      // Optionally, you might want to roll back the main deal insertion here
      throw new Error(dealProductsError.message);
    }
  }

  return newDeal as Negocio;
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

  const dealIds = dealsData.map(d => d.id);
  const uniqueExcelCompanyIds = Array.from(new Set(dealsData.map(deal => deal.company_excel_id)));

  // 2. Fetch commercial names from 'company_additional_excel_data'
  const { data: additionalData, error: additionalError } = await supabase
    .from('company_additional_excel_data')
    .select('excel_company_id, "Nome Comercial"')
    .eq('user_id', userId)
    .in('excel_company_id', uniqueExcelCompanyIds);

  if (additionalError) {
    console.error('Error fetching additional company data:', additionalError);
  }

  const additionalNamesMap = new Map<string, string>();
  additionalData?.forEach(row => {
    if (row.excel_company_id && row["Nome Comercial"]) {
      additionalNamesMap.set(row.excel_company_id, row["Nome Comercial"]);
    }
  });

  // 3. Fetch commercial names from 'companies' table
  const { data: companiesData, error: companiesError } = await supabase
    .from('companies')
    .select('company_id, commercial_name')
    .eq('user_id', userId)
    .in('company_id', uniqueExcelCompanyIds);

  if (companiesError) {
    console.error('Error fetching companies data:', companiesError);
  }

  const companyNamesMap = new Map<string, string>();
  companiesData?.forEach(row => {
    if (row.company_id && row.commercial_name) {
      companyNamesMap.set(row.company_id, row.commercial_name);
    }
  });

  // 4. Fetch all deal products for these deals
  const { data: dealProductsData, error: dealProductsError } = await supabase
    .from('deal_products')
    .select('*')
    .in('deal_id', dealIds);

  if (dealProductsError) {
    console.error('Error fetching deal products:', dealProductsError);
    throw new Error(dealProductsError.message);
  }

  const productIds = Array.from(new Set(dealProductsData.map(dp => dp.product_id).filter((id): id is string => id !== null && id !== undefined)));

  // 5. Fetch product details (name, category, unit price, total price from product table) for all unique product IDs
  let productDetailsMap = new Map<string, { produto: string; categoria: string | null; preco_unitario: number | null; preco_total: number | null }>();
  if (productIds.length > 0) {
    const { data: productsData, error: productsError } = await supabase
      .from('produtos')
      .select('id, produto, categoria, preco_unitario, preco_total')
      .in('id', productIds);

    if (productsError) {
      console.error('Error fetching product details:', productsError);
    } else {
      productsData?.forEach(p => {
        if (p.id && p.produto) {
          productDetailsMap.set(p.id, {
            produto: p.produto,
            categoria: p.categoria,
            preco_unitario: p.preco_unitario,
            preco_total: p.preco_total,
          });
        }
      });
    }
  }

  // 6. Map deal products to their respective deals and calculate aggregated values
  const dealsWithProducts = dealsData.map(deal => {
    const commercialName = additionalNamesMap.get(deal.company_excel_id) || companyNamesMap.get(deal.company_excel_id) || null;
    
    const associatedDealProducts: DealProduct[] = dealProductsData
      .filter(dp => dp.deal_id === deal.id)
      .map(dp => {
        const productDetail = dp.product_id ? productDetailsMap.get(dp.product_id) : null;
        
        // Calculate individual product's total price after its own discount
        let baseProductLineTotal = (productDetail?.preco_total || 0) * (dp.quantity || 0);
        let discountedProductLineTotal = baseProductLineTotal;

        if (dp.discount_type === 'percentage' && dp.discount_value !== null) {
          discountedProductLineTotal = baseProductLineTotal * (1 - (dp.discount_value / 100));
        } else if (dp.discount_type === 'amount' && dp.discount_value !== null) {
          discountedProductLineTotal = baseProductLineTotal - dp.discount_value;
        }
        discountedProductLineTotal = Math.max(0, discountedProductLineTotal); // Ensure not negative

        return {
          ...dp,
          product_name: productDetail?.produto || null,
          product_category: productDetail?.categoria || null,
          unit_price_at_deal_time: productDetail?.preco_unitario || 0, // Ensure unit price is set
          total_price_at_deal_time: discountedProductLineTotal, // This is the discounted total for the line item
        } as DealProduct;
      });

    // Calculate deal_value (sum of all total_price_at_deal_time from deal_products, which are already individually discounted)
    const calculatedDealValue = associatedDealProducts.reduce((sum, dp) => sum + (dp.total_price_at_deal_time || 0), 0);

    // Calculate final_deal_value based on overall deal discount
    let calculatedFinalDealValue = calculatedDealValue;
    if (deal.discount_type === 'percentage' && deal.discount_value !== null) {
      calculatedFinalDealValue = calculatedDealValue * (1 - (deal.discount_value / 100));
    } else if (deal.discount_type === 'amount' && deal.discount_value !== null) {
      calculatedFinalDealValue = calculatedDealValue - deal.discount_value;
    }
    calculatedFinalDealValue = Math.max(0, calculatedFinalDealValue); // Ensure not negative

    return {
      ...deal,
      commercial_name: commercialName,
      deal_products: associatedDealProducts,
      deal_value: calculatedDealValue, // Override with calculated value (sum of individually discounted products)
      final_deal_value: calculatedFinalDealValue, // Override with calculated value (after overall deal discount)
    } as Negocio;
  });

  return dealsWithProducts;
}

/**
 * Updates an existing deal in the negocios table.
 */
export async function updateDeal(id: string, deal: Partial<Omit<Negocio, 'id' | 'created_at' | 'user_id' | 'commercial_name'>> & { deal_products?: DealProduct[] }): Promise<Negocio> {
  const { deal_products, ...dealData } = deal; // Extract deal_products from the main deal object

  // 1. Update the main deal data
  const { data: updatedDeal, error: dealError } = await supabase
    .from('negocios')
    .update({ ...dealData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (dealError) {
    console.error(`Error updating main deal with id ${id}:`, dealError);
    throw new Error(dealError.message);
  }

  // 2. Handle associated deal products
  if (deal_products !== undefined) { // Only update if deal_products is provided in the payload
    // For simplicity, delete all existing deal_products for this deal and re-insert
    const { error: deleteError } = await supabase
      .from('deal_products')
      .delete()
      .eq('deal_id', id);

    if (deleteError) {
      console.error(`Error deleting existing deal products for deal ${id}:`, deleteError);
      throw new Error(deleteError.message);
    }

    if (deal_products.length > 0) {
      const dealProductsToInsert = deal_products.map(dp => ({
        deal_id: id,
        product_id: dp.product_id,
        quantity: dp.quantity,
        unit_price_at_deal_time: dp.unit_price_at_deal_time,
        total_price_at_deal_time: dp.total_price_at_deal_time,
        discount_type: dp.discount_type, // NEW
        discount_value: dp.discount_value, // NEW
      }));

      const { error: insertError } = await supabase
        .from('deal_products')
        .insert(dealProductsToInsert);

      if (insertError) {
        console.error(`Error re-inserting deal products for deal ${id}:`, insertError);
        throw new Error(insertError.message);
      }
    }
  }

  return updatedDeal as Negocio;
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

/**
 * Upserts deal data into the negocios table.
 */
export async function upsertDeals(deals: Negocio[], userId: string): Promise<void> {
  const dataToUpsert = deals.map(deal => ({
    user_id: userId,
    company_excel_id: deal.company_excel_id,
    deal_name: deal.deal_name,
    deal_status: deal.deal_status || 'Prospecting',
    deal_value: deal.deal_value || 0, // Will be recalculated by triggers or UI
    currency: deal.currency || 'EUR',
    expected_close_date: deal.expected_close_date || null,
    stage: deal.stage || null,
    priority: deal.priority || 'Medium',
    notes: deal.notes || null,
    discount_type: deal.discount_type || 'none',
    discount_value: deal.discount_value || 0,
    final_deal_value: deal.final_deal_value || 0, // Will be recalculated by triggers or UI
  }));

  if (dataToUpsert.length === 0) {
    return;
  }

  const { error } = await supabase
    .from('negocios')
    .upsert(dataToUpsert, { onConflict: 'company_excel_id, deal_name, user_id' }); // Ensure uniqueness per user, company, and deal name

  if (error) {
    console.error('Error upserting deals:', error);
    throw new Error(error.message);
  }
}