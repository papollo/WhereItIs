import { APP_INITIALIZER, NgModule } from '@angular/core';
import { AuthSessionService } from './auth-session.service';

function initAuthSession(authSession: AuthSessionService): () => Promise<void> {
  return () => authSession.init();
}

@NgModule({
  providers: [
    AuthSessionService,
    {
      provide: APP_INITIALIZER,
      useFactory: initAuthSession,
      deps: [AuthSessionService],
      multi: true,
    },
  ],
})
export class AuthSessionModule {}
