import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client = null;

export function getSupabase() {
  if (client) return client;
  if (!supabaseUrl || !supabaseServiceKey) return null;
  client = createClient(supabaseUrl, supabaseServiceKey, {
    db: { schema: 'webbby' },
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return client;
}
