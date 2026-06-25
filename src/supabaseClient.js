import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://gyploegpjadewekxzklg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_2vhhrafsNCS2xPJsYDsVzQ_qJ84KjKg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
