import { chromium, FullConfig, Page } from '@playwright/test';

export default async (config: FullConfig) => {
  const baseURL = process.env.BASE_URL || 'https://vntst.shinhanglobal.com';

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  console.log('Navigating to application...');
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
  console.log('Waiting for verification step to complete...');
  await page.waitForSelector('#btn_M1150M00_Next', { state: 'visible' });
  await page.waitForSelector('#ipt_answer', { state: 'visible' });

  // Enter security question answer
  const answerInput = page.locator('#ipt_answer');
  const securityAnswer = process.env.LOGIN_SECURITY_ANSWER || 'aa';
  await page.waitForTimeout(500);
  await answerInput.fill(securityAnswer);
  console.log(`Security answer filled: ${securityAnswer}`);

  const confirmButton = page.locator('#btn_M1150M00_Next');
  await confirmButton.click();



  // Wait for navigation after clicking confirm button
  console.log('Waiting for navigation after confirm button click...');
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


  // Verify successful login by checking for layout with class 'corp'
  console.log('Verifying successful login - checking for layout with class "corp"...');
  await verifyLoggedIn(page);

  await context.storageState({ path: 'auth/retail-user.json' });
  await browser.close();
};

export async function verifyLoggedIn(page: Page, timeout: number = 30000): Promise<void> {
  try {
    const corpLayout = page.locator('.corp');
    await corpLayout.waitFor({ state: 'visible', timeout });

    // Double check it's actually visible
    const isVisible = await corpLayout.first().isVisible();
    if (!isVisible) {
      throw new Error('Layout with class "corp" not visible');
    }
  } catch (error) {
    throw new Error(
      'Not logged in: Layout with class "corp" not found. ' +
      'This means you are still on the home/login page. ' +
      'Please run "pnpm test:setup" to login and save authentication state first.'
    );
  }
}