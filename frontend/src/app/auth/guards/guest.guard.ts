import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthSessionService } from '../auth-session.service';

export const guestGuard: CanActivateFn = () => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  return authSession.state$.pipe(
    filter((state) => !state.loading),
    take(1),
    map((state) => (state.session ? router.createUrlTree(['/rooms']) : true))
  );
};
