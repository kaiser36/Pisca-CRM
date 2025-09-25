import { supabase } from '../client';
import { Employee } from '@/types/crm';

/**
 * Inserts a new employee into the employees table.
 */
export async function insertEmployee(employee: Omit<Employee, 'id' | 'created_at'>): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .insert({
      user_id: employee.user_id,
      // id_people: employee.id_people, // Removed from insert payload
      nome_colaborador: employee.nome_colaborador,
      telemovel: employee.telemovel,
      email: employee.email,
      cargo: employee.cargo,
      company_excel_id: employee.company_excel_id,
      commercial_name: employee.commercial_name,
      image_url: employee.image_url,
      stand_id: employee.stand_id,
      stand_name: employee.stand_name,
      company_db_id: employee.company_db_id, // NEW: Include company_db_id
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting employee:', error);
    throw new Error(error.message);
  }
  return data as Employee;
}

/**
 * Fetches all employees for a given company_excel_id and user_id.
 */
export async function fetchEmployeesByCompanyExcelId(userId: string, companyExcelId: string): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('user_id', userId)
    .eq('company_excel_id', companyExcelId)
    .order('nome_colaborador', { ascending: true });

  if (error) {
    console.error(`Error fetching employees for company_excel_id ${companyExcelId}:`, error);
    throw new Error(error.message);
  }
  return data as Employee[];
}

/**
 * Updates an existing employee in the employees table.
 */
export async function updateEmployee(id: string, employee: Partial<Omit<Employee, 'id' | 'created_at' | 'user_id'>>): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .update({
      // id_people: employee.id_people, // Removed from update payload
      nome_colaborador: employee.nome_colaborador,
      telemovel: employee.telemovel,
      email: employee.email,
      cargo: employee.cargo,
      commercial_name: employee.commercial_name,
      image_url: employee.image_url,
      stand_id: employee.stand_id,
      stand_name: employee.stand_name,
      company_db_id: employee.company_db_id, // NEW: Include company_db_id
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating employee with id ${id}:`, error);
    throw new Error(error.message);
  }
  return data as Employee;
}

/**
 * Deletes an employee from the employees table.
 */
export async function deleteEmployee(id: string): Promise<void> {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting employee with id ${id}:`, error);
    throw new Error(error.message);
  }
}

/**
 * Upserts employee data into the employees table.
 */
export async function upsertEmployees(employees: Employee[], userId: string): Promise<void> {
  // Fetch company_db_ids for all unique company_excel_ids in the batch
  const uniqueCompanyExcelIds = Array.from(new Set(employees.map(employee => employee.company_excel_id)));
  const { data: companies, error: companyError } = await supabase
    .from('companies')
    .select('id, company_id')
    .eq('user_id', userId)
    .in('company_id', uniqueCompanyExcelIds);

  if (companyError) {
    console.error('Error fetching company IDs for upserting employees:', companyError);
    throw new Error(companyError.message);
  }

  const companyIdMap = new Map<string, string>();
  companies.forEach(company => companyIdMap.set(company.company_id, company.id));

  const dataToUpsert = employees.map(employee => {
    const companyDbId = companyIdMap.get(employee.company_excel_id);
    if (!companyDbId) {
      console.warn(`Company DB ID not found for excel_company_id: ${employee.company_excel_id}. Skipping employee.`);
      return null; // Skip employees that cannot be linked
    }

    return {
      user_id: userId,
      company_excel_id: employee.company_excel_id,
      company_db_id: companyDbId, // NEW: Populate company_db_id
      nome_colaborador: employee.nome_colaborador,
      telemovel: employee.telemovel || null,
      email: employee.email || null,
      cargo: employee.cargo || null,
      commercial_name: employee.commercial_name || null,
      image_url: employee.image_url || null,
      stand_id: employee.stand_id || null,
      stand_name: employee.stand_name || null,
    };
  }).filter(Boolean); // Filter out nulls

  if (dataToUpsert.length === 0) {
    return;
  }

  const { error } = await supabase
    .from('employees')
    .upsert(dataToUpsert, { onConflict: 'company_excel_id, nome_colaborador, user_id' }); // Ensure uniqueness per user

  if (error) {
    console.error('Error upserting employees:', error);
    throw new Error(error.message);
  }
}