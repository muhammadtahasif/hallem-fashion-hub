// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jrnotkitoiiwikswpmdt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impybm90a2l0b2lpd2lrc3dwbWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODM5ODcsImV4cCI6MjA2MzY1OTk4N30.N-XgdKXeEyjd253th4DwCKNRUVasoaH9gV3pZieBgOk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);