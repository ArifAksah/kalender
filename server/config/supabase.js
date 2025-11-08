const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials in .env file');
}

// Use service role key for admin operations (Storage, etc.)
// Service role key bypasses RLS policies
// Fallback to regular key if service role key not provided
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  // Ensure we're using admin client
  global: {
    headers: {
      'apikey': supabaseServiceRoleKey
    }
  }
});

module.exports = supabase;
