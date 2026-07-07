const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const buildDriver = async () => {
    const options = new chrome.Options();

    // Basic Headless Setup
    // options.addArguments('--headless=new'); // Disabled so the user can visually watch the AI type the form
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');

    // Advanced Stealth Flags
    options.addArguments('--disable-blink-features=AutomationControlled');
    options.excludeSwitches('enable-automation');
    options.addArguments('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    // Mask the webdriver property
    await driver.executeScript("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})");

    await driver.manage().setTimeouts({ implicit: 10000 });

    return driver;
};

module.exports = { buildDriver };
