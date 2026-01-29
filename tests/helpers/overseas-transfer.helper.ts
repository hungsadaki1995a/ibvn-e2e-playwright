import { Page } from "@playwright/test";
import { OverseasTransferFormValues } from "../../constants/overseas-transfer.const";

//TODO: Add function to auto fill the form
export async function appendValueFormStep1(page: Page): Promise<void> {

  await page.fill('#S01_remit_aplct_cus_adr1', OverseasTransferFormValues.remitterAddress1); // Address
  await page.fill('#S01_remit_aplct_cus_adr2', OverseasTransferFormValues.remitterAddress2); // Address2
  await page.fill('#S01_ipAcno', OverseasTransferFormValues.beneficiaryAccount); // Beneficiary Account
  await page.locator('#S01_id_select_field_input_1').check();
  await page.fill('#S01_paybnk_nm', OverseasTransferFormValues.bankName); // Bank Name
  await page.fill('#S01_paybnk_adr1', OverseasTransferFormValues.bankStreet); // Street
  await page.fill('#S01_paybnk_adr2', OverseasTransferFormValues.bankCity); // State, City
  await page.fill('#S01_paybnk_adr3', OverseasTransferFormValues.bankCountry); // Country
  await page.fill('#S01_paybnk_ac_no', OverseasTransferFormValues.bankAccountNumber); // ABA/Fedwire/BSB/CC No.
  await page.fill('#S01_bnfc_name', OverseasTransferFormValues.beneficiaryName); // Beneficiary Name
  await page.fill('#S01_bnfc_adr1', OverseasTransferFormValues.beneficiaryAddress1);
  await page.fill('#S01_bnfc_adr2', OverseasTransferFormValues.beneficiaryAddress2);
  await page.fill('#S01_bnfc_adr3', OverseasTransferFormValues.beneficiaryContactNumber); // Beneficiary Contact Number
  await page.fill('#S01_trx_amt', OverseasTransferFormValues.transferAmount); // Transfer Amount
  await page.fill('#S01_msg_remit_inf_ctt', OverseasTransferFormValues.description); // Description
  await page.locator('#S01_reservation_yn_input_0').check(); //Reservation No
  await page.locator('#S01_agreeTerm_input_0').check();
}

export async function appendValueFormStep2(page: Page): Promise<void> {
  const approvalPathDropdown = page.locator('#sbx_M3510');
  await approvalPathDropdown.waitFor({ state: 'visible' });
  await approvalPathDropdown.click();
  await page.waitForTimeout(200);

  const approvalPathOptionsWrapper = page.locator('#sbx_M3510_itemTable_main');
  const firstApprovalPath = approvalPathOptionsWrapper.locator('tr').nth(1); // 0-select option, nth(1) is first approval path
  await firstApprovalPath.click();

  // Focus input with id OTP_PIN in the parent id grpOtpForm
  const otpPinParent = await page.locator('#grpOtpForm');
  const otpPinInput = otpPinParent.locator('#OTP_PIN');
  await otpPinInput.click();

  await page.pause();
}