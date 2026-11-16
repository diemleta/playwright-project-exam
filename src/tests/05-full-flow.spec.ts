import { test } from "../fixtures/gatekeeper.fixture";
import { allure, allureMeta, EPIC, FEATURE } from "../utils/allure-meta";
import { createFullProduct } from "../data/product/product.factory";
import { createFullCategory } from "../data/category/category.factory";
import { getTestData } from '../data/common/TestDataRepository';
import { CMSLoginPage } from "../pages/CMSLoginPage";
import { CMSDashboardPage } from "../pages/CMSDashboardPage";
import { CMSBrandPage } from "../pages/CMSBrandPage";
import { CMSAddNewCategoryPage } from "../pages/CMSAddNewCategoryPage";
import { CMSAddNewProductPage } from "../pages/CMSAddNewProductPage";
import { CMSCategoryPage } from "../pages/CMSCategoryPage";
import { CMSProductPage } from "../pages/CMSProductPage";

test.use({ storageState: { cookies: [], origins: [] } });

const validCredentials = getTestData('login', 'validCredentials');


test.describe('Full flow data', { tag: ['@product', '@function', '@full'] }, () => {
   let brandName: string;
   let categoryName: string;
   let productName: string;
   test.afterEach(async ({ brandCleanup, categoryCleanup, productCleanup }, testInfo) => {
      testInfo.setTimeout(testInfo.timeout + 30000);

      await allure.step('Clean up data test', async () => {
         if (productName) productCleanup.push(productName);
         if (categoryName) categoryCleanup.push(categoryName);
         if (brandName) brandCleanup.push(brandName);

      });
   });

   test("FULL_TC_01: Verify full flow from login, brand, category, product to view detail product", { tag: '@full' },
      async ({ page }, testInfo) => {
         await allureMeta({
            epic: EPIC.FULL,
            feature: FEATURE.FULL,
            story: "Full flow data",
            id: testInfo.title.split(":")[0],
            severity: allure.Severity.CRITICAL,
            description: "Verify system allows user go from log in step to view product step"
         });

         const loginPage = new CMSLoginPage(page);
         const dashboardPage = new CMSDashboardPage(page);
         const brandPage = new CMSBrandPage(page);
         const categoryPage = new CMSCategoryPage(page);
         const addNewCategoryPage = new CMSAddNewCategoryPage(page);
         const productPage = new CMSProductPage(page);
         const addNewProductPage = new CMSAddNewProductPage(page);


         const { email, password } = validCredentials;
         const category = createFullCategory();
         const product = createFullProduct();


         await allure.step('1. Login to the system', async () => {
            await loginPage.goto();
            await loginPage.expectOnPage();
            await loginPage.login(email, password);
            await loginPage.expectLoggedIn();

         })

         await allure.step('2. Add a new brand successfully', async () => {
            await dashboardPage.navigateMenu("Products", "Brand");
            await brandPage.expectOnPage();
            brandName = await brandPage.addNewBrand();

         })

         await allure.step('3. Add a new category successfully', async () => {
            await dashboardPage.navigateMenu("Products", "Category");
            await categoryPage.clickAddNewCategoryButton();
            await addNewCategoryPage.expectOnPage();
            categoryName = await addNewCategoryPage.addNewFullCategory(category);

         });
         await allure.step('4. Add a new product successfully', async () => {
            await dashboardPage.navigateMenu("Products", "Add New Product");
            await addNewProductPage.expectOnPage();
            productName = await addNewProductPage.addNewFullProduct({ ...product, category: categoryName, brand: brandName });

         });

         await allure.step('5. View detail product and verify the data displayed correctly', async () => {
            await productPage.expectOnPage();
            await productPage.displayProductSuccess({ ...product, name: productName, category: categoryName, brand: brandName });
            const productDetailPage = await productPage.goToProductDetailPage(productName);

            await productDetailPage.expectOnPage();
            await productDetailPage.expectURLContainProductName(productName, product.metaTitle);
            await productDetailPage.expectProductDetailDisplaySuccess({ ...product, name: productName, brand: brandName });
            await productDetailPage.closeProductDetailPage();
            await productPage.backToProductPage();
         });

      });

});


