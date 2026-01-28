import { Page } from "@playwright/test";

export class OverseasSingleTransferPage {
  constructor(private page: Page) { }

  async openOverseasSingleTransferPage() {
    console.log('Clicking parent dropdown menu...');
    const parentDropdown = this.page.locator('[id="24000000000"]');
    await parentDropdown.waitFor({ state: 'visible' });
    await parentDropdown.click();


    // Click the child menu item that includes text "Overseas Single Transfer"
    console.log('Clicking Overseas Single Transfer menu item...');
    // Wait for the "Overseas Single Transfer" menu link (<a> tag) to be visible, then click it
    const overseasSingleTransferLink = this.page.locator('a.corp-menu:has-text("Overseas Single Transfer")');
    await overseasSingleTransferLink.waitFor({ state: 'visible' });
    await overseasSingleTransferLink.click();

    // Wait for navigation to complete
    console.log('Waiting for Overseas Single Transfer page to load...');
    await this.page.waitForLoadState('networkidle');
  }
}