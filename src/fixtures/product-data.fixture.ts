import type { TestFixture } from "@playwright/test";
import type { AppFixture } from "./app.fixture";
import { createFullProduct, Product } from "../data/product/product.factory";

export type ProductDataFixture = {
  productCleanup: string[];
  seededProduct: Product;
};

type ProductDataFixtureDefinitions = {
  [Name in keyof ProductDataFixture]: TestFixture<
    ProductDataFixture[Name],
    AppFixture & ProductDataFixture
  >;
};

export const productDataFixtures: ProductDataFixtureDefinitions = {
  productCleanup: async ({ productPage }, use) => {
    const names: string[] = [];
    await use(names);
    for (const name of names) await productPage.deleteIfExists(name);

  },

  seededProduct: async ({ addNewProductPage, productCleanup }, use) => {
    const product = createFullProduct();
    await addNewProductPage.goto();
    const name = await addNewProductPage.addNewFullProduct(product);
    productCleanup.push(name);
    await use(product);
  },

};
