# Playwright E2E Tests

This project contains end-to-end tests using Playwright.

## Getting Started

### Installation

Install dependencies using pnpm:

```bash
pnpm install
```

### Install Playwright Browsers

After installing dependencies, install the Playwright browsers:

```bash
pnpm exec playwright install
```

### Authentication Setup (Manual Login)

Since the application uses a virtual keyboard with randomized layout for password entry, you need to login manually once to save the authentication state:

```bash
pnpm test:setup
```

**Instructions:**
1. The browser will open and navigate to the login page
2. User ID will be pre-filled (or enter it manually)
3. **Enter your password manually using the virtual keyboard**
4. Click the login/submit button
5. Wait for successful login
6. The authentication state (cookies, localStorage, sessionStorage) will be automatically saved

The saved authentication state will be reused by all subsequent automated tests, so you only need to login manually once (or when the session expires).

### Running Tests

**Option 1: Using Same Browser Session (Recommended for server-side auth)**

Since authentication is checked server-side, use this approach to run login first and keep the browser open:

1. **Run tests with shared browser session:**
   ```bash
   pnpm test:ui-session
   ```
   Or for headed mode:
   ```bash
   pnpm test:session
   ```

2. **How it works:**
   - All tests use a **shared browser context** (same browser session)
   - The `login-session.spec.ts` test must run first to establish login
   - Other tests will automatically use the same browser session
   - The browser stays open throughout all test execution
   - Tests run sequentially (workers=1) to maintain the session

3. **Test execution order:**
   - First: `login-session.spec.ts` - performs login and establishes session
   - Then: All other tests run in the same browser session
   - The login session is maintained across all tests

**Option 2: Using Saved Authentication State**

1. Run manual login to save state: `pnpm test:setup`
2. Then run automated tests: `pnpm test`

**Regular test commands:**
```bash
# Run all tests (uses saved auth state if available)
pnpm test

# Run tests in UI mode
pnpm test:ui

# Run tests with login session (same browser)
pnpm test:ui-session
```

Run tests in headed mode (see the browser):

```bash
pnpm test:headed
```

Debug tests:

```bash
pnpm test:debug
```

View test report:

```bash
pnpm test:report
```

Run only automated tests (skip manual login):

```bash
pnpm test:auto
```

## Project Structure

```
.
├── tests/                    # Test files
│   ├── setup/               # Setup files (manual login)
│   │   └── manual-login.spec.ts
│   ├── helpers/              # Helper functions
│   │   └── virtual-keyboard.ts
│   ├── login.spec.ts         # Login test (if needed)
│   └── example-authenticated.spec.ts  # Example authenticated test
├── playwright/
│   └── .auth/                # Saved authentication state (gitignored)
│       └── user.json
├── playwright.config.ts     # Playwright configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies
```

## How It Works

1. **Manual Login Setup**: Run `pnpm test:setup` to login manually once. This saves your authentication state to `playwright/.auth/user.json`.

2. **Automated Tests**: All other tests automatically use the saved authentication state, so they run without requiring login.

3. **Authentication State**: The saved state includes:
   - Cookies
   - localStorage
   - sessionStorage

4. **When to Re-run Setup**: Re-run `pnpm test:setup` when:
   - Your session expires
   - You need to login with different credentials
   - The authentication state file is deleted
