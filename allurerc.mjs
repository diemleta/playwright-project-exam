
export default {
  name: "CMS Admin Playwright Automation Report",
  output: './reports/allure-report',
  historyPath: './reports/allure-history/history.jsonl',
  historyLimit: 10,
  plugins: {
    awesome: {
      options: {
        theme: "dark",
        reportLanguage: "en",
        singleFile: false,
      },
    },
  },
};
