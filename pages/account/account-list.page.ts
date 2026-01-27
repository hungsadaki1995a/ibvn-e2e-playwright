import { Page } from "@playwright/test";

export class AccountListPage {
  constructor(private page: Page) { }

  async openAccountList() {
    console.log('Clicking parent dropdown menu...');
    const parentDropdown = this.page.locator('[id="23000000000"]');
    await parentDropdown.waitFor({ state: 'visible' });
    await parentDropdown.click();


    // Click the child menu item that includes text "Current Account List"
    console.log('Clicking Current Account List menu item...');
    // Wait for the "Current Account List" menu link (<a> tag) to be visible, then click it
    const currentAccountListLink = this.page.locator('a.corp-menu:has-text("Current Account List")');
    await currentAccountListLink.waitFor({ state: 'visible' });
    await currentAccountListLink.click();

    // Wait for navigation to complete
    console.log('Waiting for Current Account List page to load...');
    await this.page.waitForLoadState('networkidle');
  }
}