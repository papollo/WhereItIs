import { expect, test } from '@playwright/test';
import { HomePage } from './pages/home.page';

test.describe('Home page', () => {
  test('renders the app shell', async ({ page }) => {
    const home = new HomePage(page);

    await home.goto();

    await expect(home.root).toBeVisible();
  });
});
