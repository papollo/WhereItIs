# Supabase Initialization (Angular 21 + TypeScript 5)

This document provides a reproducible guide to create the necessary file structure for integrating Supabase with an Angular 21 application using TypeScript 5.

## Prerequisites

- The project uses TypeScript 5 and Angular 21
- The package `@supabase/supabase-js` is installed
- Angular environment files exist:
    - `/src/environments/environment.ts`
    - `/src/environments/environment.prod.ts`
- A file `/src/db/database.types.ts` exists and contains the correct type definitions for the Supabase database
- Supabase project URL and anon key are available

IMPORTANT: Check prerequisites before performing the actions below. If any prerequisite is missing, stop and ask the user to fix it.

## File Structure and Setup

### 1. Supabase Client Initialization

Create the file `/src/db/supabase.client.ts` with the following content:

```ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { Database } from './database.types';

export const supabase: SupabaseClient<Database> = createClient(
  environment.supabaseUrl,
  environment.supabaseAnonKey
);
```
This file initializes a singleton Supabase client using Angular environment configuration and strong typing.

### 2. Supabase Angular Service (Client Access Layer)

Create the file `/src/db/supabase.service.ts` with the following content:

```ts
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
```

This service replaces framework-level middleware and provides centralized access to the Supabase client.

### 3. Feature-Level API Services

Create feature-specific API services that depend on SupabaseService.

Example file: `/src/app/todos/todos.api.ts`

```ts

import { Injectable } from '@angular/core';
import { SupabaseService } from '../../db/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class TodosApi {
  constructor(private readonly supabase: SupabaseService) {}

  async listTodos() {
    const { data, error } = await this.supabase
      .getClient()
      .from('todos')
      .select('*');

    if (error) {
      throw error;
    }

    return data;
  }
}

```

This pattern defines a clear client-side API layer for the Angular application.

This pattern defines a clear client-side API layer for the Angular application.

### 4. Environment Configuration

Ensure the following exists in /src/environments/environment.ts:

```ts

export const environment = {
  production: false,
  supabaseUrl: 'https://YOUR_PROJECT_ID.supabase.co',
  supabaseAnonKey: 'YOUR_PUBLIC_ANON_KEY',
};


```

Ensure corresponding values exist in environment.prod.ts.


### 5. Security Notes

- This setup runs entirely in the browser
- Only the Supabase anon key may be used
- All authorization must be enforced via Supabase Row Level Security (RLS)
- Never expose the Supabase service role key in Angular
- Use Supabase Edge Functions if server-side endpoints are required late