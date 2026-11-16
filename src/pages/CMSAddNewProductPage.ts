import { expect, Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Product } from "../data/product/product.factory";
import { getDateRange } from "../data/common/data.factory";

export class CMSAddNewProductPage extends BasePage {

    private readonly pageLocators = {
        headingText: (page: Page) => page.getByRole("heading", { name: "Add New Product", level: 5 }),
        nameInput: (page: Page) => page.getByPlaceholder("Product Name", { exact: true }),
        categoryDropdown: "#category_id",
        brandDropdown: "#brand_id",
        unitInput: "input[name='unit']",
        weightInput: "input[name='weight']",
        minPurchase: "input[name='min_qty']",
        tagsInput: (page: Page) => page.locator('tags').getByRole('textbox'),
        barcodeInput: "input[name='barcode']",
        galleryImageUpload: "//label[normalize-space(text())='Gallery Images']/following-sibling::div//div[text()='Browse']",
        thumbnailImageUpload: "//label[normalize-space(text())='Thumbnail Image']/following-sibling::div//div[text()='Browse']",
        addFileButton: (page: Page) => page.getByRole("button", { name: "Add Files" }),
        searchInput: (page: Page) => page.getByPlaceholder("Search your files"),
        videoProdiverDropdown: "#video_provider",
        videoLinkInput: "input[name='video_link']",
        colorCheckbox: "input[name='colors_active']",
        colorDropdown: "#colors[name='colors[]']",
        attributeDropdown: "#choice_attributes[name='choice_attributes[]']",
        unitPriceInput: "input[name='unit_price']",
        discountDateRange: (page: Page) => page.getByPlaceholder("Select Date", { exact: true }),
        fromDateText: "td.today:not(.off)",
        toDateText: "div.drp-calendar.right td.available:not(.off)",
        selectButton: (page: Page) => page.getByRole("button", { name: "Select", exact: true }),
        discountInput: "input[name='discount']",
        quantityInput: "input[name='current_stock']",
        descriptionTextArea: "div.note-editable",
        metaTitleInput: (page: Page) => page.getByPlaceholder("Meta Title", { exact: true }),
        metaDescriptionTextArea: "textarea[name='meta_description']",
        metaImageUpload: "//label[normalize-space(text())='Meta Image']/following-sibling::div//div[text()='Choose File']",
        featuredStatusCheckbox: "input[name='featured']~span",
        todaysDealCheckbox: "input[name='todays_deal']~span",
        saveAndPublishButton: (page: Page) => page.getByRole("button", { name: "Save & Publish", exact: true }),
        saveAndUnpublishButton: (page: Page) => page.getByRole("button", { name: "Save & Unpublish", exact: true }),
        loadingIcon: ".fooicon-loader",
    } as const;

    public element = this.createLocatorGetter(this.pageLocators);

    async goto() {
        await this.page.goto("/admin/products/create");

    };

    async expectOnPage(): Promise<void> {
        await expect(this.element("headingText")).toBeVisible();
        await expect(this.page).toHaveURL("/admin/products/create");
    }

    private async chooseDiscountDateRange(): Promise<void> {
        const { startDate, endDate } = getDateRange();
        const dayFrom = String(Number((startDate.split("-"))[2]));
        const dayTo = String(Number(endDate.split("-")[2]));

        await this.element("fromDateText").filter({ has: this.page.getByText(dayFrom, { exact: true }) }).click();
        await this.element("toDateText").filter({ has: this.page.getByText(dayTo, { exact: true }) }).click();
        await this.element("selectButton").click();
    }

    async setCheckboxState(locator: Locator, expectedState: boolean): Promise<void> {
        const currentState = await locator.isChecked();
        if (currentState === expectedState) {
            return;
        }
        if (expectedState) {
            await locator.check();
        } else {
            await locator.uncheck();
        }
    }

    async fillProductInformation(product: Product): Promise<void> {
        await this.element("nameInput").fill(product.name);
        await this.element("categoryDropdown").selectOption({ label: product.category });
        await this.element("brandDropdown").selectOption({ label: product.brand });
        await this.element("unitInput").fill(product.unit);
        await this.element("weightInput").fill(String(product.weight));
        await this.element("minPurchase").fill(String(product.minPurchase));
        await this.element("barcodeInput").fill(product.barcode);
        await this.element("galleryImageUpload").click();
        await this.uploadImageByTitle(product.galleryImage);
        await this.element("thumbnailImageUpload").click();
        await this.uploadImageByTitle(product.thumbnailImage);
        await this.element("unitPriceInput").fill(String(product.unitPrice));
        await this.element("discountDateRange").click();
        await this.chooseDiscountDateRange();
        await this.element("discountInput").fill(String(product.discount));
        await this.element("quantityInput").fill(String(product.quantity));
        await this.element("descriptionTextArea").fill(product.productDescription);
        await this.element("metaTitleInput").fill(product.metaTitle);
        await this.element("metaDescriptionTextArea").fill(product.metaDescription);
        await this.setCheckboxState(this.element("featuredStatusCheckbox"), product.featured);
        await this.setCheckboxState(this.element("todaysDealCheckbox"), product.todaysDeal);

        await this.element("tagsInput").fill(product.tags);
        await this.element("tagsInput").press("Enter");

    };
    async addNewFullProduct(product: Product): Promise<string> {
        await this.fillProductInformation(product);
        if (product.published === true) {
            await this.element("saveAndPublishButton").click();
            await expect(this.element("saveAndPublishButton")).toBeHidden();
        }
        else {
            await this.element("saveAndUnpublishButton").click();
            await expect(this.element("saveAndUnpublishButton")).toBeHidden();
        }
        return product.name;
    }
}
