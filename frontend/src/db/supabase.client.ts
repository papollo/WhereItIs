import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { Database } from './database.types';

export const supabase: SupabaseClient<Database> = createClient(
  environment.supabaseUrl,
  environment.supabaseAnonKey
);

