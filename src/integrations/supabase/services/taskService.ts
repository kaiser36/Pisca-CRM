import { supabase } from '../client';
import { Task } from '@/types/crm';

/**
 * Inserts a new task into the tasks table.
 */
export async function insertTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: task.user_id,
      company_excel_id: task.company_excel_id,
      company_db_id: task.company_db_id, // NEW: Include company_db_id
      commercial_name: task.commercial_name || null, // NEW: Include commercial_name
      title: task.title,
      description: task.description || null,
      due_date: task.due_date || null,
      status: task.status || 'Pending',
      priority: task.priority || 'Medium',
      assigned_to_employee_id: task.assigned_to_employee_id || null,
      assigned_to_employee_name: task.assigned_to_employee_name || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting task:', error);
    throw new Error(error.message);
  }
  return data as Task;
}

/**
 * Fetches all tasks for a given company_excel_id and user_id.
 */
export async function fetchTasksByCompanyExcelId(userId: string, companyExcelId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, commercial_name') // NEW: Select commercial_name
    .eq('user_id', userId)
    .eq('company_excel_id', companyExcelId)
    .order('due_date', { ascending: true });

  if (error) {
    console.error(`Error fetching tasks for company_excel_id ${companyExcelId}:`, error);
    throw new Error(error.message);
  }
  return data as Task[];
}

/**
 * Fetches all tasks for the current authenticated user, optionally filtered by status.
 */
export async function fetchTasksForUser(userId: string, statusFilter?: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled'): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select('*, commercial_name') // NEW: Select commercial_name
    .eq('user_id', userId);

  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query.order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching tasks for user:', error);
    throw new Error(error.message);
  }
  return data as Task[];
}

/**
 * Updates an existing task in the tasks table.
 */
export async function updateTask(id: string, task: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'company_excel_id'>>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      title: task.title,
      description: task.description,
      due_date: task.due_date,
      status: task.status,
      priority: task.priority,
      assigned_to_employee_id: task.assigned_to_employee_id,
      assigned_to_employee_name: task.assigned_to_employee_name,
      commercial_name: task.commercial_name, // NEW: Include commercial_name
      company_db_id: task.company_db_id, // NEW: Include company_db_id
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating task with id ${id}:`, error);
    throw new Error(error.message);
  }
  return data as Task;
}

/**
 * Deletes a task from the tasks table.
 */
export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting task with id ${id}:`, error);
    throw new Error(error.message);
  }
}

/**
 * Upserts task data into the tasks table.
 */
export async function upsertTasks(tasks: Task[], userId: string): Promise<void> {
  // Fetch company_db_ids for all unique company_excel_ids in the batch
  const uniqueCompanyExcelIds = Array.from(new Set(tasks.map(task => task.company_excel_id)));
  const { data: companies, error: companyError } = await supabase
    .from('companies')
    .select('id, company_id')
    .eq('user_id', userId)
    .in('company_id', uniqueCompanyExcelIds);

  if (companyError) {
    console.error('Error fetching company IDs for upserting tasks:', companyError);
    throw new Error(companyError.message);
  }

  const companyIdMap = new Map<string, string>();
  companies.forEach(company => companyIdMap.set(company.company_id, company.id));

  const dataToUpsert = tasks.map(task => {
    const companyDbId = companyIdMap.get(task.company_excel_id);
    if (!companyDbId) {
      console.warn(`Company DB ID not found for excel_company_id: ${task.company_excel_id}. Skipping task.`);
      return null; // Skip tasks that cannot be linked
    }

    return {
      user_id: userId,
      company_excel_id: task.company_excel_id,
      company_db_id: companyDbId, // NEW: Populate company_db_id
      commercial_name: task.commercial_name || null, // NEW: Include commercial_name
      title: task.title,
      description: task.description || null,
      due_date: task.due_date || null,
      status: task.status || 'Pending',
      priority: task.priority || 'Medium',
      assigned_to_employee_id: task.assigned_to_employee_id || null,
      assigned_to_employee_name: task.assigned_to_employee_name || null,
    };
  }).filter(Boolean); // Filter out nulls

  if (dataToUpsert.length === 0) {
    return;
  }

  const { error } = await supabase
    .from('tasks')
    .upsert(dataToUpsert, { onConflict: 'company_excel_id, title, user_id' }); // Ensure uniqueness per user, company, and title

  if (error) {
    console.error('Error upserting tasks:', error);
    throw new Error(error.message);
  }
}