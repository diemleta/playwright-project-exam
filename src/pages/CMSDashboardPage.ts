import { expect, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { SidebarMenu } from "../components/SidebarMenu";

export class CMSDashboardPage extends BasePage {

    private readonly pageLocators = {
        h6StockText: (page: Page) => page.getByRole("heading", { name: "Category wise product stock", level: 6 }),
        h6SaleText: (page: Page) => page.getByRole("heading", { name: "Category wise product sale", level: 6 }),

    } as const;

    public element = this.createLocatorGetter(this.pageLocators);

    readonly sidebarMenu = new SidebarMenu(this.page);

    async goto() {
        await this.page.goto("/admin");
    };

    async expectOnPage(): Promise<void> {
        await expect(this.element("h6StockText")).toBeVisible();
        await expect(this.element("h6SaleText")).toBeVisible();
    }

    async navigateMenu(mainMenu: string, subMenu: string): Promise<void> {
        await this.sidebarMenu.clickMainMenuItem(mainMenu);
        await this.sidebarMenu.clickSubMenuItem(subMenu);
    }

}
