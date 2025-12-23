import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { FurnitureApi } from '../../../furniture/furniture.api';
import { ItemsApi } from '../../../items/items.api';
import { RoomsApi } from '../../../rooms/rooms.api';
import { ApiError } from '../../../shared/api-error';

@Component({
  selector: 'app-user-edit-page',
  standalone: true,
  imports: [NgIf, MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule],
  templateUrl: './user-edit-page.component.html',
  styleUrls: ['./user-edit-page.component.scss'],
})
export class UserEditPageComponent {
  private readonly roomsApi = inject(RoomsApi);
  private readonly furnitureApi = inject(FurnitureApi);
  private readonly itemsApi = inject(ItemsApi);
  private readonly snackBar = inject(MatSnackBar);
  private readonly http = inject(HttpClient);

  isSeeding = false;

  async addTestData(): Promise<void> {
    if (this.isSeeding) {
      return;
    }

    this.isSeeding = true;

    try {
      const seedData = await firstValueFrom(
        this.http.get<SeedData>('assets/seed-data.json')
      );

      for (const roomSeed of seedData.rooms) {
        const room = await this.roomsApi.createRoom({
          name: roomSeed.name,
          color: roomSeed.color,
        });

        const cells = createRoomCells(roomSeed.width, roomSeed.height);
        await this.roomsApi.replaceRoomCells(room.id, { cells });

        for (const furnitureSeed of roomSeed.furniture) {
          const furniture = await this.furnitureApi.createFurniture({
            room_id: room.id,
            name: furnitureSeed.name,
            description: furnitureSeed.description,
            color: furnitureSeed.color,
          });

          await this.furnitureApi.upsertFurniturePlacement(furniture.id, {
            room_id: room.id,
            x: furnitureSeed.placement.x,
            y: furnitureSeed.placement.y,
            width_cells: furnitureSeed.placement.width_cells,
            height_cells: furnitureSeed.placement.height_cells,
          });

          await this.itemsApi.createFurnitureItems(furniture.id, {
            items: furnitureSeed.items.map((item) => ({ name: item.name })),
          });
        }
      }

      this.snackBar.open('Dane testowe zostaly dodane.', 'Zamknij', { duration: 4000 });
    } catch (err: unknown) {
      const message = this.formatError(err);
      this.snackBar.open(message, 'Zamknij', { duration: 5000 });
    } finally {
      this.isSeeding = false;
    }
  }

  private formatError(error: unknown): string {
    if (error instanceof ApiError) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Wystapil nieznany blad.';
  }
}

function createRoomCells(width: number, height: number): { x: number; y: number }[] {
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      cells.push({ x, y });
    }
  }
  return cells;
}

type SeedData = {
  rooms: SeedRoom[];
};

type SeedRoom = {
  name: string;
  color: string;
  width: number;
  height: number;
  furniture: SeedFurniture[];
};

type SeedFurniture = {
  name: string;
  description: string;
  color: string;
  placement: {
    x: number;
    y: number;
    width_cells: number;
    height_cells: number;
  };
  items: SeedItem[];
};

type SeedItem = {
  name: string;
};
