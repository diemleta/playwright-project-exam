import productData from "../product/product-data.json";
import { generateProductName } from "../common/data.factory";

export type Product = {
    name: string,
    category: string,
    brand: string,
    unit: string,
    weight: number,
    minPurchase: number,
    tags: string,
    barcode: string,
    galleryImage: string,
    thumbnailImage: string,
    videoProvider: string,
    videoLink: string,
    colors: string,
    attributes: string,
    unitPrice: number,
    discount: number,
    quantity: number,
    productDescription: string,
    metaTitle: string,
    metaDescription: string,
    metaImage: string,
    featured: boolean,
    todaysDeal: boolean,
    published: boolean
}

export function createMinimalProduct() {
    return {
        ...productData.minimalProduct.data,
        name: generateProductName(),
    };
}

export function createFullProduct(): Product {
    return {
        ...productData.fullProduct.data[0],
        name: generateProductName(),
    };
}

export function createEditProduct(): Product {
    return {... productData.fullProduct.data[1]};
}
