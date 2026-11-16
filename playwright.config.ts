import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import os from "os";


dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

const args = process.argv;
const projects = args
  .flatMap((a, i) =>
    a.startsWith('--project=') ? [a.split('=')[1]]
    : a === '--project' ? [args[i + 1]]
    : []
  )
  .filter((p) => p && p !== 'setup');

const browsers = projects.length ? projects.join(', ') : 'chromium, firefox, webkit';
const screen = { width: 1920, height: 1080 }; 


export default defineConfig({
  testDir: './src',
  globalSetup: require.resolve('./src/setup/global-setup'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 3,
  timeout: 60000,
  reporter:[
    ['html',{ outputFolder: 'reports/html',open: 'never', },],
    ['allure-playwright', { resultsDir: 'reports/allure-results',detail: true, suiteTitle: true,
      environmentInfo : {
        BASE_URL: process.env.BASE_URL ?? 'N/A',
        Browser: browsers,
      Environment: process.env.CI ? 'CI' : 'Local',
      OS: `${os.type()} ${os.release()} (${os.arch()})`,
    } }],
  ] ,
  
  use: {
    baseURL: process.env.BASE_URL,
    headless: true,
    locale: 'vi-VN',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    
  },

  projects: [
     { 
      name: "setup",
      testMatch: "src/setup/*.setup.ts",
    },
    {
     name: 'chromium',
     dependencies: ["setup"],
     testMatch: "src/tests/*.spec.ts",
     use:  { ...devices['Desktop Chrome'] , storageState: ".auth/admin.json",
      viewport: screen,
     },
    },
     {
     name: 'firefox',
     dependencies: ["setup"],
     testMatch: "src/tests/*.spec.ts",
     use:  { ...devices['Desktop Firefox'] , storageState: ".auth/admin.json",
      viewport: screen,
     },
    },
    {
     name: 'webkit',
     dependencies: ["setup"],
     testMatch: "src/tests/*.spec.ts",
     use:  { ...devices['Desktop Safari'], storageState: ".auth/admin.json",
      viewport: screen,
     },
    },
  ]
});
