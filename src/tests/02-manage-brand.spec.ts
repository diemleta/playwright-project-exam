import { test } from "../fixtures/gatekeeper.fixture";
import { allure, allureMeta, EPIC, FEATURE } from "../utils/allure-meta";

test.describe('Manage Brand', { tag: ['@brand', '@function'] }, () => {

   test("BRAND_TC_01: Verify the system adds a new brand successfully", { tag: ['@smoke', '@add'] },
      async ({ brandPage, brandCleanup }, testInfo) => {
         await allureMeta({
            epic: EPIC.CATALOG,
            feature: FEATURE.BRAND,
            story: "Add brand",
            id: testInfo.title.split(":")[0],
            severity: allure.Severity.CRITICAL,
            description: "Verify system allows adding new brand successfully"
         })

         await allure.step('1. Go to brand page', async () => {
            await brandPage.goto();
            await brandPage.expectOnPage();
         })
         const newBrand = await allure.step('2. Input fully brand information and click Save button', async () => {
            const name = await brandPage.addNewBrand();
            brandCleanup.push(name);
            await allure.parameter("New Brand", name);
            return name;
         })

         await allure.step('3. Search brand which was just added', async () => {
            await brandPage.searchTheBrand(newBrand);
         });

         await allure.step('4. Checking brand added successfully', async () => {
            await brandPage.displayBrandSuccess(newBrand);
         });

      });

   test("BRAND_TC_02: Verify if editing an existing brand successfully", { tag: ['@edit'] },
      async ({ brandPage, seededBrand, }, testInfo) => {
         await allureMeta({
            epic: EPIC.CATALOG,
            feature: FEATURE.BRAND,
            story: "Edit brand",
            id: testInfo.title.split(":")[0],
            severity: allure.Severity.NORMAL,
            description: "Verify system allows editing an existing brand successfully"
         })

         await allure.step('1. Go to brand page', async () => {
            await brandPage.goto();
            await brandPage.expectOnPage();
         })
         await allure.step('2. Search the seeded brand', async () => {
            await brandPage.searchTheBrand(seededBrand);
            await brandPage.displayBrandSuccess(seededBrand);

         })
         const editedBrand = await allure.step('3. Edit the brand and save', async () => {
            const name = await brandPage.editTheBrand(seededBrand);
            await allure.parameter("Old Brand", seededBrand);
            await allure.parameter("New Brand", name);
            return name;
         });

         await allure.step('4. Go to the brand page again and search the edited brand', async () => {
            await brandPage.goto();
            await brandPage.searchTheBrand(editedBrand);
         });

         await allure.step('5. Verify the edited brand is displayed', async () => {
            await brandPage.displayBrandSuccess(editedBrand);
         });

      });

   test("BRAND_TC_03: Verify if deleting an existing brand successfully", { tag: ['@delete'] },
      async ({ brandPage, seededBrand }, testInfo) => {
         await allureMeta({
            epic: EPIC.CATALOG,
            feature: FEATURE.BRAND,
            story: "Delete brand",
            id: testInfo.title.split(":")[0],
            severity: allure.Severity.NORMAL,
            description: "Verify system allows deleting an existing brand successfully"
         })

         await allure.step('1. Go to brand page', async () => {
            await brandPage.goto();
            await brandPage.expectOnPage();
         })
         await allure.step('2. Search the seeded brand', async () => {
            await brandPage.searchTheBrand(seededBrand);
            await brandPage.displayBrandSuccess(seededBrand);
            await allure.parameter("Deleted Brand", seededBrand);

         })

         await allure.step('3. Click icon Delete to delete a brand', async () => {
            await brandPage.deleteTheBrand(seededBrand);
         });

         await allure.step('4. Verify the brand no longer exists', async () => {
            await brandPage.searchTheBrand(seededBrand);
            await brandPage.displayNoBrand(seededBrand);
         });

      });


})