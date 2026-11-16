# CMS Admin Playwright Framework

An end-to-end (E2E) test automation framework for the **Active eCommerce CMS admin panel**, built with **Playwright** and **TypeScript**.

It covers the main admin features: **Login**, **Brand**, **Category**, **Product**, and a **full end-to-end flow** from login to viewing a product's detail page.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Test Reports](#test-reports)
- [Test Coverage](#test-coverage)
- [Framework Design](#framework-design)
- [CI/CD](#cicd)

---

## Features

- **Page Object Model (POM)** with a shared `BasePage` for common actions (search, delete, upload images, tables).
- **Custom fixtures** that inject page objects and test data straight into each test.
- **Login once, reuse the session**: the admin session is saved to `.auth/admin.json` and reused until it expires.
- **Automatic test data cleanup**: brands, categories and products created during a test are deleted afterwards.
- **Unique test data**: names are generated with the worker index and a timestamp (e.g. `DL_Brand_0_20261116103000`), so parallel runs don't clash.
- **Data-driven tests** using JSON files and data factories.
- **Cross-browser**: Chromium, Firefox and WebKit.
- **Two reports**: Playwright HTML report and Allure report (with epics, features, stories, steps and severity).
- **Debugging on failure**: screenshots, videos and traces are kept for failed tests.

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| [Playwright](https://playwright.dev/) | Browser automation and test runner |
| TypeScript | Programming language |
| [Allure](https://allurereport.org/) | Test reporting |
| [Faker](https://fakerjs.dev/) | Random test data |
| dotenv | Load environment variables from `.env` |
| zod | Data validation |
| GitHub Actions | Continuous integration |

---

## Project Structure

```
cms-admin-playwright-framework/
├── .github/workflows/
│   └── playwright.yml          # GitHub Actions CI pipeline
├── src/
│   ├── components/
│   │   └── SidebarMenu.ts      # Reusable sidebar menu component
│   ├── data/
│   │   ├── common/
│   │   │   ├── data.factory.ts         # Name / date generators
│   │   │   └── TestDataRepository.ts   # getTestData() helper for JSON data
│   │   ├── login/login-cases.json
│   │   ├── category/                   # Category JSON data + factory
│   │   └── product/                    # Product JSON data + factory
│   ├── fixtures/
│   │   ├── auth.fixture.ts             # Logged-in page & guest login page
│   │   ├── app.fixture.ts              # Page object fixtures
│   │   ├── brand-data.fixture.ts       # Seed + cleanup brand data
│   │   ├── category-data.fixture.ts    # Seed + cleanup category data
│   │   ├── product-data.fixture.ts     # Seed + cleanup product data
│   │   └── gatekeeper.fixture.ts       # Combines all fixtures -> import `test` from here
│   ├── pages/                          # Page Objects
│   │   ├── BasePage.ts
│   │   ├── CMSLoginPage.ts
│   │   ├── CMSDashboardPage.ts
│   │   ├── CMSBrandPage.ts
│   │   ├── CMSCategoryPage.ts
│   │   ├── CMSAddNewCategoryPage.ts
│   │   ├── CMSProductPage.ts
│   │   ├── CMSAddNewProductPage.ts
│   │   └── CMSViewProductPage.ts
│   ├── setup/
│   │   ├── global-setup.ts             # Clears old Allure results before a run
│   │   └── auth.setup.ts               # Logs in and saves the admin session
│   ├── tests/
│   │   ├── 01-log-in.spec.ts
│   │   ├── 02-manage-brand.spec.ts
│   │   ├── 03-manage-category.spec.ts
│   │   ├── 04-manage-product.spec.ts
│   │   └── 05-full-flow.spec.ts
│   └── utils/
│       ├── allure-meta.ts              # Helper to add Allure labels
│       └── table.helper.ts             # Table helper functions
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── .env                                # Your local settings (not committed)
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) **LTS** version (v18 or newer)
- npm (comes with Node.js)
- Access to a running **Active eCommerce CMS** admin site
- *(Optional)* Java 8+ if you use the classic Allure command line

---

## Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd cms-admin-playwright-framework

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install --with-deps
```

---

## Configuration

Create a `.env` file in the project root (this file is ignored by Git):

```env
BASE_URL=https://your-cms-site.com
CMS_ADMIN_USERNAME=your-admin-email@example.com
CMS_ADMIN_PASSWORD=your-admin-password
AUTH_CACHE_TTL_MS=7200000
```

| Variable | Required | Description |
|----------|----------|-------------|
| `BASE_URL` | Yes | Base URL of the CMS site |
| `CMS_ADMIN_USERNAME` | Yes | Admin email used by the login setup |
| `CMS_ADMIN_PASSWORD` | Yes | Admin password used by the login setup |
| `AUTH_CACHE_TTL_MS` | No | How long (ms) the saved session is reused. Default: 2 hours |

> **Note:** The login test cases in `src/data/login/login-cases.json` also contain an email and password. Update them to match your environment.

### Main Playwright settings (`playwright.config.ts`)

| Setting | Value |
|---------|-------|
| Test folder | `./src` |
| Timeout per test | 60 seconds |
| Workers | 2 locally, 1 on CI |
| Retries | 0 locally, 2 on CI |
| Viewport | 1920 x 1080 |
| Locale | `vi-VN` |
| Headless | `true` |
| Screenshot / Video / Trace | Kept only on failure |

---

## Running Tests

| Command | Description |
|---------|-------------|
| `npm run test:all` | Run all tests on all browsers |
| `npm run test:all:headed` | Run all tests with the browser visible |
| `npm run test:chrome` | Run on Chromium |
| `npm run test:firefox` | Run on Firefox |
| `npm run test:webkit` | Run on WebKit (Safari) |
| `npm run test:chrome:headed` | Run on Chromium, headed |
| `npm run test:firefox:headed` | Run on Firefox, headed |
| `npm run test:webkit:headed` | Run on WebKit, headed |

### Useful examples

```bash
# Run one spec file
npx playwright test src/tests/02-manage-brand.spec.ts --project=chromium

# Run tests by tag
npx playwright test --grep @smoke
npx playwright test --grep @brand
npx playwright test --grep "@product.*@delete"

# Open Playwright UI mode
npx playwright test --ui

# Debug a test step by step
npx playwright test src/tests/01-log-in.spec.ts --debug
```

### Available tags

| Tag | Meaning |
|-----|---------|
| `@smoke` | Critical tests |
| `@function` | Functional tests |
| `@brand`, `@category`, `@product` | Tests for a module |
| `@add`, `@edit`, `@delete` | Tests for an action |
| `@full` | Full end-to-end flow |

> The `setup` project always runs first. It logs in and saves the session, so every browser project starts already logged in.

---

## Test Reports

### Playwright HTML report

The report is saved in `reports/html`.

```bash
npm run test:report
```

### Allure report

Results are saved in `reports/allure-results` (old results are cleared automatically before each run).

```bash
npm run allure:report
```

The Allure report shows:
- **Epics / Features / Stories** (e.g. *Catalog Management → Brand Management → Add brand*)
- Test steps, parameters (such as the created brand name), severity and owner
- Environment info: base URL, browser, OS, and Local/CI

---

## Test Coverage

| Spec file | Test ID | Scenario |
|-----------|---------|----------|
| `01-log-in.spec.ts` | LOGIN_TC_01 | Log in with valid credentials |
| | LOGIN_TC_02 | Email has wrong format (browser validation) |
| | LOGIN_TC_03 | Wrong password shows an error |
| `02-manage-brand.spec.ts` | BRAND_TC_01 | Add a new brand |
| | BRAND_TC_02 | Edit an existing brand |
| | BRAND_TC_03 | Delete an existing brand |
| `03-manage-category.spec.ts` | CATEGORY_TC_01 | Add a new category |
| | CATEGORY_TC_02 | Edit an existing category |
| | CATEGORY_TC_03 | Delete an existing category |
| `04-manage-product.spec.ts` | PRODUCT_TC_01 | Add a new product |
| | PRODUCT_TC_02 | Edit an existing product |
| | PRODUCT_TC_03 | Delete an existing product |
| `05-full-flow.spec.ts` | FULL_TC_01 | Login → add brand → add category → add product → view product detail |

---

## Framework Design

### 1. Authentication flow

1. `auth.setup.ts` checks if `.auth/admin.json` exists, is newer than `AUTH_CACHE_TTL_MS`, and its session cookie has not expired.
2. If the session is still valid, login is skipped.
3. If not, it logs in with the credentials from `.env` and saves a new session.
4. Tests use the `authedPage` fixture (logged in) or the `loginPage` fixture (guest, no session).

### 2. Fixtures

Always import `test` from the gatekeeper fixture:

```ts
import { test } from "../fixtures/gatekeeper.fixture";

test("Example", async ({ brandPage, seededBrand }) => {
  await brandPage.goto();
  await brandPage.searchTheBrand(seededBrand);
  await brandPage.displayBrandSuccess(seededBrand);
});
```

| Fixture | What it gives you |
|---------|-------------------|
| `loginPage` | Login page in a clean (guest) browser context |
| `authedPage` | A page already logged in as admin |
| `dashboardPage`, `brandPage`, `categoryPage`, `addNewCategoryPage`, `productPage`, `addNewProductPage` | Ready-to-use page objects |
| `seededBrand`, `seededCategory`, `seededProduct` | Data created **before** the test (for edit/delete tests) |
| `brandCleanup`, `categoryCleanup`, `productCleanup` | Lists of names; every item is deleted **after** the test |

### 3. Test data

- **JSON files** hold static data (login cases, category, product).
- **Factories** (`createFullCategory()`, `createFullProduct()`, `createEditProduct()`, ...) build data objects with a unique name.
- **`getTestData(namespace, key, options)`** reads JSON data safely, returns a copy, and supports `overrides` and `transform`:

```ts
const validCredentials = getTestData("login", "validCredentials");
```

### 4. Page Objects

Every page extends `BasePage`, which provides:
- `goto()` and `expectOnPage()` for navigation checks
- Common table actions: search, find a row by name, delete, check "Nothing found"
- Image upload from the CMS file manager
- `fillWithLog()` which logs every input (passwords are masked as `****`)

---

## CI/CD

The GitHub Actions workflow (`.github/workflows/playwright.yml`) runs on every push and pull request to `main` / `master`:

1. Checkout code
2. Set up Node.js (LTS)
3. `npm ci`
4. Install Playwright browsers
5. Run `npx playwright test`
6. Upload the test report as a build artifact (kept for 30 days)

> **Tip:** Add `BASE_URL`, `CMS_ADMIN_USERNAME` and `CMS_ADMIN_PASSWORD` as **GitHub Secrets** and pass them to the test step as environment variables, because the `.env` file is not committed.

---

## Author

**Diem Le**
