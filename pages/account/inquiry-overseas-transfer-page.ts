import { Page } from "@playwright/test";

export class InquiryOverseasTransferPage {
  constructor(private page: Page) { }

  async openInquiryOverseasTransferPage() {
    console.log('Clicking Inquiry Overseas Transfer parent dropdown menu...');
    const parentDropdown = this.page.locator('[id="24000000000"]');
    await parentDropdown.waitFor({ state: 'visible' });
    await parentDropdown.click();


    // Click the child menu item that includes text "Inquiry Overseas Transfer"
    console.log('Clicking Inquiry Overseas Transfer menu item...');
    // Wait for the "Inquiry Overseas Transfer" menu link (<a> tag) to be visible, then click it
    const inquiryOverseasTransferLink = this.page.locator('a.corp-menu:has-text("Inquiry Overseas Transfer")');
    await inquiryOverseasTransferLink.waitFor({ state: 'visible' });
    await inquiryOverseasTransferLink.click();

    // Wait for navigation to complete
    console.log('Waiting for Inquiry Overseas Transfer page to load...');
    await this.page.waitForLoadState('networkidle');
  }
}