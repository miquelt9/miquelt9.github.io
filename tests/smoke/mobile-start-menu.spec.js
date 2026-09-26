const { test, expect } = require('@playwright/test');

const PHONE = { width: 390, height: 844 };
const PHONE_EDGE = { width: 768, height: 900 };
const DESKTOP = { width: 1280, height: 800 };

async function gotoHome(page) {
  const response = await page.goto('/', { waitUntil: 'load' });
  expect(response, 'GET / should return a response').toBeTruthy();
  expect(response.status(), 'GET / should succeed').toBeLessThan(400);
  await expect(page).toHaveTitle("Miquel's PC");
}

async function expectMenuClosed(page) {
  await expect(page.locator('#startbutton')).toBeHidden();
}

async function expectMenuOpenAboveDock(page) {
  const menu = page.locator('#startbutton');
  await expect(menu).toBeVisible();
  await expect(menu).toContainText('Have a nice day!');
  await expect(menu).toContainText('Something coming soon...');

  const menuBox = await menu.boundingBox();
  const dockBox = await page.locator('.phone-dock').boundingBox();
  const phoneBox = await page.locator('#phone-os').boundingBox();
  expect(menuBox).toBeTruthy();
  expect(dockBox).toBeTruthy();
  expect(phoneBox).toBeTruthy();
  expect(menuBox.height).toBeGreaterThan(40);
  expect(menuBox.width).toBeGreaterThan(140);
  expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(dockBox.y + 1);
  expect(menuBox.x).toBeGreaterThanOrEqual(phoneBox.x - 1);
  expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(phoneBox.x + phoneBox.width + 1);
}

test.describe('phone start menu', () => {
  test.use({ viewport: PHONE, hasTouch: true });

  test('tap Start opens the menu, tap again and tap outside close it', async ({ page }) => {
    await gotoHome(page);
    await expect(page.locator('#phone-os')).toBeVisible();
    await expect(page.locator('.desktop_device')).toBeHidden();
    await expectMenuClosed(page);

    const start = page.locator('#phone-start-btn');
    await expect(start).toBeVisible();
    await expect(start).toHaveText('Start');

    await start.tap();
    await expectMenuOpenAboveDock(page);
    await expect(page.locator('#phone-home')).toBeVisible();

    await start.tap();
    await expectMenuClosed(page);

    await start.tap();
    await expectMenuOpenAboveDock(page);
    await page.locator('#phone-clock').tap();
    await expectMenuClosed(page);
  });

  test('Start still opens the menu while a phone app is open', async ({ page }) => {
    await gotoHome(page);
    await page.locator('#phone-os').getByRole('button', { name: 'About me' }).tap();
    await expect(page.locator('#aboutbox-mobile')).toBeVisible();

    await page.locator('#phone-start-btn').tap();
    await expectMenuOpenAboveDock(page);
    await expect(page.locator('#aboutbox-mobile')).toBeVisible();

    await page.locator('#aboutbox-mobile .topbarButton.clickable').tap();
    await expect(page.locator('#aboutbox-mobile')).toBeHidden();
    await expect(page.locator('#phone-home')).toBeVisible();
  });
});

test.describe('phone start menu at 768px', () => {
  test.use({ viewport: PHONE_EDGE, hasTouch: true });

  test('tap Start opens the menu at the phone breakpoint', async ({ page }) => {
    await gotoHome(page);
    await expect(page.locator('#phone-os')).toBeVisible();
    await page.locator('#phone-start-btn').tap();
    await expectMenuOpenAboveDock(page);
    await page.locator('#phone-start-btn').tap();
    await expectMenuClosed(page);
  });
});

test.describe('desktop start menu', () => {
  test.use({ viewport: DESKTOP });

  test('Start still toggles the menu and outside click closes it', async ({ page }) => {
    await gotoHome(page);
    await expect(page.locator('.desktop_device')).toBeVisible();
    await expect(page.locator('#phone-os')).toBeHidden();
    await expect(page.locator('#phone-start-btn')).toBeHidden();

    const start = page.locator('#startmenu-btn');
    await expect(start).toBeVisible();
    await expectMenuClosed(page);

    await start.click();
    const menu = page.locator('#startbutton');
    await expect(menu).toBeVisible();
    await expect(menu).toContainText('Have a nice day!');

    const menuBox = await menu.boundingBox();
    const startBox = await start.boundingBox();
    expect(menuBox).toBeTruthy();
    expect(startBox).toBeTruthy();
    expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(startBox.y + 2);
    expect(menuBox.x).toBeLessThanOrEqual(startBox.x + 4);

    await start.click();
    await expectMenuClosed(page);

    await start.click();
    await expect(menu).toBeVisible();
    await page.mouse.click(640, 200);
    await expectMenuClosed(page);
  });
});
