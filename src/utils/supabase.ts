import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://slhpxggeimhqfozjievt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNsaHB4Z2dlaW1ocWZvemppZXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyNTE3NzUsImV4cCI6MjA2NjgyNzc3NX0.OQ_AOlYeFOuXwgftwpJnG2ft3KHKhCy8Mnyy8AiYgxE';

export const supabase = createClient(supabaseUrl, supabaseKey);
