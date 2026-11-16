import { Locator, Page } from "@playwright/test";

export class SidebarMenu {

    private readonly sidebar: Locator;
    private readonly mainMenu: Locator;
    private readonly subMenu: Locator;
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
        this.sidebar = page.locator("#main-menu.metismenu");
        this.mainMenu = this.sidebar.locator(">li");
        this.subMenu = this.sidebar.locator(">li.mm-active ul.mm-show span");
    }

    private getMainMenuItemByText(text: string): Locator {
        return this.mainMenu.filter({ has: this.page.locator(">a>span", { hasText: text }) });
    }

    private getSubMenuItemByText(text: string): Locator {
        return this.subMenu.filter({ hasText: text });
    }

    async isMainMenuCollapsed(mainMenu: string): Promise<boolean> {
        const specificMainMenu = this.mainMenu.locator(">a", { hasText: mainMenu });    
        const submenuLocator = specificMainMenu.locator("~ul span").first();     
        const isSubMenuVisible = await submenuLocator.isVisible();
        
        return !(isSubMenuVisible);

    }

    async clickMainMenuItem(menuText: string): Promise<void> {
        const menuItem = this.getMainMenuItemByText(menuText);
        const status = await this.isMainMenuCollapsed(menuText);   
        if (status === true) {
            await menuItem.click();
        }
    }

    async clickSubMenuItem(menuText: string): Promise<void> {
        const menuItem = this.getSubMenuItemByText(menuText);
        await menuItem.click();
    }
}