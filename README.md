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

### Running Tests

Run all tests:

```bash
pnpm test
```

Run tests in UI mode:

```bash
pnpm test:ui
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

## Project Structure

```
.
├── tests/              # Test files
├── playwright.config.ts # Playwright configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Project dependencies
```
