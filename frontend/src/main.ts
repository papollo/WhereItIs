import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';
import { AuthSessionModule } from './app/auth/auth-session.module';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(AuthSessionModule),
    provideRouter(appRoutes),
    provideAnimations(),
    provideHttpClient(),
  ],
}).catch((err) => console.error(err));
