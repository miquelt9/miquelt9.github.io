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
    await expect(page.locator('#theme-toggle-mobile')).toHaveCount(1);
    await expect(page.locator('#theme-toggle-mobile')).toHaveText('Display: Night');
  });

  test('opens a desktop icon and Start from the keyboard', async ({ page }) => {
    await gotoHome(page);

    const about = page.locator('#aboutme');
    await expect(about).toHaveAttribute('role', 'button');
    await expect(about).toHaveAttribute('tabindex', '0');
    await about.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#aboutbox')).toBeVisible();

    const close = page.locator('#aboutboxheader .topbarButton.clickable').last();
    await expect(close).toHaveAttribute('role', 'button');
    await expect(close).toHaveAttribute('tabindex', '0');
    await close.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#aboutbox')).toBeHidden();

    const start = page.locator('#startmenu-btn');
    await expect(start).toHaveAttribute('role', 'button');
    await expect(start).toHaveAttribute('tabindex', '0');
    await start.focus();
    await page.keyboard.press(' ');
    await expect(page.locator('#startbutton')).toBeVisible();
  });

  test('project and contact portfolio links stay and open in a new tab', async ({ page }) => {
    await gotoHome(page);

    await page.locator('#projects').click();
    const projects = page.locator('#projects-desktop-content');
    await expect(projects).toBeVisible();
    const title = projects.locator('a', { hasText: 'Otaniemi tracker bot' });
    await expect(title).toHaveAttribute('href', 'https://miquelt9.github.io/portfolio/posts/personal/otaniemi-tracker-bot/');
    await expect(title).toHaveAttribute('target', '_blank');
    await expect(title).toHaveAttribute('rel', 'noopener noreferrer');
    const footer = projects.locator('a', { hasText: 'portfolio' });
    await expect(footer).toHaveAttribute('href', 'https://miquelt9.github.io/portfolio/posts/');
    await expect(footer).toHaveAttribute('target', '_blank');
    await expect(projects.locator('a[href="https://github.com/miquelt9/otaniemitrackerbot"]')).toBeVisible();
    await expect(projects.locator('a[href="https://devpost.com/software/plushistics"]')).toBeVisible();
    await expect(projects.locator('a[href="https://t.me/otaniemitrackerbot"]')).toBeVisible();
    await expect(projects.locator('a[href="https://devpost.com/software/spaceshooter-5hi4of"]')).toBeVisible();
    await page.locator('#projectsboxheader .topbarButton.clickable').last().click();

    await page.locator('#contactme').click();
    const contact = page.locator('#contact-desktop-content');
    const portfolio = contact.locator('a', { hasText: 'Portfolio' });
    await expect(portfolio).toHaveAttribute('href', 'https://miquelt9.github.io/portfolio');
    await expect(portfolio).toHaveAttribute('target', '_blank');
    await expect(portfolio).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(contact.locator('a[href="https://github.com/miquelt9"]')).toBeVisible();
    await expect(contact.getByText('Check my CV!')).toBeVisible();
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

    await about.locator('.topbarButton.clickable').click();
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

  test('cycles the theme from the single mobile control', async ({ page }) => {
    await gotoHome(page);
    const toggle = page.locator('#theme-toggle-mobile');
    await expect(toggle).toHaveCount(1);
    await expect(toggle).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-pc-theme', 'system');
    await expect(toggle).toHaveText('Display: System');

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-pc-theme', 'light');
    await expect(toggle).toHaveText('Display: Day');

    await page.locator('#phone-os').getByRole('button', { name: 'Projects' }).click();
    const projects = page.locator('#projects-mobile-content');
    const title = projects.locator('a', { hasText: 'Falcon Explorer' });
    await expect(title).toHaveAttribute('href', 'https://miquelt9.github.io/portfolio/posts/college/falconexplorer/');
    await expect(title).toHaveAttribute('target', '_blank');
    await expect(title).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(projects.locator('a', { hasText: 'portfolio' })).toHaveAttribute('href', 'https://miquelt9.github.io/portfolio/posts/');
    await expect(projects.locator('a[href="https://github.com/miquelt9/PROP-FIB"]')).toBeVisible();
    await expect(projects.locator('a[href="/apps/spaceshooter/index.html"]')).toBeVisible();
    await page.locator('#projectsbox-mobile .topbarButton.clickable').click();

    await page.locator('#phone-os').getByRole('button', { name: 'Contact' }).click();
    const contact = page.locator('#contact-mobile-content');
    const portfolio = contact.locator('a', { hasText: 'Portfolio' });
    await expect(portfolio).toHaveAttribute('href', 'https://miquelt9.github.io/portfolio');
    await expect(portfolio).toHaveAttribute('target', '_blank');
    await expect(contact.locator('a[href="./docs/Miquel_Torner_CV.pdf"]')).toBeVisible();
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
