const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://www.saucedemo.com',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    screenshotOnRunFailure: true,
    retries: { runMode: 1, openMode: 0 }, // one retry in CI absorbs a network blip; a real failure still fails twice
    defaultCommandTimeout: 8000,
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'cypress/reports',
      reportPageTitle: 'Cypress end-to-end report: SauceDemo',
      charts: true,
      embeddedScreenshots: true,
      inlineAssets: true,
      saveAllAttempts: false,
    },
    setupNodeEvents(on) {
      require('cypress-mochawesome-reporter/plugin')(on);
      // NO_GPU=1 turns off GPU rendering, for machines and sandboxes where the GPU process cannot start.
      on('before:browser:launch', (browser, launchOptions) => {
        if (process.env.NO_GPU) launchOptions.args.push('--disable-gpu', '--disable-software-rasterizer', '--disable-gpu-compositing');
        return launchOptions;
      });
    },
  },
});
