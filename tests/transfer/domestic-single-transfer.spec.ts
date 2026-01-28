import { Page } from "@playwright/test";
import { DomesticSingleTransferPage } from "../../pages/account/domestic-single-transfer-page";
import { test } from '../fixtures/shared-browser';
import { login } from "../helpers/auth-helper";

test.describe.serial('Domestic Single Transfer', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext(); // ONE context for all tests
    page = await context.newPage();

    await login(page);
  });


  test('View domestic single transfer page', async () => {
    const domesticSingleTransferPage = new DomesticSingleTransferPage(page);

    await domesticSingleTransferPage.openDomesticSingleTransferPage();

    const debitAccountLabel = page.locator('#S01_fromAccList_label');
    // Wait until the label has a non-empty value
    await page.waitForFunction(
      (el) => !!el && el.textContent && el.textContent.trim() !== "",
      await debitAccountLabel.elementHandle(),
      { timeout: 5000 }
    );

    const debitAccountLabelText = await debitAccountLabel.textContent();

    if (debitAccountLabelText && debitAccountLabelText.trim() !== "") {
      const balanceText = await page.locator('#S01_fromAccBlc').textContent();
      const balanceNumber = balanceText ? Number(balanceText.replace(/[^0-9.-]+/g, "")) : NaN;
      if (isNaN(balanceNumber)) {
        throw new Error('Balance is not a valid number');
      }
      if (balanceNumber <= 0) {
        throw new Error('Balance is zero or negative');
      }
    } else {
      throw new Error('There is no debit account available');
    }
    await page.waitForTimeout(500); //Wait for 

    // Click the "to bank" list dropdown
    const toBankListDropdown = page.locator('#S01_toBankList');
    await toBankListDropdown.click();
    await page.waitForTimeout(200);

    //TODO: Check fast transfer, if normal transfer, move to fast transfer

    // Select shinhan bank item
    const shinhanBankItem = page.locator('#S01_toBankList_itemTable_1');
    await shinhanBankItem.click();

    await page.fill('#S01_bnfc_ac_no', '0817868688');

    await page.fill('#S01_trx_amt', '10');

  });

  test.afterAll(async () => {
    await page.context().close(); // Close AFTER all tests finish
  });
});