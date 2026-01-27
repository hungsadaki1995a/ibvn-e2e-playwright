import { test as base, Browser, BrowserContext, chromium, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Global variables to store shared browser and context
let sharedBrowser: Browser | null = null;
let sharedContext: BrowserContext | null = null;

// Align with playwright.config.ts: same baseURL and auth file
const baseURL = process.env.BASE_URL || 'https://vntst.shinhanglobal.com';
const authFile = path.join(process.cwd(), 'auth', 'retail-user.json');
const authFileExists = fs.existsSync(authFile);

type SharedBrowserFixtures = {
  sharedPage: Page;
};

/**
 * Custom fixture that provides a shared browser context across all tests.
 * Opens the base URL by default so each test receives a page already on the app.
 */
export const test = base.extend<SharedBrowserFixtures>({
  sharedPage: async ({ }, use, testInfo) => {
    // Launch browser only once (first test)
    if (!sharedBrowser) {
      console.log('Launching shared browser for all tests...');
      sharedBrowser = await chromium.launch({
        headless: false,
        args: ['--disable-blink-features=AutomationControlled'],
      });
    }

    // Create context only once (first test), with baseURL and auth from config
    if (!sharedContext || sharedContext.browser()?.isConnected() === false) {
      console.log('Creating shared browser context...');
      sharedContext = await sharedBrowser.newContext({
        baseURL,
        viewport: { width: 1280, height: 720 },
        ...(authFileExists && { storageState: authFile }),
      });
      if (authFileExists) {
        console.log('Loaded saved authentication state from auth/retail-user.json');
      }
    }

    // Get or create a page from the shared context
    const pages = sharedContext.pages();
    const page = pages.length > 0 ? pages[0] : await sharedContext.newPage();

    // Open base URL by default so every test starts on the app (no per-test navigation needed)
    await page.goto('/');

    await use(page);

    // Don't close the page or context - keep them open for other tests
    // Only close on the very last test
    if (testInfo.retry === testInfo.project.retries) {
      // This is the last retry, but we still want to keep browser open for UI mode
      // Browser will be closed when Playwright exits
    }
  },
});

export { expect } from '@playwright/test';

