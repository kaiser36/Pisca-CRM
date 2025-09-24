import { supabase } from '../client';
import { Employee } from '@/types/crm';

/**
 * Inserts a new employee into the employees table.
 */
export async function insertEmployee(employee: Omit<Employee, 'id' | 'created_at'>): Promise<Employee> {
  const { data, error } = await supabase
    .from('employees')
    .insert(employee)
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
    .update(employee)
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