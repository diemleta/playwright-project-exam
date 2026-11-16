import { expect, Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { buildColumnMap, readCellText } from "../utils/table.helper";
import { Product } from "../data/product/product.factory";
import { CMSAddNewProductPage } from "./CMSAddNewProductPage";
import { CMSViewProductPage } from "./CMSViewProductPage";

export class CMSProductPage extends BasePage {

    private readonly pageLocators = {
        headingText: (page: Page) => page.getByRole("heading", { name: "All products", level: 1 }),
        editHeadingText: (page: Page) => page.getByRole("heading", { name: "Edit Product", exact: true }),
        tableHeader: ".footable-header th",
        thumbnailImg: "div.col-auto img",
        todaysDealCheckbox: "input[onchange='update_todays_deal(this)']",
        pushlishedCheckbox: "input[onchange='update_published(this)']",
        featuredCheckbox: "input[onchange='update_featured(this)']",
        updateProductButton: (page: Page) => page.getByRole("button", { name: "Update Product", exact: true }),
    } as const;

    private element = this.createLocatorGetter(this.pageLocators);

    async goto() {
        await this.page.goto("/admin/products/admin");
    };

    async expectOnPage(): Promise<void> {
        await expect(this.element("headingText")).toBeVisible();
        await expect(this.page).toHaveURL("/admin/products/admin");
    }

    async searchTheProduct(name: string): Promise<void> {
        await this.searchTheData(name);
        await this.waitLoadingIconDisappear();

    }

    async verifyDisplayedThumbnailByName(name: string): Promise<void> {
        const item = this.rowByName(name).locator(this.element("thumbnailImg")).nth(0);
        await expect.soft(item).toBeVisible();
        const source = await item.getAttribute("src");
        expect.soft(source).not.toContain("public/assets/img/placeholder.jpg");
    }

    async verifyDisplayedNameByName(name: string, index: number): Promise<void> {
        const item = await readCellText(this.rowByName(name), index);
        expect.soft(item).toBe(name);
    }

    async verifyDisplayedInfoByName(name: string, price: number, index: number): Promise<void> {
        //const basePrice = `Base Price: $${String(price)}.00`;
        const basePrice = `Base Price: $${price.toFixed(2)}`;
        const item = await readCellText(this.rowByName(name), index);
        expect.soft(item).toContain(basePrice);
        expect.soft(item).toContain("Num of Sale: 0 Times");
        expect.soft(item).toContain("Rating: 0");

    }

    async verifyDisplayedStockByName(name: string, stock: number, index: number): Promise<void> {
        const item = await readCellText(this.rowByName(name), index);
        expect.soft(item).toBe(String(stock));
    }

    async verifyDisplayedTodaysDealByName(name: string, status: boolean): Promise<void> {
        const deal = this.rowByName(name).locator(this.element("todaysDealCheckbox"));
        await expect.soft(deal).toBeAttached();
        await expect.soft(deal).toBeChecked({ checked: status });
    }

    async verifyDisplayedPublishedByName(name: string, status: boolean): Promise<void> {
        const published = this.rowByName(name).locator(this.element("pushlishedCheckbox"));
        await expect.soft(published).toBeAttached();
        await expect.soft(published).toBeChecked({ checked: status });

    }

    async verifyDisplayedFeaturedByName(name: string, status: boolean): Promise<void> {
        const featured = this.rowByName(name).locator(this.element("featuredCheckbox"));
        await expect.soft(featured).toBeAttached();
        await expect.soft(featured).toBeChecked({ checked: status });

    }

    async verifyDisplayedOptions(name: string): Promise<void> {
        const options = this.rowByName(name).locator("a.btn-icon");
        await expect.soft(options).toHaveCount(4);
        await expect.soft(this.iconByName(name, "View")).toBeEnabled();
        await expect.soft(this.iconByName(name, "Edit")).toBeEnabled();
        await expect.soft(this.iconByName(name, "Duplicate")).toBeEnabled();
        await expect.soft(this.iconByName(name, "Delete")).toBeEnabled();

    }

    async displayProductSuccess(product: Product): Promise<void> {
        await this.waitLoadingIconDisappear();
        await expect.soft(this.page).toHaveURL(/admin\/products\/admin/);
        const cntRow = await this.rowByName(product.name).count();
        expect.soft(cntRow).toBeGreaterThanOrEqual(1);

        const columnHeader = await buildColumnMap(this.element("tableHeader"));
        for (const column in columnHeader) {
            const key = column as keyof typeof columnHeader;
            if (key === "name") {
                await this.verifyDisplayedThumbnailByName(product.name);
                await this.verifyDisplayedNameByName(product.name, columnHeader[key]);
            }
            else if (key === "info") {
                await this.verifyDisplayedInfoByName(product.name, product.unitPrice, columnHeader[key]);
            }
            else if (key === "totalStock") {
                await this.verifyDisplayedStockByName(product.name, product.quantity, columnHeader[key]);
            }
            else if (key === "todaysDeal") {
                await this.verifyDisplayedTodaysDealByName(product.name, product.todaysDeal);
            }
            else if (key === "published") {
                await this.verifyDisplayedPublishedByName(product.name, product.published);
            }
            else if (key === "featured") {
                await this.verifyDisplayedFeaturedByName(product.name, product.featured);
            }
            else if (key === "options") {
                await this.verifyDisplayedOptions(product.name);
            }
        }
    }

    async editTheProduct(oldProductName: string, product: Product): Promise<string> {
        const editedProductName = `${oldProductName}_edit`;
        await this.iconByName(oldProductName, "Edit").click();
        await expect(this.element("editHeadingText")).toBeVisible();

        const editProductPage = new CMSAddNewProductPage(this.page);
        await editProductPage.fillProductInformation({ ...product, name: editedProductName });
        await this.element("updateProductButton").click();
        await Promise.all([
            expect(editProductPage.element("nameInput")).toHaveAttribute('value',editedProductName),
            this.page.waitForEvent("load"),
        ])
    
        return editedProductName;
    }


    async deleteTheProduct(name: string): Promise<void> {
        await this.deleteTheData(name);
        await this.waitLoadingIconDisappear();
    }

    async displayNoProduct(name: string): Promise<void> {
        await this.displayNoData(name);
    }

    async deleteIfExists(name: string): Promise<void> {
        await this.goto();
        await this.searchTheProduct(name);
        if (await this.rowByName(name).count() > 0) {
            await this.deleteTheProduct(name);
        }
    }

    async goToProductDetailPage(name: string): Promise<CMSViewProductPage> {

        const [productDetail] = await Promise.all([
            this.page.context().waitForEvent("page", { timeout: 20000 }),
            this.iconByName(name, "View").click(),
        ])
        await productDetail.waitForLoadState('domcontentloaded');
        return new CMSViewProductPage(productDetail);
    }

    async backToProductPage(): Promise<void> {
        await this.page.bringToFront();

    }



}
