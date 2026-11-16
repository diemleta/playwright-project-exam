import { expect, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { generateBrandName } from "../data/common/data.factory";

export class CMSBrandPage extends BasePage {

    private readonly pageLocators = {
        headingText: (page: Page) => page.getByRole("heading", { name: "All Brands", level: 1 }),
        addNewHeadingText: (page: Page) => page.getByRole("heading", { name: "Add New Brand", level: 5 }),
        nameInput: (page: Page) => page.getByRole("textbox", { name: "Name", exact: true }),
        logoUpload: "//label[normalize-space(text())='Logo']/following-sibling::div//div[text()='Browse']",
        metaTitleInput: (page: Page) => page.getByPlaceholder("Meta Title", { exact: true }),
        metaDescriptionInput: "textarea[name='meta_description']",
        saveButton: (page: Page) => page.getByRole("button", { name: "Save" }),
        editHeadingText: (page: Page) => page.getByRole("heading", { name: "Brand Information" }),
        nameEditInput: "#name",
        fileAmountText: "div.file-amount"

    } as const;

    public element = this.createLocatorGetter(this.pageLocators);

    async goto() {
        await this.page.goto("/admin/brands");
    };

    async expectOnPage(): Promise<void> {
        await expect(this.page).toHaveURL("/admin/brands");
        await expect(this.element("addNewHeadingText")).toBeVisible();
        await expect(this.element("saveButton")).toBeEnabled();
    }

    async addNewBrand(): Promise<string> {
        const brandName = generateBrandName();
        await this.element("nameInput").fill(brandName);
        await this.element("logoUpload").click();
        await this.uploadImageByTitle("gau1.jpg");
        await this.element("saveButton").click();
        await this.waitLoadingIconDisappear();
        await expect(this.element("fileAmountText")).toContainText('Choose File');
        return brandName;
    }

    async searchTheBrand(name: string): Promise<void> {
        await this.searchTheData(name);

    }

    async displayBrandSuccess(name: string): Promise<void> {

        await expect.soft(this.rowByName(name)).toHaveCount(1);
        await expect.soft(this.rowByName(name)).toContainText(name);

        const item = this.rowByName(name).locator(">td>img").nth(0);
        await expect.soft(item).toBeVisible();
        const source = await item.getAttribute("src");
        expect.soft(source).not.toContain("public/assets/img/placeholder.jpg");

        const options = this.rowByName(name).locator("a.btn-icon");
        await expect.soft(options).toHaveCount(2);
        await expect.soft(this.iconByName(name, "Edit")).toBeEnabled();
        await expect.soft(this.iconByName(name, "Delete")).toBeEnabled();

    }

    async displayNoBrand(name: string): Promise<void> {
        await this.displayNoData(name);

    }

    async editTheBrand(name: string): Promise<string> {
        const editBrand = `${name}_edit`
        await this.iconByName(name, "Edit").click();
        await expect(this.element("editHeadingText")).toBeVisible();
        await this.element("nameEditInput").fill(editBrand);

        await Promise.all([
            this.page.waitForEvent("load"),
            this.element("saveButton").click(),
        ])
        await this.waitLoadingIconDisappear();
        return editBrand;

    };

    async deleteTheBrand(name: string): Promise<void> {
        await this.deleteTheData(name);
        await this.waitLoadingIconDisappear();
    }

    async deleteIfExists(name: string): Promise<void> {
        await this.goto();
        await this.searchTheBrand(name);
        if (await this.rowByName(name).count() > 0) {
            await this.deleteTheBrand(name);
        }
    }

}
