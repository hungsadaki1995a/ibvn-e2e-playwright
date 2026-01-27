import { Page } from "@playwright/test";
import { AccountListPage } from '../../pages/account/account-list.page';
import { expect, test } from '../fixtures/shared-browser';
import { login } from "../helpers/auth-helper";
/**
 * Current Account List Page Test
 * 
 * This test navigates to the Current Account List page through the menu system
 * and verifies that the page loads correctly.
 * 
 * Prerequisites:
 * - Login test must run first (configured via project dependencies)
 * - Uses shared browser session from login test
 * - User must be logged in (login test handles authentication)
 */
//TODO: Reuse cookies between browsers
// test('view current account list', async ({ sharedPage: page }) => {
//   await page.waitForLoadState('networkidle');
//   await page.waitForTimeout(5000);
//   const accountListPage = new AccountListPage(page);

//   await accountListPage.openAccountList();

//   // Assert that the page title includes "Current Account List"
//   // Check both the page title (browser tab) and any page heading
//   // const pageTitle = await page.title();
//   const pageTitle = await page.locator('#pageTitle');
//   expect(pageTitle).toHaveText('Current Account List');
//   console.log(`Page title verified: ${pageTitle}`);
// });

test.describe.serial('View current account list page', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext(); // ONE context for all tests
    page = await context.newPage();

    await login(page);
  });


  test('View account list', async () => {
    const accountListPage = new AccountListPage(page);

    await accountListPage.openAccountList();

    const pageTitle = await page.locator('#pageTitle');
    expect(pageTitle).toHaveText('Current Account List');
  });

  test.afterAll(async () => {
    await page.context().close(); // Close AFTER all tests finish
  });
});