import { Locator, Page, expect } from '@playwright/test';

export class RoomsListPage {
  readonly heading: Locator;
  readonly addRoomButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Twoje pokoje' });
    this.addRoomButton = page.getByTestId('rooms-add-button');
  }

  async goto(): Promise<void> {
    await this.page.goto('/rooms');
  }

  async waitForLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
  }

  async startCreateRoom(): Promise<void> {
    await this.addRoomButton.click();
  }

  async expectRoomVisible(name: string): Promise<void> {
    await expect(this.page.getByRole('heading', { level: 3, name })).toBeVisible();
  }
}
