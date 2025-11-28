import { supabase } from '../lib/supabase';

// Get all expenses for current user
export const getExpenses = async (userId) => {
  if (!supabase || !userId) {
    console.warn('Supabase not configured or no user');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};

// Add new expense
export const addExpense = async (userId, expense) => {
  if (!supabase || !userId) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        user_id: userId,
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        date: expense.date,
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error adding expense:', error);
    return { success: false, error: error.message };
  }
};

// Delete expense
export const deleteExpense = async (expenseId) => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting expense:', error);
    return { success: false, error: error.message };
  }
};

// Update expense
export const updateExpense = async (expenseId, updates) => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', expenseId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error updating expense:', error);
    return { success: false, error: error.message };
  }
};

// Initialize table (run once via Supabase SQL editor)
export const getTableSQL = () => `
-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- Enable RLS (Row Level Security)
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own expenses
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid()::text = user_id OR user_id = auth.jwt()->>'sub');

-- Policy: Users can insert their own expenses
CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id = auth.jwt()->>'sub');

-- Policy: Users can update their own expenses
CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid()::text = user_id OR user_id = auth.jwt()->>'sub');

-- Policy: Users can delete their own expenses
CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid()::text = user_id OR user_id = auth.jwt()->>'sub');
`;
