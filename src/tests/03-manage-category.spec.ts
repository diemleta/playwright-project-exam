import { test } from "../fixtures/gatekeeper.fixture";
import { allure, allureMeta, EPIC, FEATURE } from "../utils/allure-meta";
import { createFullCategory, createEditCategory } from "../data/category/category.factory";

test.describe('Manage Category', { tag: ['@category', '@function'] }, () => {

   test("CATEGORY_TC_01: Verify the system adds a new category successfully", { tag: ['@smoke', '@add'] },
      async ({ addNewCategoryPage, categoryPage, categoryCleanup }, testInfo) => {
         await allureMeta({
            epic: EPIC.CATALOG,
            feature: FEATURE.CATEGORY,
            story: "Add category",
            id: testInfo.title.split(":")[0],
            severity: allure.Severity.CRITICAL,
            description: "Verify system allows adding new category successfully"
         })

         const category = createFullCategory();

         await allure.step('1. Go to add new category page', async () => {
            await addNewCategoryPage.goto();
            await addNewCategoryPage.expectOnPage();
         })
         const newCategory =
            await allure.step('2. Input fully category information and click Save button', async () => {
               const name = await addNewCategoryPage.addNewFullCategory(category);
               await allure.parameter("New Category", name);
               categoryCleanup.push(name);
               return name;
            })

         await allure.step('3. Search category which was just added', async () => {
            await categoryPage.searchTheCategory(newCategory);
         });

         await allure.step('4. Checking category added successfully', async () => {
            await categoryPage.displayCategorySuccess(category);
         });
      })

   test("CATEGORY_TC_02: Verify if editing an existing category successfully", { tag: ['@edit'] },
      async ({ categoryPage, seededCategory }, testInfo) => {
         await allureMeta({
            epic: EPIC.CATALOG,
            feature: FEATURE.CATEGORY,
            story: "Edit category",
            id: testInfo.title.split(":")[0],
            severity: allure.Severity.NORMAL,
            description: "Verify system allows editing an existing category successfully"
         })

         const editedFullCategory = createEditCategory();

         await allure.step('1. Go to category page', async () => {
            await categoryPage.goto();
            await categoryPage.expectOnPage();
         })
         await allure.step('2. Search the seeded category', async () => {
            await categoryPage.searchTheCategory(seededCategory.name);
            await categoryPage.displayCategorySuccess(seededCategory);

         })
         const editedCategoryName =
            await allure.step('3. Edit the category and save', async () => {
               const editedName = seededCategory.name + "_edit";
               await categoryPage.editTheCategory(seededCategory.name, { ...editedFullCategory, name: editedName });
               await allure.parameter("Old Category", seededCategory.name);
               await allure.parameter("New Category", editedName);
               return editedName;
            });

         await allure.step('4. Go to the category page again and search the edited category', async () => {
            await categoryPage.goto();
            await categoryPage.searchTheCategory(editedCategoryName);
         });

         await allure.step('5. Verify the edited category is displayed', async () => {
            await categoryPage.displayCategorySuccess({ ...editedFullCategory, name: editedCategoryName });
         });

      });

   test("CATEGORY_TC_03: Verify if deleting an existing category successfully", { tag: ['@delete'] },
      async ({ categoryPage, seededCategory }, testInfo) => {
         await allureMeta({
            epic: EPIC.CATALOG,
            feature: FEATURE.CATEGORY,
            story: "Delete category",
            id: testInfo.title.split(":")[0],
            severity: allure.Severity.NORMAL,
            description: "Verify system allows deleting an existing category successfully"
         })

         await allure.step('1. Go to category page', async () => {
            await categoryPage.goto();
            await categoryPage.expectOnPage();
         })
         await allure.step('2. Search the seeded category', async () => {
            await categoryPage.searchTheCategory(seededCategory.name);
            await categoryPage.displayCategorySuccess(seededCategory);

         })

         await allure.step('3. Delete the category', async () => {
            await categoryPage.deleteTheCategory(seededCategory.name);
            await allure.parameter("Deleted category", seededCategory.name);

         });

         await allure.step('4. Search the category again', async () => {
            await categoryPage.searchTheCategory(seededCategory.name);
         });

         await allure.step('5. Verify the category no longer exists', async () => {
            await categoryPage.displayNoCategory(seededCategory.name);
         });

      });

});

