import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ REACT_APP_SUPABASE_URL is not configured. Check your .env.local or environment variables.');
}

if (!supabaseAnonKey) {
  console.error('❌ REACT_APP_SUPABASE_ANON_KEY is not configured. Check your .env.local or environment variables.');
}

if (supabaseUrl && supabaseAnonKey) {
  console.log('✅ Supabase configured successfully');
} else {
  console.warn('⚠️ Supabase credentials not configured. Google SSO will not work.');
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const signInWithGoogle = async () => {
  if (!supabase) {
    return { error: { message: 'Supabase not configured' } };
  }
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  
  return { data, error };
};

export const signOut = async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
};

export const getSession = async () => {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const getUser = async () => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
