import { AsyncPipe, NgIf } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthApi } from './auth/auth.api';
import { AuthSessionService } from './auth/auth-session.service';

@Component({
  selector: 'app-root',
  imports: [AsyncPipe, NgIf, RouterOutlet, RouterLink, RouterLinkActive, MatSnackBarModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authApi = inject(AuthApi);
  private readonly authSession = inject(AuthSessionService);
  private readonly snackBar = inject(MatSnackBar);

  isAuthRoute = this.isAuthUrl(this.router.url);
  isLoggingOut = false;
  readonly isAuthenticated$ = this.authSession.isAuthenticated$;

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.isAuthRoute = this.isAuthUrl(event.urlAfterRedirects);
      });
  }

  private isAuthUrl(url: string): boolean {
    return (
      url.startsWith('/login') ||
      url.startsWith('/register') ||
      url.startsWith('/forgot-password') ||
      url.startsWith('/reset-password')
    );
  }

  async logout(): Promise<void> {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;

    try {
      await this.authApi.logout();
      this.snackBar.open('Wylogowano.', 'Zamknij', { duration: 2500 });
      await this.router.navigate(['/login']);
    } catch (err) {
      this.snackBar.open('Nie udalo sie wylogowac.', 'Zamknij', { duration: 3000 });
    } finally {
      this.isLoggingOut = false;
    }
  }
}
