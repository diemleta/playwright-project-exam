import { test } from "../fixtures/gatekeeper.fixture";
import { allure, allureMeta, EPIC, FEATURE } from "../utils/allure-meta";
import { getTestData } from '../data/common/TestDataRepository';

const validCredentials = getTestData('login', 'validCredentials');
const negativeTestCases = getTestData('login', 'negativeTestCases');
const validPassword = process.env.CMS_ADMIN_PASSWORD!;

test.describe('CMS Login successfully', { tag: ['@smoke', '@function'] }, () => {

   const { testName, email } = validCredentials;
   test(testName, { tag: '@smoke' }, async ({ loginPage, }) => {
      await allureMeta({
         epic: EPIC.AUTH,
         feature: FEATURE.LOGIN,
         story: "Valid Login",
         id: testName.split(":")[0],
         severity: allure.Severity.CRITICAL,
         description: "Verify system allows user to log in successfully with valid username and password"
      });

      await allure.step('1. Go to login page', async () => {
         await loginPage.goto();
         await loginPage.expectOnPage();
      })

      await allure.step('2. Input valid username and password, then click button Login', async () => {
         await loginPage.login(email, validPassword);

      })

      await allure.step('3. Verify user logged in successfully', async () => {
         await loginPage.expectLoggedIn();
      });
   });
});

test.describe('CMS Login failed', { tag: ['@smoke', '@function'] }, () => {

   for (const testCase of negativeTestCases) {
      test(`${testCase.testName}`, async ({ loginPage }) => {
         await allureMeta({
            epic: EPIC.AUTH,
            feature: FEATURE.LOGIN,
            story: "Invalid login",
            id: testCase.testName.split(":")[0],
            severity: allure.Severity.NORMAL,
            description: "Verify system doesn't allow user to log in with invalid username or password"
         });

         await allure.step("1. Go to login page", async () => {
            await loginPage.goto();
            await loginPage.expectOnPage();
         })

         await allure.step(`2. Input username as ${testCase.email} and password as ***`, async () => {
            await loginPage.login(testCase.email, testCase.password);
         })

         await allure.step("3. Verify error message displayed", async () => {
            if (testCase.validationType === 'browser') {
               await loginPage.detectedWrongEmailFormat();
            } else {
               await loginPage.expectErrorNotification(testCase.expectedError);
            }

         });

         await allure.step("4. Verify user stays on login page", async () => {
            await loginPage.expectStillOnLoginPage();
         });
      });
   };
})




