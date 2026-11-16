import type { TestFixture } from "@playwright/test";
import type { AppFixture } from "./app.fixture";

export type BrandDataFixture = {
  brandCleanup: string[];
  seededBrand: string;
};

type BrandDataFixtureDefinitions = {
  [Name in keyof BrandDataFixture]: TestFixture<
    BrandDataFixture[Name],
    AppFixture & BrandDataFixture
  >;
};

export const brandDataFixtures: BrandDataFixtureDefinitions = {
  brandCleanup: async ({ brandPage }, use) => {
    const names: string[] = [];
    await use(names);
    for (const name of names) await brandPage.deleteIfExists(name);

  },
  seededBrand: async ({ brandPage, brandCleanup }, use) => {
    await brandPage.goto();
    const name = await brandPage.addNewBrand();
    brandCleanup.push(name);
    await use(name);
  },
};
