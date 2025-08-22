import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://ggmiapiptzhwdtzljhvr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnbWlhcGlwdHpod2R0emxqaHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NTE5ODAsImV4cCI6MjA3MTQyNzk4MH0.wD6QLi8CKY1l5D6qoRadZUT84i4FcCzgpkr1gI2uo0Q'; // thay bằng anon key từ Supabase dashboard

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
