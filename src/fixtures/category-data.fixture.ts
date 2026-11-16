import type { TestFixture } from "@playwright/test";
import type { AppFixture } from "./app.fixture";
import { Category, createFullCategory } from "../data/category/category.factory";

export type CategoryDataFixture = {
  categoryCleanup: string[];
  seededCategory: Category;

};

type CategoryDataFixtureDefinitions = {
  [Name in keyof CategoryDataFixture]: TestFixture<
    CategoryDataFixture[Name],
    AppFixture & CategoryDataFixture
  >;
};

export const categoryDataFixtures: CategoryDataFixtureDefinitions = {
  categoryCleanup: async ({ categoryPage }, use) => {
    const names: string[] = [];
    await use(names);
    for (const name of names) await categoryPage.deleteIfExists(name);

  },

  seededCategory: async ({ addNewCategoryPage, categoryCleanup }, use) => {
    const category = createFullCategory();
    await addNewCategoryPage.goto();
    const name = await addNewCategoryPage.addNewFullCategory(category);
    categoryCleanup.push(name);
    await use(category);
  },

};
