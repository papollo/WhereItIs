import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../../db/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class ItemsApi {
  private readonly supabase = inject(SupabaseService);

  async listItems() {
    const { data, error } = await this.supabase
      .getClient()
      .from('items')
      .select('*');

    if (error) {
      throw error;
    }

    return data;
  }
}
