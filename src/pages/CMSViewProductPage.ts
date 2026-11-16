import { expect, type Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { Product } from "../data/product/product.factory";

export class CMSViewProductPage extends BasePage {

    private readonly pageLocators = {
        closeBannerButton: "button[data-key='website-popup']",
        headingText: "div.text-left>h1",
        ratingText: ".rating~span",
        ratingStar: "span.rating>i",
        soldByText: "div.align-items-center div.col-auto",
        priceLabel: (page: Page) => page.getByText("Price:", { exact: true }),
        priceValue: "#order_details~section div.row del",
        discountPriceLabel: (page: Page) => page.getByText("Discount Price:", { exact: true }),
        discountPriceValue: "#order_details~section div.row strong:not(#chosen_price)",
        discountPriceUnit: "#order_details~section div.row strong~span",
        quantityLabel: (page: Page) => page.getByText("Quantity:", { exact: true }),
        quantityValue: "input[name='quantity']",
        quantityAvailableValue: "div.avialable-amount",
        totalPriceLabel: (page: Page) => page.getByText("Total Price:", { exact: true }),
        totalPriceValue: "strong#chosen_price",
        imgThumbnail: (page: Page) => page.getByRole('img').nth(4),
        zoomThumbnail: ".zoomImg",
        imgBrand: "img[alt='brandName']",
        descriptionText: "#tab_default_1 .p-4>div",

    } as const;

    private element = this.createLocatorGetter(this.pageLocators);

    async expectOnPage(): Promise<void> {
        await expect(this.page).toHaveURL(/\/product\/[a-z0-9-]+$/);
        await expect(this.element("headingText")).toBeVisible();

    }

    async expectURLContainProductName(name: string, title: string): Promise<void> {
        const productName = name.replaceAll("_", "-").toLowerCase();
        await expect(this.page).toHaveURL(`/product/${productName}`);
        await expect(this.page).toHaveTitle(title);
    }

    async expectProductDetailDisplaySuccess(product: Product): Promise<void> {

        const closeBanner = this.element("closeBannerButton");
        await this.page.addLocatorHandler(closeBanner, async (closeButton) => {
            await closeButton.click();
        })

        await expect.soft(this.element("headingText")).toContainText(product.name);
        await expect.soft(this.element("ratingStar")).toHaveCount(5);
        await expect.soft(this.element("ratingText")).toContainText("(0 reviews)");
        const soldBy = this.element("soldByText").filter({ hasText: /Sold by:\s*Inhouse product/ });
        await expect.soft(soldBy).toBeVisible();
        const locatorImgSoldBy = this.pageLocators.imgBrand.replace("brandName", product.brand);
        await expect.soft(this.page.locator(locatorImgSoldBy)).toBeVisible();
        await expect.soft(this.element("priceLabel")).toBeVisible();
        const originPrice = await this.element("priceValue").innerText();
        const finalPrice = originPrice.replace(/\s+/g, '');
        expect.soft(finalPrice).toBe(`$${product.unitPrice.toFixed(2)}/${product.unit}`);

        await expect.soft(this.element("discountPriceLabel")).toBeVisible();
        const originDisPrice = await this.element("discountPriceValue").innerText();
        const originDisUnit = await this.element("discountPriceUnit").textContent();
        const finalDisPrice = originDisPrice.replace(/\s+/g, '') + ' ' + originDisUnit;
        const expectedDisPrice = '$' + (product.unitPrice - product.discount).toFixed(2) + ' /' + product.unit;
        expect.soft(finalDisPrice).toBe(expectedDisPrice);

        await expect.soft(this.element("quantityLabel")).toBeVisible();
        const quantity = await this.element("quantityValue").getAttribute("value");
        expect.soft(Number(quantity)).toBe(1);

        const originQuantityAvailable = await this.element("quantityAvailableValue").innerText();
        const expectQuantityAvailable = `(${String(product.quantity)} available)`;
        expect.soft(originQuantityAvailable).toBe(expectQuantityAvailable);

        await expect.soft(this.element("totalPriceLabel")).toBeVisible();
        const originalTotalPrice = ((product.unitPrice - product.discount) * Number(quantity)).toFixed(2);
        const totalPriceExpect = `$${originalTotalPrice}`;
        const totalPriceValue = await this.element("totalPriceValue").textContent();
        expect.soft(totalPriceValue).toBe(totalPriceExpect);

        const actualDescriptionText = await this.element("descriptionText").innerText();
        expect.soft(actualDescriptionText).toBe(product.productDescription);

        await expect.soft(this.element("imgThumbnail")).toBeVisible();
        await expect.soft(this.element("zoomThumbnail")).toBeVisible();

        await this.page.removeLocatorHandler(closeBanner);

    }

    async closeProductDetailPage() {
        await this.page.close();
    }

}
