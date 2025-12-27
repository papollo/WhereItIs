import { BrowserContext, Page, expect, test } from '@playwright/test';
import { LoginPage } from '../page-objects/login.page';
import { RoomEditorPage } from '../page-objects/room-editor.page';
import { RoomsListPage } from '../page-objects/rooms-list.page';

const requiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
};

test.describe('Rooms', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();

    const login = new LoginPage(page);
    await login.goto();

    const email = requiredEnv('E2E_USERNAME');
    const password = requiredEnv('E2E_PASSWORD');

    await login.fillCredentials(email, password);
    await login.submit();

    await expect(page).toHaveURL(/\/rooms$/);
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('creates a 10x10 room from the editor', async () => {
    const roomsList = new RoomsListPage(page);
    const editor = new RoomEditorPage(page);
    const roomName = 'TEST_PLAYWRIGHT_ROOM';

    await roomsList.waitForLoaded();

    await roomsList.startCreateRoom();
    await expect(page).toHaveURL(/\/rooms\/new$/);
    await editor.waitForLoaded();

    await editor.setName(roomName);
    await editor.selectColor('#4caf50');
    await editor.expectColor('#4caf50');
    await editor.fillGrid(10, 10);

    await editor.save();

    await expect(page).toHaveURL(/\/rooms(\/[a-zA-Z0-9-]+)?$/);
    await roomsList.goto();
    await roomsList.waitForLoaded();
    await roomsList.expectRoomVisible(roomName);
  });
});
