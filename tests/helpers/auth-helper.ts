import { Page } from '@playwright/test';

/**
 * Verify that the user is logged in by checking for the 'corp' class layout
 * This is the indicator that we're on the dashboard/main page, not the home/login page
 * 
 * @param page - Playwright page object
 * @param timeout - Timeout in milliseconds (default: 10000)
 * @throws Error if not logged in
 */
export async function verifyLoggedIn(page: Page, timeout: number = 10000): Promise<void> {
  const corpLayout = page.locator('.corp');
  await corpLayout.waitFor({ state: 'visible', timeout });

  // Double check it's actually visible
  const isVisible = await corpLayout.first().isVisible();
  if (!isVisible) {
    throw new Error('Layout with class "corp" not visible');
  }

  console.log('Logged in successfully');
}

export async function login(page: Page): Promise<void> {
  await page.goto('/');

  // Click login button to open login page
  console.log('Clicking login button...');
  const loginButton = page.locator('#btn_login');
  await loginButton.waitFor({ state: 'visible' });
  await loginButton.click();

  // Wait for login form to be visible
  console.log('Waiting for login form...');

  //STEP 1: Enter user ID & PASSWORD

  await page.waitForSelector('#ipt_userID', { state: 'visible' });

  // Enter user ID automatically
  const userIdInput = page.locator('#ipt_userID');
  const userId = process.env.USER_ENTRY_ID || 'CAHOI01';
  await userIdInput.fill(userId);
  console.log(`User ID filled: ${userId}`);

  // Click on password field to trigger virtual keyboard
  console.log('Clicking password field to show virtual keyboard...');
  const passwordIcon = page.locator('#USER_PWD');
  await page.waitForTimeout(500);
  await passwordIcon.click();
  await page.waitForSelector('#nfilter_char', { state: 'visible' });

  // Pause execution and wait for manual login
  await page.pause();

  const loginStep1Button = page.locator('a.btnLv1');
  await loginStep1Button.click();

  //STEP 2: Enter security question answer

  // After manual login, wait for verification step
  await page.waitForSelector('#btn_M1150M00_Next', { state: 'visible' });
  await page.waitForSelector('#ipt_answer', { state: 'visible' });
  console.log('Login step 2: Enter security question answer');

  // Enter security question answer
  const answerInput = page.locator('#ipt_answer');
  const securityAnswer = process.env.LOGIN_SECURITY_ANSWER || 'aa';
  await page.waitForTimeout(500);
  await answerInput.fill(securityAnswer);
  console.log(`Security answer filled: ${securityAnswer}`);

  const confirmButton = page.locator('#btn_M1150M00_Next');
  await confirmButton.click();



  // Wait for navigation after clicking confirm button
  await page.waitForLoadState('networkidle');

  // Check if OTP_PIN field is visible (for OTP step), interact with keypad if needed
  //STEP 3: Enter OTP_PIN
  const otpPinInput = page.locator('#OTP_PIN');
  if (await otpPinInput.isVisible({ timeout: 1500 }).catch(() => false)) {
    console.log('OTP_PIN detected, handling OTP keypad...');
    await page.waitForTimeout(500);
    await otpPinInput.click();
    await page.pause();
    const otpTokenNextButton = page.locator('a.btnLv1');
    await otpTokenNextButton.click();
    await page.waitForLoadState('networkidle');
  }

  await verifyLoggedIn(page);

}
