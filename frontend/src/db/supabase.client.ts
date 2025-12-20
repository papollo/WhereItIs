import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { Database } from './database.types';

export const supabase: SupabaseClient<Database> = createClient(
  environment.supabaseUrl,
  environment.supabaseAnonKey
);

export const DEFAULT_USER_ID = '11111111-1111-1111-1111-111111111111';



