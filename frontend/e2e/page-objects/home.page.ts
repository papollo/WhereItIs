import { Locator, Page } from '@playwright/test';

export class HomePage {
  readonly root: Locator;

  constructor(private readonly page: Page) {
    this.root = page.locator('app-root');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }
}
