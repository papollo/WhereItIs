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

export const appRoutes: Routes = [
  { path: '', redirectTo: 'rooms', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
  { path: 'forgot-password', component: ForgotPasswordPageComponent },
  { path: 'reset-password', component: ResetPasswordPageComponent },
  { path: 'rooms', component: RoomsListPageComponent },
  { path: 'rooms/new', component: RoomEditorPageComponent },
  { path: 'rooms/:roomId', component: RoomDetailsPageComponent },
  { path: 'rooms/:roomId/edit', component: RoomEditorPageComponent },
  { path: 'search', component: SearchPageComponent },
  { path: 'user/edit', component: UserEditPageComponent },
  { path: '**', redirectTo: 'rooms' },
];
