import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bahqfjhypoxhpyseedwt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhaHFmamh5cG94aHB5c2VlZHd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcwODI0OTEsImV4cCI6MjA0MjY1ODQ5MX0.sYlILsxJMeo6uVjz15q6VfkCEAH5vxSavkyygF_mNbo';

export const supabase = createClient(supabaseUrl, supabaseKey);
