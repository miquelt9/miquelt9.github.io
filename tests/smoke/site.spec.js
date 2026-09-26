const { test, expect } = require('@playwright/test');
const { nextTheme, shellForWidth } = require('../helpers/site-shell');

const DESKTOP = { width: 1280, height: 800 };
const DESKTOP_EDGE = { width: 769, height: 800 };
const PHONE = { width: 390, height: 844 };
const PHONE_EDGE = { width: 768, height: 900 };

async function dismissCookieNotice(page) {
  const reject = page.locator('#cookies-banner-reject');
  if (await reject.isVisible()) {
    await reject.click();
    await expect(page.locator('#cookies-banner')).toBeHidden();
  }
}

async function gotoHome(page) {
  const response = await page.goto('/', { waitUntil: 'load' });
  expect(response, 'GET / should return a response').toBeTruthy();
  expect(response.status(), 'GET / should succeed').toBeLessThan(400);
  await expect(page).toHaveTitle("Miquel's PC");
  await dismissCookieNotice(page);
}

test.describe('desktop shell', () => {
  test.use({ viewport: DESKTOP });

  test('loads the desktop and opens the About window', async ({ page }) => {
    expect(shellForWidth(DESKTOP.width)).toBe('desktop');
    await gotoHome(page);

    await expect(page.locator('.desktop_device')).toBeVisible();
    await expect(page.locator('#phone-os')).toBeHidden();
    await expect(page.locator('#aboutme')).toBeVisible();

    const about = page.locator('#aboutbox');
    await expect(about).toBeHidden();
    await page.locator('#aboutme').click();
    await expect(about).toBeVisible();
    await expect(page.locator('#aboutboxTaskbar')).toBeVisible();
    await expect(page.locator('#about-desktop-content')).toContainText('Miquel');
  });

  test('cycles the display theme from the taskbar', async ({ page }) => {
    await gotoHome(page);

    const themeToggle = page.locator('#theme-toggle');
    await expect(themeToggle).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-pc-theme', 'light');
    await expect(themeToggle).toHaveAttribute('aria-label', 'Display: Day');

    const before = await page.locator('html').getAttribute('data-pc-theme');
    await themeToggle.click();

    const expected = nextTheme(before);
    await expect(page.locator('html')).toHaveAttribute('data-pc-theme', expected);
    await expect(themeToggle).toHaveAttribute('aria-label', 'Display: Night');
    await expect(themeToggle).toHaveText('Night');
  });

  test('falls back to light when the stored theme is invalid', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('pc-theme', 'nope');
    });
    await gotoHome(page);
    await expect(page.locator('html')).toHaveAttribute('data-pc-theme', 'light');
  });
});

test.describe('desktop breakpoint', () => {
  test.use({ viewport: DESKTOP_EDGE });

  test('keeps the desktop shell just above 768px', async ({ page }) => {
    expect(shellForWidth(DESKTOP_EDGE.width)).toBe('desktop');
    await gotoHome(page);
    await expect(page.locator('.desktop_device')).toBeVisible();
    await expect(page.locator('#aboutme')).toBeVisible();
    await expect(page.locator('#phone-os')).toBeHidden();
  });
});

test.describe('phone shell', () => {
  test.use({ viewport: PHONE });

  test('loads the phone shell and can open About', async ({ page }) => {
    expect(shellForWidth(PHONE.width)).toBe('phone');
    await gotoHome(page);

    const phone = page.locator('#phone-os');
    await expect(phone).toBeVisible();
    await expect(page.locator('.desktop_device')).toBeHidden();
    await expect(page.locator('#phone-home')).toBeVisible();

    const aboutApp = phone.getByRole('button', { name: 'About me' });
    await expect(aboutApp).toBeVisible();
    await aboutApp.click();

    const about = page.locator('#aboutbox-mobile');
    await expect(about).toBeVisible();
    await expect(page.locator('#about-mobile-content')).toContainText('Miquel');
    await expect(phone).toHaveClass(/phone-app-open/);

    await phone.getByRole('button', { name: 'Start' }).click();
    await expect(about).toBeHidden();
    await expect(page.locator('#phone-home')).toBeVisible();
  });

  test('uses the system theme on phone viewports even when a theme is stored', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('pc-theme', 'dark');
    });
    await gotoHome(page);
    await expect(page.locator('html')).toHaveAttribute('data-pc-theme', 'system');
  });
});

test.describe('phone breakpoint', () => {
  test.use({ viewport: PHONE_EDGE });

  test('uses the phone shell at 768px', async ({ page }) => {
    expect(shellForWidth(PHONE_EDGE.width)).toBe('phone');
    await gotoHome(page);
    await expect(page.locator('#phone-os')).toBeVisible();
    await expect(page.locator('.desktop_device')).toBeHidden();
    await expect(page.locator('#phone-home')).toBeVisible();
    await expect(page.locator('#phone-os').getByRole('button', { name: 'About me' })).toBeVisible();
  });
});
