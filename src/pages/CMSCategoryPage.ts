import { expect, Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { buildColumnMap, readCellText } from "../utils/table.helper";
import { Category } from "../data/category/category.factory";
import { CMSAddNewCategoryPage } from "./CMSAddNewCategoryPage";

export class CMSCategoryPage extends BasePage {

    private readonly pageLocators = {
        headingText: (page: Page) => page.getByRole("heading", { name: "All categories", level: 1 }),
        headingTextEditCategory: (page: Page) => page.getByRole("heading", { name: "Category Information", level: 5 }),
        addNewCategoryButton: (page: Page) => page.getByRole("link", { name: "Add New category" }),
        nameInput: "#name",
        saveButton: (page: Page) => page.getByRole("button", { name: "Save" }),
        tableHeader: ".footable-header th",
        featuredCheckbox: "input[onchange='update_featured(this)']",
    } as const;

    public element = this.createLocatorGetter(this.pageLocators);

    async goto() {
        await this.page.goto("/admin/categories");

    };

    async expectOnPage(): Promise<void> {
        await expect(this.element("headingText")).toBeVisible();
        await expect(this.page).toHaveURL("/admin/categories");
        await this.waitLoadingIconDisappear();
    }

    async searchTheCategory(name: string): Promise<void> {
        await this.searchTheData(name);
        await this.waitLoadingIconDisappear();
    }

    async displayCategorySuccess(category: Category): Promise<void> {
        const cntRow = await this.rowByName(category.name).count();
        expect.soft(cntRow).toBeGreaterThanOrEqual(1);

        const columnHeader = await buildColumnMap(this.element("tableHeader"));

        for (const column in columnHeader) {
            const key = column as keyof typeof columnHeader;

            if (key === "name") {
                const item = await readCellText(this.rowByName(category.name), columnHeader[key]);
                expect.soft(item).toBe(category.name);

            }
            else if (key === "parentCategory") {
                const item = await readCellText(this.rowByName(category.name), columnHeader[key]);
                const expectedParentCategory = ((category.parentCategory)?.split("--").at(-1))?.trim();
                expect.soft(item).toBe(expectedParentCategory);

            }
            else if (key === "orderLevel") {
                const item = await readCellText(this.rowByName(category.name), columnHeader[key]);
                expect.soft(item).toBe(category.orderingNumber || '');

            }
            else if (key === "level") {
                const item = await readCellText(this.rowByName(category.name), columnHeader[key]);
                let expectedLevel: string;
                if (category.parentCategory === "No Parent") {
                    expectedLevel = '0';
                }
                else {
                    expectedLevel = String((category.parentCategory || '').split("--").length);
                }

                expect.soft(item).toBe(expectedLevel);

            }
            else if (key === "banner") {
                const item = await readCellText(this.rowByName(category.name), columnHeader[key]);
                expect.soft(item).not.toBe('-');
                const img = this.rowByName(category.name).locator(">td>img");
                await expect.soft(img).toHaveClass("h-50px");
                await expect.soft(img).toHaveAttribute('alt', 'Banner');

            }

            else if (key === "icon") {
                const item = await readCellText(this.rowByName(category.name), columnHeader[key]);
                expect.soft(item).not.toBe('-');
                const img = this.rowByName(category.name).locator(">td>span>img");
                await expect.soft(img).not.toHaveClass("h-50px");
                await expect.soft(img).toHaveAttribute('alt', 'Icon');

            }
            else if (key === "featured") {
                const featured = this.rowByName(category.name).locator(this.element("featuredCheckbox"));
                await expect.soft(featured).toBeAttached();
                await expect.soft(featured).toBeChecked({ checked: false });

            }
            else if (key === "commission") {
                const item = await readCellText(this.rowByName(category.name), columnHeader[key]);
                expect.soft(item).toBe('0 %');

            }
            else {
                const options = this.rowByName(category.name).locator("a.btn-icon");
                await expect(options).toHaveCount(2);
                await expect(this.iconByName(category.name, "Edit")).toBeEnabled();
                await expect(this.iconByName(category.name, "Delete")).toBeEnabled();
            }
        };
    }

    async editTheCategory(oldName: string, category: Category): Promise<void> {
        await this.iconByName(oldName, "Edit").click();
        await expect(this.element("headingTextEditCategory")).toBeVisible();
        const editCategoryPage = new CMSAddNewCategoryPage(this.page);
        await editCategoryPage.fillCategoryInformation(category);

        await Promise.all([
            this.page.waitForEvent("load"),
            this.element("saveButton").click()
        ])
    }


    async deleteTheCategory(name: string): Promise<void> {
        await this.deleteTheData(name);
        await this.waitLoadingIconDisappear();
    }

    async displayNoCategory(name: string): Promise<void> {
        await this.displayNoData(name);
    }

    async deleteIfExists(name: string): Promise<void> {
        await this.goto();
        await this.searchTheCategory(name);
        if (await this.rowByName(name).count() > 0) {
            await this.deleteTheCategory(name);
        }
    }

    async clickAddNewCategoryButton(): Promise<void> {
        await this.element("addNewCategoryButton").click();
    }

}
