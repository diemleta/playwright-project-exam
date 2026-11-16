import { test } from "../fixtures/gatekeeper.fixture";
import { allure, allureMeta, EPIC, FEATURE } from "../utils/allure-meta";
import { createFullProduct, createEditProduct } from "../data/product/product.factory";

test.describe('Manage Product', { tag: ['@product', '@function'] }, () => {

   test("PRODUCT_TC_01: Verify the system adds a new product successfully", { tag: ['@smoke', '@add'] },
      async ({ addNewProductPage, productPage, productCleanup }, testInfo) => {
         await allureMeta({
            epic: EPIC.CATALOG,
            feature: FEATURE.PRODUCT,
            story: "Add product",
            id: testInfo.title.split(":")[0],
            severity: allure.Severity.CRITICAL,
            description: "Verify system allows adding new product successfully"
         })

         const product = createFullProduct();

         await allure.step('1. Go to add new product page', async () => {
            await addNewProductPage.goto();
            await addNewProductPage.expectOnPage();
         })

         await allure.step('2. Input fully product information and click Save button', async () => {
            const name = await addNewProductPage.addNewFullProduct(product);
            await allure.parameter("New Product", name);
            productCleanup.push(name);
         })

         await allure.step('3. Checking product added successfully', async () => {
            await productPage.displayProductSuccess(product);
         });
      })

   test("PRODUCT_TC_02: Verify if editing an existing product successfully", { tag: ['@edit'] },
      async ({ productPage, seededProduct }, testInfo) => {
         await allureMeta({
            epic: EPIC.CATALOG,
            feature: FEATURE.PRODUCT,
            story: "Edit product",
            id: testInfo.title.split(":")[0],
            severity: allure.Severity.NORMAL,
            description: "Verify system allows editing an existing product successfully"
         })

         const editedFullProduct = createEditProduct();

         await allure.step('1. Go to all product page', async () => {
            await productPage.goto();
            await productPage.expectOnPage();
         })
         await allure.step('2. Search the seeded product', async () => {
            await productPage.searchTheProduct(seededProduct.name);
            await productPage.displayProductSuccess(seededProduct);

         })

         const newProductName =
            await allure.step('3. Edit the product and save', async () => {
               const name = await productPage.editTheProduct(seededProduct.name, editedFullProduct);
               await allure.parameter("Old Product", seededProduct.name);
               await allure.parameter("New Product", name);
               return name;
            });

         await allure.step('4. Go to the product page again and search the edited product', async () => {
            await productPage.goto();
            await productPage.searchTheProduct(newProductName);
         });

         await allure.step('5. Verify the edited product is displayed correctly', async () => {
            await productPage.displayProductSuccess({ ...editedFullProduct, name: newProductName });
         });


      });

   test("PRODUCT_TC_03: Verify if deleting an existing product successfully", { tag: ['@delete'] },
      async ({ productPage, seededProduct }, testInfo) => {
         await allureMeta({
            epic: EPIC.CATALOG,
            feature: FEATURE.PRODUCT,
            story: "Delete product",
            id: testInfo.title.split(":")[0],
            severity: allure.Severity.NORMAL,
            description: "Verify system allows delete an existing product successfully"
         })

         await allure.step('1. Go to all product page', async () => {
            await productPage.goto();
            await productPage.expectOnPage();
         })
         await allure.step('2. Search the seeded product', async () => {
            await productPage.searchTheProduct(seededProduct.name);
            await productPage.displayProductSuccess(seededProduct);

         })

         await allure.step('3. Delete the product and save', async () => {
            const name = await productPage.deleteTheProduct(seededProduct.name);
            await allure.parameter("Deleted Product", seededProduct.name);

         });

         await allure.step('4. Go to the product page again and search the deleted product', async () => {
            await productPage.goto();
            await productPage.searchTheProduct(seededProduct.name);
         });

         await allure.step('5. Verify the product no longer exists', async () => {
            await productPage.displayNoProduct(seededProduct.name);
         });

      });

});

