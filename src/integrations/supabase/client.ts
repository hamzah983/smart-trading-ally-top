
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mdxoxmoxkxtpgsepoglq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1keG94bW94a3h0cGdzZXBvZ2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNDUxOTYsImV4cCI6MjA1NTkyMTE5Nn0.myIOsChYkVn5jletYx5yURKvIXGvhyyO3OWygEhCy4s";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
