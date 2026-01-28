import { Page } from "@playwright/test";

export class DomesticSingleTransferPage {
  constructor(private page: Page) { }

  async openDomesticSingleTransferPage() {
    console.log('Clicking parent dropdown menu...');
    const parentDropdown = this.page.locator('[id="23000000000"]');
    await parentDropdown.waitFor({ state: 'visible' });
    await parentDropdown.click();


    // Click the child menu item that includes text "Domestic Single Transfer"
    console.log('Clicking Domestic Single Transfer menu item...');
    // Wait for the "Domestic Single Transfer" menu link (<a> tag) to be visible, then click it
    const domesticSingleTransferLink = this.page.locator('a.corp-menu:has-text("Domestic Single Transfer")');
    await domesticSingleTransferLink.waitFor({ state: 'visible' });
    await domesticSingleTransferLink.click();

    // Wait for navigation to complete
    console.log('Waiting for Domestic Single Transfer page to load...');
    await this.page.waitForLoadState('networkidle');
  }
}