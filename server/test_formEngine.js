const { buildDriver } = require('./automation/browser');
const { fillFormGeneric } = require('./automation/formEngine');

(async () => {
    let driver;
    try {
        driver = await buildDriver();
        // Windows absolute path to URI format
        const fileUrl = 'file:///C:/Users/sai%20krishna/OneDrive/Desktop/mini%20project/test/mock_job_form.html'.replace(/\\/g, '/');
        
        console.log(`Navigating to ${fileUrl}`);
        await driver.get(fileUrl);
        
        const resumeData = {
            name: 'John Doe',
            email: 'john.doe@test.com',
            phone: '555-123-4567',
            linkedin: 'https://linkedin.com/in/johndoe',
            portfolio: 'https://johndoe.dev'
        };
        // Use this script file itself as a dummy mock resume
        const resumePath = __filename; 
        
        console.log('Filling form dynamically...');
        // Emulate logger
        const logger = {
            info: (m) => console.log('[INFO]', m),
            warn: (m) => console.log('[WARN]', m)
        };
        
        await fillFormGeneric(driver, resumeData, resumePath, logger);
        console.log('Done filling form. Finding and clicking submit...');
        
        const { By, until } = require('selenium-webdriver');
        const submitBtn = await driver.findElement(By.css('.apply-button'));
        await submitBtn.click();
        
        await driver.wait(until.elementLocated(By.id('success')), 3000);
        const successText = await driver.findElement(By.id('success')).getText();
        
        console.log('\n--- Result ---');
        console.log(successText);
        if (successText.includes('Successfully')) {
            console.log('TEST PASSED');
        } else {
            console.log('TEST FAILED');
        }
    } catch (e) {
        console.error('Test Error:', e);
    } finally {
        if (driver) await driver.quit();
    }
})();
