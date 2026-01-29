import { expect, Page } from "@playwright/test";
import { OverseasTransferFormValues } from "../../constants/overseas-transfer.const";
import { InquiryOverseasTransferPage } from "../../pages/account/inquiry-overseas-transfer-page";
import { OverseasSingleTransferPage } from "../../pages/account/overseas-single-transfer-page";
import { test } from '../fixtures/shared-browser';
import { login } from "../helpers/auth-helper";
import { appendValueFormStep1, appendValueFormStep2 } from "../helpers/overseas-transfer.helper";

test.describe.serial('Overseas Single Transfer', () => {
  let page: Page;
  // Define a global variable for debitAccountNumber
  let debitAccountNumber: string;
  let debitAccountRawNumber: string;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext(); // ONE context for all tests
    page = await context.newPage();

    await login(page);
  });


  test('Make an Overseas Transfer', async () => {
    await page.pause();
    //TODO: Add validation
    const overseasSingleTransferPage = new OverseasSingleTransferPage(page);

    await overseasSingleTransferPage.openOverseasSingleTransferPage();

    console.log('Opening Overseas Single Transfer Page...');

    const debitAccountLabel = page.locator('#S01_jiAcnoList_label');
    // Wait until the label has a non-empty value
    await page.waitForFunction(
      (el) => !!el && el.textContent && el.textContent.trim() !== "",
      await debitAccountLabel.elementHandle(),
      { timeout: 5000 }
    );

    // Extract the numeric account number, e.g., from "700-071-125190(VND-CAHOI00)" to "700071125190"
    const debitAccountLabelValue = await debitAccountLabel.textContent();
    if (debitAccountLabelValue) {
      debitAccountRawNumber = debitAccountLabelValue.split('(')[0];
      // Split the string at '(' and use the part before it, then remove '-' characters
      debitAccountNumber = debitAccountRawNumber.replace(/-/g, '').trim();
    }

    console.log('Debit account raw number: ', debitAccountRawNumber);

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

    await page.pause();

    const confirmButtonStep1 = page.locator('#S01_lbl_btn_211');
    await confirmButtonStep1.click();

    console.log('Opening Step 2...');

    await appendValueFormStep2(page);

    const confirmButtonStep2 = page.locator('#S02_lbl_btn_211');
    await confirmButtonStep2.click();

    console.log('Opening Complete Screen...');

    const completeScreen = page.locator('#case3');
    await completeScreen.waitFor({ state: 'visible' });

    // Check that the completeScreen contains a child element with the class "transaction-complete-logo"
    const transactionCompleteLogo = completeScreen.locator('.transaction-complete-logo');
    console.log('Debit account number: ', debitAccountRawNumber);
    console.log('Beneficiary name: ', OverseasTransferFormValues.beneficiaryName);
    console.log('Beneficiary account: ', OverseasTransferFormValues.beneficiaryAccount);
    console.log('Transfer amount: ', OverseasTransferFormValues.transferAmount);
    console.log('Transaction successful');
    expect(transactionCompleteLogo).toBeVisible();
    await page.pause();

  });

  test('View transaction on the transaction list page', async () => {
    const transactionListPage = new InquiryOverseasTransferPage(page);
    await transactionListPage.openInquiryOverseasTransferPage();

    console.log('Opening Inquiry Overseas Transfer Page...');

    const accountNumberDropdown = page.locator('#S01_joAcnoList_input_0');
    await accountNumberDropdown.waitFor({ state: 'visible' });

    // Wait until there is at least one option loaded in the select dropdown
    await page.waitForFunction((selector) => {
      const select = document.querySelector(selector);
      if (!select) return false;
      return (select as HTMLSelectElement).options.length > 0;
    }, '#S01_joAcnoList_input_0');

    console.log('Clicking account number dropdown...');

    await accountNumberDropdown.click();
    await page.waitForTimeout(500);

    // Re-select options after ensuring dropdown is loaded
    const options = accountNumberDropdown.locator('option');
    const optionCount = await options.count();
    console.log('Show account number options...');

    let found = false;
    for (let i = 0; i < optionCount; i++) {
      const option = options.nth(i);
      const optionText = await option.textContent();

      if (
        (debitAccountNumber && optionText && optionText.includes(debitAccountNumber)) ||
        (debitAccountRawNumber && optionText && optionText.includes(debitAccountRawNumber))
      ) {
        // Make the option visible via keyboard for select elements (simulate selection)
        // Or use selectOption on the <select> element (recommended Playwright way)
        await accountNumberDropdown.selectOption({ index: i });
        console.log('Select account from previous transaction: ', optionText);
        found = true;
        break;
      }
    }
    if (!found) {
      throw new Error('Could not find account option matching the debit account number');
    }

    console.log('Clicking period today option...');

    const periodTodayOption = page.locator('#btn_one_day');
    await periodTodayOption.click();

    console.log('Clicking inquiry button...');

    await page.pause();

    const inquiryButton = page.locator('#S01_lbl_btn_007');
    await inquiryButton.click();

    const resultWrapper = page.locator('#grp_result');
    await resultWrapper.waitFor({ state: 'visible' });

    console.log('Transaction list loaded');

    // Loop through each tr in tbody with id "S01_grdView01_body_tbody"
    const beneficiaryName = OverseasTransferFormValues.beneficiaryName;
    const beneficiaryAccount = OverseasTransferFormValues.beneficiaryAccount;
    // Select only visible rows (not hidden by style or attribute)
    const rows = await page.locator('#S01_grdView01_body_tbody > tr').filter({ has: page.locator(':visible') });
    const rowCount = await rows.count();
    let foundBeneficiary = false;

    console.log('There are ', rowCount, ' transactions in the transaction list');

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const row = rows.nth(rowIndex);
      const tds = row.locator('td');
      const tdCount = await tds.count();
      let matchedName = false;
      let matchedAccount = false;
      let matchedAmount = false;

      for (let tdIndex = 0; tdIndex < tdCount; tdIndex++) {
        const td = tds.nth(tdIndex);
        const colId = await td.getAttribute('col_id');

        if (colId === 'iso_bnfc_nm') {
          const tdText = (await td.textContent())?.trim() || '';
          if (tdText.includes(beneficiaryName)) {
            matchedName = true;
            continue;
          }
        }

        if (colId === 'bnfc_ac_no') {
          let tdText = (await td.textContent())?.trim() || '';
          tdText = tdText.replace(/-/g, '');
          if (tdText.includes(beneficiaryAccount)) {
            matchedAccount = true;
            continue;
          }
        }

        if (colId === 'trx_amt') {
          let tdText = (await td.textContent())?.trim() || '';
          // Remove any trailing zeroes and decimal point for comparison (e.g., '10.00' -> '10')
          tdText = tdText.replace(/,/g, '').replace(/\.?0+$/, '');
          if (tdText === OverseasTransferFormValues.transferAmount) {
            matchedAmount = true;
            continue;
          }
        }
      }
      // After checking all tds in the row:
      if (matchedName && matchedAccount && matchedAmount) {
        foundBeneficiary = true;
        console.log('Found beneficiary with name: ', beneficiaryName, ' and account: ', beneficiaryAccount, ' and amount: ', OverseasTransferFormValues.transferAmount, ' on the row number: ', rowIndex + 1);
        break;
      }
    }

    await page.pause();

    expect(foundBeneficiary).toBeTruthy();

    console.log('End of test');

    if (!foundBeneficiary) {
      throw new Error(`Could not find beneficiary name "${beneficiaryName}" in the transaction list.`);
    }
  })

  test.afterAll(async () => {
    await page.context().close(); // Close AFTER all tests finish
  });
});