import { Injectable, inject } from '@angular/core';
import type { Session, User } from '@supabase/supabase-js';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';
import { SupabaseService } from '../../db/supabase.service';
import { ApiError } from '../shared/api-error';

export type AuthSessionState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

@Injectable()
export class AuthSessionService {
  private readonly supabase = inject(SupabaseService);
  private readonly stateSubject = new BehaviorSubject<AuthSessionState>({
    session: null,
    user: null,
    loading: true,
  });
  private initialized = false;

  readonly state$ = this.stateSubject.asObservable();
  readonly isAuthenticated$ = this.state$.pipe(
    map((state) => Boolean(state.session)),
    distinctUntilChanged()
  );
  readonly user$ = this.state$.pipe(
    map((state) => state.user),
    distinctUntilChanged()
  );
  readonly loading$ = this.state$.pipe(
    map((state) => state.loading),
    distinctUntilChanged()
  );

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.setLoading(true);

    const { data, error } = await this.supabase.getClient().auth.getSession();

    if (error) {
      this.applySession(null);
      this.setLoading(false);
      return;
    }

    this.applySession(data.session ?? null);
    this.setLoading(false);

    this.supabase.getClient().auth.onAuthStateChange((_event, session) => {
      this.applySession(session ?? null);
    });
  }

  getUserIdOrThrow(): string {
    const userId = this.stateSubject.value.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('User is not authenticated');
    }

    return userId;
  }

  async refreshSession(): Promise<void> {
    const session = this.stateSubject.value.session;
    if (!session?.refresh_token) {
      throw ApiError.unauthorized('Refresh token missing');
    }

    const { data, error } = await this.supabase.getClient().auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    if (error) {
      throw ApiError.badRequest(error.message, undefined, error);
    }

    this.applySession(data.session ?? null);
  }

  private applySession(session: Session | null): void {
    const loading = this.stateSubject.value.loading;
    this.stateSubject.next({
      session,
      user: session?.user ?? null,
      loading,
    });
  }

  private setLoading(loading: boolean): void {
    const current = this.stateSubject.value;
    if (current.loading === loading) {
      return;
    }

    this.stateSubject.next({ ...current, loading });
  }
}
