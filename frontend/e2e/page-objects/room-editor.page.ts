import { Locator, Page, expect } from '@playwright/test';

export class RoomEditorPage {
  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly grid: Locator;
  readonly saveButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Nowy pokoj' });
    this.nameInput = page.getByTestId('room-name-input');
    this.grid = page.getByTestId('room-grid');
    this.saveButton = page.getByTestId('room-save-button');
  }

  async waitForLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.grid).toBeVisible();
  }

  async setName(name: string): Promise<void> {
    await this.nameInput.fill(name);
  }

  async selectColor(hex: string): Promise<void> {
    const normalized = hex.replace('#', '');
    await this.page.getByTestId(`room-color-${normalized}`).click();
  }

  async expectColor(hex: string): Promise<void> {
    const normalized = hex.replace('#', '');
    const swatch = this.page.getByTestId(`room-color-${normalized}`);
    await expect(swatch).toHaveClass(/color-picker__swatch--active/);
  }

  async fillGrid(width: number, height: number): Promise<void> {
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        await this.page.getByTestId(`room-grid-cell-${x}-${y}`).click();
      }
    }
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }
}
