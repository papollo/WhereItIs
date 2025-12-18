import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from './supabase.client';
import { Database } from './database.types';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private readonly client: SupabaseClient<Database> = supabase;

  getClient(): SupabaseClient<Database> {
    return this.client;
  }
}

