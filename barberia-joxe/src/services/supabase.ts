
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// DEBUG: Check if env vars are loaded
console.log('Supabase Config:', {
    url: supabaseUrl,
    keyExists: !!supabaseKey,
    mode: import.meta.env.MODE
});

if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: Missing Supabase Environment Variables!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
