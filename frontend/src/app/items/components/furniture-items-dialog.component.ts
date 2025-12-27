
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { ApiError } from '../../shared/api-error';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { ItemsApi } from '../items.api';
import type {
  ItemCreateResponseDto,
  ItemListItemDto,
  ItemListResponseDto,
} from '../items.types';
import { ItemsBulkAddFormComponent } from './items-bulk-add-form.component';
import { ItemsDialogActionsComponent } from './items-dialog-actions.component';
import { ItemsListComponent } from './items-list.component';
import type { ItemDraftVM } from '../items.view-models';

export type FurnitureItemsDialogData = {
  furnitureId: string;
  furnitureName: string;
  roomId?: string;
  initialItems?: ItemListItemDto[];
};

@Component({
  selector: 'app-furniture-items-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatSnackBarModule,
    ItemsListComponent,
    ItemsBulkAddFormComponent,
    ItemsDialogActionsComponent
],
  template: `
    <h2 mat-dialog-title>Przedmioty: {{ data.furnitureName }}</h2>
    <mat-dialog-content class="items-dialog">
      <section class="items-dialog__column">
        <app-items-bulk-add-form
          [drafts]="drafts"
          [saving]="isSaving"
          (add)="addDraft()"
          (remove)="removeDraft($event)"
          (update)="updateDraft($event)"
        ></app-items-bulk-add-form>
      </section>
    
      <section class="items-dialog__column">
        <app-items-list
          [items]="items"
          [isLoading]="isLoading"
          [busyIds]="deleteBusyIds"
          (delete)="confirmDelete($event)"
        ></app-items-list>
    
        @if (listError) {
          <p class="items-dialog__error">{{ listError }}</p>
        }
      </section>
    </mat-dialog-content>
    
    <app-items-dialog-actions
      [canSave]="canSave"
      [saving]="isSaving"
      (cancelAction)="close()"
      (saveAction)="saveDrafts()"
    ></app-items-dialog-actions>
    `,
  styles: [
    `
      .items-dialog {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 16px;
        min-width: 320px;
        height: 50vh;
        overflow: hidden;
        box-sizing: border-box;
      }

      .items-dialog__column {
        min-height: 0;
        overflow: auto;
        overflow-x: hidden;
      }

      .items-dialog__error {
        margin: 0;
        padding: 10px 12px;
        border-radius: 12px;
        background: #fff4f4;
        color: #8a2f2f;
        border: 1px solid #f2c6c6;
      }
    `,
  ],
})
export class FurnitureItemsDialogComponent implements OnInit {
  readonly data = inject<FurnitureItemsDialogData>(MAT_DIALOG_DATA);

  private readonly api = inject(ItemsApi);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialogRef = inject(MatDialogRef<FurnitureItemsDialogComponent>);
  private readonly cdr = inject(ChangeDetectorRef);

  items: ItemListItemDto[] = [];
  drafts: ItemDraftVM[] = [this.createDraft()];
  isLoading = false;
  isSaving = false;
  listError: string | null = null;
  deleteBusyIds = new Set<string>();
  private draftCounter = 0;

  constructor() {
    const data = this.data;

    if (data.initialItems) {
      this.items = [...data.initialItems];
    }
  }

  get canSave(): boolean {
    return this.drafts.length > 0 && this.drafts.every((draft) => this.isDraftValid(draft));
  }

  async ngOnInit(): Promise<void> {
    await this.loadItems();
  }

  close(): void {
    this.dialogRef.close();
  }

  addDraft(): void {
    this.drafts = [...this.drafts, this.createDraft()];
  }

  removeDraft(id: string): void {
    const next = this.drafts.filter((draft) => draft.id !== id);
    this.drafts = next.length > 0 ? next : [this.createDraft()];
  }

  updateDraft(payload: { id: string; name: string }): void {
    this.drafts = this.drafts.map((draft) => {
      if (draft.id !== payload.id) {
        return draft;
      }
      return { ...draft, name: payload.name, error: undefined, serverError: undefined };
    });
  }

  async saveDrafts(): Promise<void> {
    const { validItems, nextDrafts } = this.validateDrafts();
    this.drafts = nextDrafts;

    if (validItems.length === 0) {
      return;
    }

    this.isSaving = true;
    try {
      const response = await this.api.createFurnitureItems(this.data.furnitureId, {
        items: validItems,
      });
      this.applyCreateResponse(response);
    } catch (err: unknown) {
      this.showError(err);
    } finally {
      this.isSaving = false;
    }
  }

  async confirmDelete(itemId: string): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Usun przedmiot',
        message: 'Czy na pewno chcesz usunac ten przedmiot?',
        confirmText: 'Usun',
        cancelText: 'Anuluj',
      },
    });

    const confirmed = await firstValueFrom(dialogRef.afterClosed());
    if (!confirmed) {
      return;
    }

    await this.deleteItem(itemId);
  }

  private async loadItems(): Promise<void> {
    this.isLoading = true;
    this.listError = null;
    try {
      const response: ItemListResponseDto = await this.api.listFurnitureItems({
        furnitureId: this.data.furnitureId,
      });
      this.deferStateUpdate(() => {
        this.items = response.data ?? [];
      });
    } catch (err: unknown) {
      this.listError = this.formatError(err);
      this.showError(err);
    } finally {
      this.isLoading = false;
    }
  }

  private async deleteItem(itemId: string): Promise<void> {
    if (this.deleteBusyIds.has(itemId)) {
      return;
    }

    this.deleteBusyIds.add(itemId);
    try {
      await this.api.deleteItem(itemId);
      this.items = this.items.filter((item) => item.id !== itemId);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        this.items = this.items.filter((item) => item.id !== itemId);
        this.snackBar.open('Przedmiot juz zostal usuniety.', 'Zamknij', { duration: 3000 });
      } else {
        this.showError(err);
      }
    } finally {
      this.deleteBusyIds.delete(itemId);
    }
  }

  private validateDrafts(): { validItems: Array<{ name: string }>; nextDrafts: ItemDraftVM[] } {
    const validItems: Array<{ name: string }> = [];
    const nextDrafts = this.drafts.map((draft) => {
      const trimmed = draft.name.trim();
      if (trimmed.length === 0) {
        return { ...draft, error: 'Nazwa jest wymagana.', serverError: undefined };
      }
      if (trimmed.length > 200) {
        return { ...draft, error: 'Nazwa moze miec maksymalnie 200 znakow.', serverError: undefined };
      }
      validItems.push({ name: trimmed });
      return { ...draft, error: undefined, serverError: undefined };
    });

    return { validItems, nextDrafts };
  }

  private applyCreateResponse(response: ItemCreateResponseDto): void {
    this.deferStateUpdate(() => {
      if (response.created.length > 0) {
        this.items = [...response.created, ...this.items];
      }

      let remainingDrafts = [...this.drafts];

      for (const created of response.created) {
        const index = remainingDrafts.findIndex(
          (draft) => draft.name.trim() === created.name.trim()
        );
        if (index !== -1) {
          remainingDrafts.splice(index, 1);
        }
      }

      for (const failed of response.failed) {
        const index = remainingDrafts.findIndex(
          (draft) => draft.name.trim() === failed.name.trim()
        );
        if (index !== -1) {
          remainingDrafts[index] = {
            ...remainingDrafts[index],
            error: undefined,
            serverError: failed.error ?? 'Nie udalo sie zapisac przedmiotu.',
          };
        }
      }

      if (remainingDrafts.length === 0) {
        remainingDrafts = [this.createDraft()];
      }

      this.drafts = remainingDrafts;
    });
  }

  private createDraft(): ItemDraftVM {
    this.draftCounter += 1;
    return { id: `draft-${this.draftCounter}`, name: '' };
  }

  private isDraftValid(draft: ItemDraftVM): boolean {
    const trimmed = draft.name.trim();
    return (
      trimmed.length > 0 &&
      trimmed.length <= 200 &&
      !draft.error &&
      !draft.serverError
    );
  }

  private deferStateUpdate(update: () => void): void {
    Promise.resolve().then(() => {
      update();
      this.cdr.detectChanges();
    });
  }

  private showError(err: unknown): void {
    this.snackBar.open(this.formatError(err), 'Zamknij', { duration: 4000 });
  }

  private formatError(error: unknown): string {
    if (error instanceof ApiError) {
      if (error.details?.['name']) {
        return error.details['name'];
      }
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Wystapil nieznany blad.';
  }
}
