import { supabase } from '../lib/supabase';

// Get all incomes for current user
export const getIncomes = async (userId) => {
  if (!supabase || !userId) {
    console.warn('Supabase not configured or no user');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('incomes')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching incomes:', error);
    return [];
  }
};

// Add new income
export const addIncome = async (userId, income) => {
  if (!supabase || !userId) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('incomes')
      .insert([{
        user_id: userId,
        amount: income.amount,
        category: income.category,
        description: income.description,
        date: income.date,
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding income:', error);
    return { success: false, error: error.message };
  }
};

// Delete income
export const deleteIncome = async (incomeId) => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', incomeId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting income:', error);
    return { success: false, error: error.message };
  }
};
