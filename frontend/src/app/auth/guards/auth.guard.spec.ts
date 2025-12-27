import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, firstValueFrom, from, isObservable } from 'rxjs';
import type { Session } from '@supabase/supabase-js';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import type { AuthSessionState } from '../auth-session.service';
import { AuthSessionService } from '../auth-session.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let stateSubject: BehaviorSubject<AuthSessionState>;
  let router: Router;
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  beforeEach(() => {
    stateSubject = new BehaviorSubject<AuthSessionState>({
      session: null,
      user: null,
      loading: true,
    });

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: AuthSessionService,
          useValue: { state$: stateSubject.asObservable() },
        },
      ],
    });

    router = TestBed.inject(Router);
  });

  it('redirects to login when unauthenticated', async () => {
    const guardResult = TestBed.runInInjectionContext(() => authGuard(route, state));
    const result$ = isObservable(guardResult) ? guardResult : from(Promise.resolve(guardResult));
    const resultPromise = firstValueFrom(result$);

    stateSubject.next({ session: null, user: null, loading: false });

    const resolved = await resultPromise;
    expect(
      router.serializeUrl(resolved as unknown as ReturnType<Router['createUrlTree']>)
    ).toBe(
      '/login'
    );
  });

  it('allows navigation when authenticated', async () => {
    const session = { access_token: 'token', refresh_token: 'refresh' } as Session;
    const guardResult = TestBed.runInInjectionContext(() => authGuard(route, state));
    const result$ = isObservable(guardResult) ? guardResult : from(Promise.resolve(guardResult));
    const resultPromise = firstValueFrom(result$);

    stateSubject.next({ session, user: session.user ?? null, loading: false });

    const resolved = await resultPromise;
    expect(resolved).toBeTrue();
  });
});
