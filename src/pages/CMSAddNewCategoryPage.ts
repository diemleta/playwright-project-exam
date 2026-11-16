import { expect, Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Category } from "../data/category/category.factory";


export class CMSAddNewCategoryPage extends BasePage {

    private readonly pageLocators = {
        headingText: (page: Page) => page.getByRole("heading", { name: "Category Information", level: 5 }),
        nameInput: "#name",
        parentCategoryDropdown: "select[name='parent_id']",
        orderingNumberInput: "#order_level",
        typeDropdown: "select[name='digital']",
        bannerUpload: "//label[normalize-space(text())='Banner']/following-sibling::div//div[text()='Browse']",
        iconUpload: "//label[normalize-space(text())='Icon']/following-sibling::div//div[text()='Browse']",
        metaTitleInput: (page: Page) => page.getByPlaceholder("Meta Title"),
        metaDescriptionInput: "textarea[name='meta_description']",
        filterAttributeDropdown: "select[name='filtering_attributes[]']",
        saveButton: (page: Page) => page.getByRole("button", { name: "Save" }),

    } as const;

    public element = this.createLocatorGetter(this.pageLocators);

    async goto() {
        await this.page.goto("/admin/categories/create");

    };

    async expectOnPage(): Promise<void> {
        await expect(this.element("headingText")).toBeVisible();
        await expect(this.page).toHaveURL("/admin/categories/create");
    }

    async fillCategoryInformation(category: Category): Promise<void> {

        await this.element("nameInput").fill(category.name);
        await this.element("parentCategoryDropdown").selectOption({ label: category.parentCategory });
        await this.element("orderingNumberInput").fill(category.orderingNumber ?? "0");
        await this.element("bannerUpload").click();
        await this.uploadImageByTitle(category.banner ?? "candy02.png");
        await this.element("iconUpload").click();
        await this.uploadImageByTitle(category.icon ?? "candy01");
        await this.element("metaTitleInput").fill(category.metaTitle ?? "");
        await this.element("metaDescriptionInput").fill(category.metaDescription ?? "");
        await this.element("filterAttributeDropdown").selectOption({ label: category.filteringAttributes });
    }

    async addNewFullCategory(category: Category): Promise<string> {
        await this.fillCategoryInformation(category);
        await this.element("saveButton").click();
        await this.waitLoadingIconDisappear();
        await expect(this.page).toHaveURL(/categories$/);
        return `-- ${category.name}`;
    }
}
