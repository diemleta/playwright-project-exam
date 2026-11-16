import { expect, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";

export class CMSLoginPage extends BasePage {

  private readonly pageLocators = {
    usernameInput: (page: Page) => page.getByRole("textbox", { name: "Email" }),
    passwordInput: (page: Page) => page.getByRole("textbox", { name: "Password" }),
    loginButton: (page: Page) => page.getByRole("button", { name: "Login" }),
    headingText: (page: Page) => page.getByRole("heading", { name: "Welcome to Active eCommerce CMS", level: 1 }),
    errorNotification: '.aiz-notify [data-notify="message"]',
    emailError: '#email + .invalid-feedback',
    emailInvalid: 'input[type="email"]:invalid',
    passwordError: '#password + .invalid-feedback',

  } as const;

  public element = this.createLocatorGetter(this.pageLocators);


  async goto() {
    await this.page.goto("/login", { timeout: 20000 });
  }

  async expectOnPage(): Promise<void> {
    await expect(this.page).toHaveURL(/login$/);
    await expect(this.element("headingText")).toContainText("eCommerce CMS");
    await expect(this.element("usernameInput")).toBeVisible();

  }

  async login(username: string, password: string) {
    await this.fillWithLog(this.element("usernameInput"), username);
    await this.fillWithLog(this.element("passwordInput"), password, { isSensitive: true });
    await this.element("loginButton").click();
  }

  async expectLoggedIn() {
    await this.page.waitForURL(/\/admin(?!\/login)/);
    await expect(this.page).toHaveURL(/\/admin/);
  }

  async expectErrorNotification(expectedText: string) {
    const notification = this.element('errorNotification');
    await expect(notification).toBeVisible({ timeout: 15000 });
    await expect(notification).toContainText(expectedText);
  }

  async expectStillOnLoginPage() {
    await expect(this.page).toHaveURL(/\/login/);
  }

  async detectedWrongEmailFormat() {
    await expect(this.element("emailInvalid")).toBeVisible();
    await expect(this.element("errorNotification")).toBeHidden();
    await expect(this.page).toHaveURL(/\/login/);
    await this.element("emailInvalid").blur();
  }

}