import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { test as base, type BrowserContext, type Page } from "@playwright/test";
import { CMSLoginPage } from "../pages/CMSLoginPage";

const AUTH_FILE = ".auth/admin.json";

export type AuthFixture = {
  loginPage: CMSLoginPage;
  authedPage: Page;
};

export type StorageStateSnapshot = Awaited<ReturnType<BrowserContext["storageState"]>>;

export type ProjectWorkerAuthFixture = {
  authedContext: BrowserContext;
  guestContext: BrowserContext;
};

export type ProjectWorkerAuthWorkerFixture = {
  workerAuthState: StorageStateSnapshot;
};

function isStorageStateSnapshot(value: unknown): value is StorageStateSnapshot {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return Array.isArray(candidate.cookies) && Array.isArray(candidate.origins);
}

async function loadStorageStateFromFile(): Promise<StorageStateSnapshot> {
  const absolutePath = resolve(process.cwd(), AUTH_FILE);
  const rawState = await readFile(absolutePath, "utf8");
  const parsedState: unknown = JSON.parse(rawState);

  if (!isStorageStateSnapshot(parsedState)) {
    throw new Error(`Wrong Storage state at ${absolutePath}`);
  }
  return parsedState;
}

export const auth = base.extend<AuthFixture & ProjectWorkerAuthFixture, ProjectWorkerAuthWorkerFixture>({

  workerAuthState: [
    async ({ }, use, workerInfo) => {
      const snapshot = await loadStorageStateFromFile();
      await use(snapshot);
    },
    { scope: "worker" },
  ],

  authedContext: async ({ browser, workerAuthState }, use, testInfo) => {
    const context = await browser.newContext({
      storageState: workerAuthState,
    });
    try {
      await use(context);
    } finally {
      await context.close();
    }
  },
  guestContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    try {
      await use(context);
    }
    finally {
      await context.close();
    }
  },

  authedPage: async ({ authedContext }, use) => {
    const page = await authedContext.newPage();
    await use(page);
  },

  loginPage: async ({ guestContext }, use) => {
    const page = await guestContext.newPage();
    await use(new CMSLoginPage(page));
  }
});


