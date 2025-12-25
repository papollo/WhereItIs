import type { Routes } from '@angular/router';
import { RoomDetailsPageComponent } from './rooms/pages/room-details-page/room-details-page.component';
import { RoomEditorPageComponent } from './rooms/pages/room-editor-page/room-editor-page.component';
import { RoomsListPageComponent } from './rooms/pages/rooms-list-page/rooms-list-page.component';
import { SearchPageComponent } from './search/pages/search-page/search-page.component';
import { UserEditPageComponent } from './user/pages/user-edit-page/user-edit-page.component';
import { ForgotPasswordPageComponent } from './auth/pages/forgot-password-page/forgot-password-page.component';
import { LoginPageComponent } from './auth/pages/login-page/login-page.component';
import { RegisterPageComponent } from './auth/pages/register-page/register-page.component';
import { ResetPasswordPageComponent } from './auth/pages/reset-password-page/reset-password-page.component';
import { authGuard } from './auth/guards/auth.guard';
import { guestGuard } from './auth/guards/guest.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'rooms', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterPageComponent, canActivate: [guestGuard] },
  { path: 'forgot-password', component: ForgotPasswordPageComponent, canActivate: [guestGuard] },
  { path: 'reset-password', component: ResetPasswordPageComponent },
  { path: 'rooms', component: RoomsListPageComponent, canActivate: [authGuard] },
  { path: 'rooms/new', component: RoomEditorPageComponent, canActivate: [authGuard] },
  { path: 'rooms/:roomId', component: RoomDetailsPageComponent, canActivate: [authGuard] },
  { path: 'rooms/:roomId/edit', component: RoomEditorPageComponent, canActivate: [authGuard] },
  { path: 'search', component: SearchPageComponent, canActivate: [authGuard] },
  { path: 'user/edit', component: UserEditPageComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'rooms' },
];
