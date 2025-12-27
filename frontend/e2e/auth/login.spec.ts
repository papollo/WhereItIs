import { BrowserContext, Page, expect, test } from '@playwright/test';
import { LoginPage } from '../page-objects/login.page';

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
};

test.describe('Login', () => {
  let context: BrowserContext;
  let page: Page;
  let loginPage: LoginPage;

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    loginPage = new LoginPage(page);

    await loginPage.goto();
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('shows an error for invalid credentials', async () => {
    const email = requiredEnv('E2E_USERNAME');

    await loginPage.fillCredentials(email, 'invalid_password_123');
    await loginPage.submit();

    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.errorMessage).toHaveText('Nieprawidlowy email lub haslo.');
    await expect(page).toHaveScreenshot('login-invalid-credentials.png');
  });

  test('logs in with valid credentials from env', async () => {
    const email = requiredEnv('E2E_USERNAME');
    const password = requiredEnv('E2E_PASSWORD');

    await loginPage.fillCredentials(email, password);
    await loginPage.submit();

    await expect(page).toHaveURL(/\/rooms$/);
    await expect(page).toHaveScreenshot('login-success.png');

  });
});
