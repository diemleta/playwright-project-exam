import path from "path";
import fs from "fs";
import { test as setup, expect } from "@playwright/test";
import { CMSLoginPage } from "../pages/CMSLoginPage";

export const ADMIN_AUTH_FILE = path.resolve(__dirname, "../../.auth/admin.json");
const DEFAULT_AUTH_CACHE_TTL_MS =
  Number(process.env.AUTH_CACHE_TTL_MS) || 2 * 60 * 60 * 1000;

function isAuthFileValid(
  filePath: string,
  maxAgeMs = DEFAULT_AUTH_CACHE_TTL_MS,
): boolean {
  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    return false;
  }

  try {
    const stats = fs.statSync(absolutePath);
    const fileAgeMs = Date.now() - stats.mtimeMs;

    if (fileAgeMs > maxAgeMs) {
      console.log(
        `🟡 [PROJECT SETUP] Snapshot ${filePath} was over ${Math.round(fileAgeMs / 60000)} minutes (greater than ${Math.round(maxAgeMs / 60000)} minutes) -> Login again to renew!`,
      );
      return false;
    }

    const content = JSON.parse(fs.readFileSync(absolutePath, "utf-8"));
    const nowInSeconds = Date.now() / 1000;
    const sessionCookie = content.cookies?.find(
      (c: { name: string; expires?: number }) =>
        c.name === "XSRF-TOKEN" || c.name === "active_ecommerce_cms_session",
    );

    if (sessionCookie && sessionCookie.expires && sessionCookie.expires > 0) {
      if (sessionCookie.expires < nowInSeconds) {
        console.log(
          `🟡 [PROJECT SETUP] Cookie [${sessionCookie.name}] was expired -> Login again!`,
        );
        return false;
      }
    }

    return true;
  } catch (error) {
    console.warn("⚠️ [PROJECT SETUP WARNING] File snapshot has invalid format, will login again:", error);
    return false;
  }
}

setup("Setup: Authentication Admin và  Session Storage State", async ({
  page,
}) => {
  if (isAuthFileValid(ADMIN_AUTH_FILE)) {
    return;
  }

  const adminUsername = process.env.CMS_ADMIN_USERNAME;
  const adminPassword = process.env.CMS_ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    throw new Error(
      "❌ ERROR SETUP: Not set up CMS_ADMIN_USERNAME or CMS_ADMIN_PASSWORD in .env or .env.local!",
    );
  }

  const loginPage = new CMSLoginPage(page);
  await loginPage.goto();
  await loginPage.expectOnPage();
  await loginPage.login(adminUsername, adminPassword);

  await expect(page).toHaveURL(/admin$/);
  await expect(page.getByRole("link", { name: " Clear Cache" })).toBeVisible();

  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});
