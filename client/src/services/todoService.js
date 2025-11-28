import { supabase } from '../lib/supabase';

// Get all todos for current user
export const getTodos = async (userId) => {
  if (!supabase || !userId) {
    console.warn('Supabase not configured or no user');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
};

// Add new todo
export const addTodo = async (userId, todo) => {
  if (!supabase || !userId) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const insertData = {
      user_id: userId,
      title: todo.title,
      status: todo.status || 'upcoming',
    };
    
    // Add optional fields only if they have values
    if (todo.description) insertData.description = todo.description;
    if (todo.due_date) insertData.due_date = todo.due_date;
    if (todo.priority) insertData.priority = todo.priority;

    const { data, error } = await supabase
      .from('todos')
      .insert([insertData])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding todo:', error);
    return { success: false, error: error.message };
  }
};

// Update todo
export const updateTodo = async (todoId, updates) => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Only include fields that exist
    const updateData = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.due_date !== undefined) updateData.due_date = updates.due_date;

    const { data, error } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', todoId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating todo:', error);
    return { success: false, error: error.message };
  }
};

// Delete todo
export const deleteTodo = async (todoId) => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', todoId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting todo:', error);
    return { success: false, error: error.message };
  }
};

// Get todos by status
export const getTodosByStatus = async (userId, status) => {
  if (!supabase || !userId) return [];

  try {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching todos by status:', error);
    return [];
  }
};
