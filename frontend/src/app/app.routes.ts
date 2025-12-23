import type { Routes } from '@angular/router';
import { RoomDetailsPageComponent } from './rooms/pages/room-details-page/room-details-page.component';
import { RoomEditorPageComponent } from './rooms/pages/room-editor-page/room-editor-page.component';
import { RoomsListPageComponent } from './rooms/pages/rooms-list-page/rooms-list-page.component';
import { SearchPageComponent } from './search/pages/search-page/search-page.component';
import { UserEditPageComponent } from './user/pages/user-edit-page/user-edit-page.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'rooms', pathMatch: 'full' },
  { path: 'rooms', component: RoomsListPageComponent },
  { path: 'rooms/new', component: RoomEditorPageComponent },
  { path: 'rooms/:roomId', component: RoomDetailsPageComponent },
  { path: 'rooms/:roomId/edit', component: RoomEditorPageComponent },
  { path: 'search', component: SearchPageComponent },
  { path: 'user/edit', component: UserEditPageComponent },
  { path: '**', redirectTo: 'rooms' },
];
