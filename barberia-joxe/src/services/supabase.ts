
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ljrmcydeydzuduhttjli.supabase.co';
const supabaseKey = 'sb_publishable_b0IDzbIPwcstvLaRTT8lSw_9uM_9SYA';

export const supabase = createClient(supabaseUrl, supabaseKey);
