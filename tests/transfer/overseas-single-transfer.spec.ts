import { expect, Page } from "@playwright/test";
import { OverseasSingleTransferPage } from "../../pages/account/overseas-single-transfer-page";
import { test } from '../fixtures/shared-browser';
import { login } from "../helpers/auth-helper";
import { appendValueFormStep1, appendValueFormStep2 } from "../helpers/overseas-transfer.helper";

test.describe.serial('Overseas Single Transfer', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext(); // ONE context for all tests
    page = await context.newPage();

    await login(page);
  });


  test('Overseas Single Transfer', async () => {
    //TODO: Add validation
    const overseasSingleTransferPage = new OverseasSingleTransferPage(page);

    await overseasSingleTransferPage.openOverseasSingleTransferPage();

    const debitAccountLabel = page.locator('#S01_jiAcnoList_label');
    // Wait until the label has a non-empty value
    await page.waitForFunction(
      (el) => !!el && el.textContent && el.textContent.trim() !== "",
      await debitAccountLabel.elementHandle(),
      { timeout: 5000 }
    );

    const debitAccountBalanceText = await debitAccountLabel.textContent();

    if (debitAccountBalanceText && debitAccountBalanceText.trim() !== "") {
      const balanceText = await page.locator('#pabl_blc').textContent();
      const balanceNumber = balanceText ? Number(balanceText.replace(/[^0-9.-]+/g, "")) : NaN;
      if (isNaN(balanceNumber)) {
        throw new Error('Balance is not a valid number');
      }
      if (balanceNumber <= 0) {
        throw new Error('Balance is zero or negative'); //TODO: Handle select other account
      }
    } else {
      throw new Error('There is no debit account available');
    }

    // Move form value appending to helper file
    await appendValueFormStep1(page);

    const confirmButtonStep1 = page.locator('#S01_lbl_btn_211');
    await confirmButtonStep1.click();

    await appendValueFormStep2(page);

    const confirmButtonStep2 = page.locator('#S02_lbl_btn_211');
    await confirmButtonStep2.click();

    const completeScreen = page.locator('#case3');
    await completeScreen.waitFor({ state: 'visible' });

    // Check that the completeScreen contains a child element with the class "transaction-complete-logo"
    const transactionCompleteLogo = completeScreen.locator('.transaction-complete-logo');
    console.log('Transaction successful');
    expect(transactionCompleteLogo).toBeVisible();

  });

  test.afterAll(async () => {
    await page.context().close(); // Close AFTER all tests finish
  });
});