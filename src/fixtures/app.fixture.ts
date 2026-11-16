import type {TestFixture } from "@playwright/test";
import { CMSDashboardPage } from "../pages/CMSDashboardPage";
import { CMSBrandPage } from "../pages/CMSBrandPage";
import { CMSCategoryPage } from "../pages/CMSCategoryPage";
import {CMSAddNewCategoryPage} from "../pages/CMSAddNewCategoryPage";
import {CMSProductPage} from "../pages/CMSProductPage";
import { CMSAddNewProductPage } from "../pages/CMSAddNewProductPage";


import type { AuthFixture } from "./auth.fixture";
export type AppFixture = {
  dashboardPage: CMSDashboardPage;
  brandPage: CMSBrandPage;
  categoryPage: CMSCategoryPage;
  addNewCategoryPage: CMSAddNewCategoryPage;
  productPage: CMSProductPage;
  addNewProductPage: CMSAddNewProductPage;

};

type AppFixtureDefinitions = {
  [FixtureName in keyof AppFixture]: TestFixture<
    AppFixture[FixtureName],
    AuthFixture
  >;
};

export const appFixtures: AppFixtureDefinitions = {
  dashboardPage: async ({ authedPage }, use) => {
    await use(new CMSDashboardPage(authedPage));
  },
  brandPage: async ({ authedPage }, use) => {
    await use(new CMSBrandPage(authedPage));
  },
  categoryPage: async ({authedPage}, use) => {
    await use(new CMSCategoryPage(authedPage));
  },
  addNewCategoryPage: async ({authedPage}, use) => {
    await use(new CMSAddNewCategoryPage(authedPage));
  },
  productPage: async ({authedPage}, use) => {
    await use(new CMSProductPage(authedPage));
  },
  addNewProductPage: async ({authedPage}, use) => {
    await use(new CMSAddNewProductPage(authedPage));
  }
  
};
