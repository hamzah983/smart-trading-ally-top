
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || 'https://mdxoxmoxkxtpgsepoglq.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1keG94bW94a3h0cGdzZXBvZ2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNDUxOTYsImV4cCI6MjA1NTkyMTE5Nn0.myIOsChYkVn5jletYx5yURKvIXGvhyyO3OWygEhCy4s',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
    // Important: Adding global headers for proper Content-Type
    global: {
      headers: {
        'Content-Type': 'application/json',
        'x-client-info': 'trading-app',
      },
    },
  }
);

// Reset headers function to add custom headers for trading
export const resetSupabaseHeaders = () => {
  console.info('Headers reset for Supabase client');
  
  // Create a new client with the same configuration but updated headers
  const newClient = createClient(
    import.meta.env.VITE_SUPABASE_URL || 'https://mdxoxmoxkxtpgsepoglq.supabase.co',
    import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1keG94bW94a3h0cGdzZXBvZ2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNDUxOTYsImV4cCI6MjA1NTkyMTE5Nn0.myIOsChYkVn5jletYx5yURKvIXGvhyyO3OWygEhCy4s',
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
      global: {
        headers: {
          'Content-Type': 'application/json',
          'x-client-info': 'trading-app',
          'x-trading-mode': 'real'
        },
      },
    }
  );
  
  return newClient;
};

// Initialize headers on load
(() => {
  console.info('Supabase headers initialized on page load');
  resetSupabaseHeaders();
})();
