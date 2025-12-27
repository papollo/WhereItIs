import { TestBed } from '@angular/core/testing';
import type { Session } from '@supabase/supabase-js';
import { ApiError } from '../shared/api-error';
import { SupabaseService } from '../../db/supabase.service';
import { AuthSessionService } from './auth-session.service';

describe('AuthSessionService', () => {
  let service: AuthSessionService;
  let authStateCallback: ((event: string, session: Session | null) => void) | null;
  let authMock: {
    getSession: jasmine.Spy;
    onAuthStateChange: jasmine.Spy;
    setSession: jasmine.Spy;
  };

  const createSession = (overrides: Partial<Session> = {}): Session =>
    ({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      token_type: 'bearer',
      expires_in: 3600,
      user: { id: 'user-1' },
      ...overrides,
    }) as Session;

  beforeEach(() => {
    authStateCallback = null;
    authMock = {
      getSession: jasmine.createSpy('getSession'),
      onAuthStateChange: jasmine.createSpy('onAuthStateChange').and.callFake((callback) => {
        authStateCallback = callback as (event: string, session: Session | null) => void;
        return { data: { subscription: { unsubscribe: jasmine.createSpy('unsubscribe') } } };
      }),
      setSession: jasmine.createSpy('setSession'),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthSessionService,
        {
          provide: SupabaseService,
          useValue: {
            getClient: () => ({ auth: authMock }),
          },
        },
      ],
    });

    service = TestBed.inject(AuthSessionService);
  });

  it('initializes once and sets session state', async () => {
    const session = createSession();
    authMock.getSession.and.resolveTo({ data: { session }, error: null });

    await service.init();
    await service.init();

    expect(authMock.getSession).toHaveBeenCalledTimes(1);
    const state = (service as unknown as { stateSubject: { getValue: () => unknown } }).stateSubject;
    const snapshot = state.getValue() as { session: Session | null; loading: boolean };
    expect(snapshot.session).toBe(session);
    expect(snapshot.loading).toBeFalse();
  });

  it('handles getSession errors by clearing session and loading', async () => {
    authMock.getSession.and.resolveTo({ data: { session: null }, error: { message: 'oops' } });

    await service.init();

    const state = (service as unknown as { stateSubject: { getValue: () => unknown } }).stateSubject;
    const snapshot = state.getValue() as { session: Session | null; loading: boolean };
    expect(snapshot.session).toBeNull();
    expect(snapshot.loading).toBeFalse();
  });

  it('updates session on auth state change', async () => {
    const session = createSession({ access_token: 'token-1' });
    const nextSession = createSession({ access_token: 'token-2' });
    authMock.getSession.and.resolveTo({ data: { session }, error: null });

    await service.init();

    expect(authStateCallback).toBeTruthy();
    authStateCallback?.('SIGNED_IN', nextSession);

    const state = (service as unknown as { stateSubject: { getValue: () => unknown } }).stateSubject;
    const snapshot = state.getValue() as { session: Session | null };
    expect(snapshot.session).toBe(nextSession);
  });

  it('throws when refreshing without a refresh token', async () => {
    const state = (service as unknown as { stateSubject: { next: (value: unknown) => void } })
      .stateSubject;
    state.next({ session: createSession({ refresh_token: undefined }), user: null, loading: false });

    let error: unknown;
    try {
      await service.refreshSession();
    } catch (err) {
      error = err;
    }

    expect(error instanceof ApiError).toBeTrue();
    expect((error as ApiError).status).toBe(401);
  });

  it('refreshes session when tokens are present', async () => {
    const currentSession = createSession({
      access_token: 'old-access',
      refresh_token: 'old-refresh',
    });
    const nextSession = createSession({
      access_token: 'new-access',
      refresh_token: 'new-refresh',
    });

    const state = (service as unknown as { stateSubject: { next: (value: unknown) => void } })
      .stateSubject;
    state.next({ session: currentSession, user: currentSession.user, loading: false });

    authMock.setSession.and.resolveTo({ data: { session: nextSession }, error: null });

    await service.refreshSession();

    expect(authMock.setSession).toHaveBeenCalledWith({
      access_token: 'old-access',
      refresh_token: 'old-refresh',
    });

    const snapshot = (
      service as unknown as { stateSubject: { getValue: () => { session: Session | null } } }
    ).stateSubject.getValue();
    expect(snapshot.session).toBe(nextSession);
  });

  it('throws ApiError when refresh fails', async () => {
    const currentSession = createSession({
      access_token: 'old-access',
      refresh_token: 'old-refresh',
    });
    const state = (service as unknown as { stateSubject: { next: (value: unknown) => void } })
      .stateSubject;
    state.next({ session: currentSession, user: currentSession.user, loading: false });

    authMock.setSession.and.resolveTo({
      data: { session: null },
      error: { message: 'boom' },
    });

    let error: unknown;
    try {
      await service.refreshSession();
    } catch (err) {
      error = err;
    }

    expect(error instanceof ApiError).toBeTrue();
    expect((error as ApiError).status).toBe(400);
  });
});
