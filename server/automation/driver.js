const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

function createDriver({ headless = process.env.SELENIUM_HEADLESS === 'true', args = [] } = {}) {
  const options = new chrome.Options();
  if (headless) {
    options.headless();
    options.addArguments('--disable-gpu');
  }
  // common args for stability
  options.addArguments('--no-sandbox', '--disable-dev-shm-usage', '--window-size=1280,1024');
  if (Array.isArray(args) && args.length) options.addArguments(...args);

  const serviceBuilder = new chrome.ServiceBuilder();

  const driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .setChromeService(serviceBuilder)
    .build();

  return driver;
}

module.exports = { createDriver };
