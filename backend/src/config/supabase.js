import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Public client - for regular operations (respects RLS)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Admin client - bypasses RLS for server-side admin operations
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const testConnection = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('about')
      .select('id')
      .limit(1);

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Supabase connection error:', error.message);
      return false;
    }
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection failed:', err.message);
    return false;
  }
};
