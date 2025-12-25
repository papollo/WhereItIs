import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { Database } from './database.types';

export const supabase: SupabaseClient<Database> = createClient(
  environment.supabaseUrl,
  environment.supabaseAnonKey,
  {
    auth: {
      // Prevent LockManager contention with other local apps using the same Supabase project.
      storageKey: 'sb-where-it-is-auth-token',
    },
  }
);

export const DEFAULT_USER_ID = '896c0357-0f16-4761-9fe6-fbccaa188386';


