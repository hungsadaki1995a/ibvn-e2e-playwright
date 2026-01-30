import { Page, expect } from "@playwright/test";
import { AccountListPage } from "../../pages/account/account-list.page";
import { test } from "../fixtures/shared-browser";
import { login } from "../helpers/auth-helper";
import { getAccountCountByType } from "../helpers/current-account-list.helper";
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

test.describe.serial("View current account list page", () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(300000); // 5 minutes timeout for manual login

    const context = await browser.newContext(); // ONE context for all tests
    page = await context.newPage();

    await login(page);
  });

  test("View account list", async () => {
    const accountListPage = new AccountListPage(page);

    //TODO: Call API get account list and check with data displayed on the page
    const responsePromise = page.waitForResponse((response) =>
      response.url().includes("callGibJsonCommonService"),
    );
    await accountListPage.openAccountList();

    const response = await responsePromise;
    const accounts = await response.json();
    const accountListData = accounts.R_GIBA0100_1;

    const demand_Accounts = getAccountCountByType(accountListData, "1");
    const saving_Accounts = getAccountCountByType(accountListData, "2");

    const demandCountFromAPI = demand_Accounts;
    const savingCountFromAPI = saving_Accounts;

    const debitAccountTitleCnt = await page.locator("#debitAccountTitleCnt");
    const savingAccountTitleCnt = await page.locator("#savingAccountTitleCnt");
    const displayedCountDebitText = await debitAccountTitleCnt.textContent();
    const displayedCountSavingText = await savingAccountTitleCnt.textContent();
    const displayedCountDebit = displayedCountDebitText
      ? parseInt(displayedCountDebitText.replace(/[()]/g, ""))
      : 0;

    const displayedCountSaving = displayedCountSavingText
      ? parseInt(displayedCountSavingText.replace(/[()]/g, ""))
      : 0;

    // Verify demand account count matches
    expect(displayedCountDebit).toBe(demandCountFromAPI);
    console.log(
      `✓ Demand account count matches: ${displayedCountDebit} === ${demandCountFromAPI}`,
    );

    // Verify saving account count matches
    expect(displayedCountSaving).toBe(savingCountFromAPI);
    console.log(
      `✓ Saving account count matches: ${displayedCountSaving} === ${savingCountFromAPI}`,
    );
  });
  // const pageTitle = await page.locator('#pageTitle');
  // expect(pageTitle).toHaveText('Current Account List');

  test.afterAll(async () => {
    await page.context().close(); // Close AFTER all tests finish
  });
});
