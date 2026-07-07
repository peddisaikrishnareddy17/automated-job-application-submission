const { fillFormGeneric, detectBlockers } = require('../formEngine');
const { By, until } = require('selenium-webdriver');
const logger = require('../logger');

module.exports = async (driver, job, user, resumePath, resumeData, logCallback) => {
    try {
        logCallback(`Navigating to ${job.url}`);
        logger.info(`Starting automation for ${job.title} at ${job.company}`);
        
        await driver.manage().setTimeouts({ pageLoad: 30000 });
        await driver.get(job.url);
        
        await driver.wait(until.elementLocated(By.tagName('body')), 15000);
        
        const isBlocked = await detectBlockers(driver);
        if (isBlocked) {
            logCallback('Captcha or login wall detected. Skipping automation for this portal.');
            logger.warn(`Skipped job ${job.title} due to captcha/login wall`);
            throw new Error('Blocked by Captcha or Login wall');
        }

        logCallback('Beginning dynamic form extraction and fill...');
        const localLogger = {
            info: (msg) => { logCallback(msg); logger.info(msg); },
            warn: (msg) => { logCallback(`Warning: ${msg}`); logger.warn(msg); }
        };

        await fillFormGeneric(driver, resumeData, resumePath, localLogger);
        
        // Wait dynamically for a submit button that looks clickable
        const submitSelectors = [
            'button[type="submit"]', 'input[type="submit"]', 'button[name*="submit" i]', 
            'button[id*="submit" i]', '.submit-button', '.apply-button',
            'button:contains("Submit Application")', '#submit_app'
        ];
        
        let submitBtn = null;
        for (const sel of submitSelectors) {
            try {
                // If the selector isn't a valid CSS natively, webdriver might fail, so we just catch.
                // Note: :contains isn't valid native CSS in standard. We will just use standard ones
                if(sel.includes(':contains')) continue; 
                submitBtn = await driver.findElement(By.css(sel));
                if (submitBtn) break;
            } catch (e) {}
        }

        if (submitBtn) {
            logCallback('Submit button found. Attempting to click...');
            try {
                await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", submitBtn);
                await driver.sleep(500);
                await submitBtn.click();
            } catch (clickErr) {
                // Fallback to absolute JS injection if a floating banner intercepts the click natively
                await driver.executeScript("arguments[0].click();", submitBtn);
            }
            logCallback('Submit button clicked! Waiting for page telemetry to process...');
            await driver.sleep(5000); // Ensure the browser doesn't close before the POST request finishes
        } else {
            logCallback('No submit button found automatically. Ensure form is successfully filled.');
        }

        logger.info(`Successfully processed ${job.title} application form`);
    } catch (error) {
        logCallback(`Generic Apply Error: ${error.message}`);
        logger.error(`Error automating ${job.title} application: ${error.message}`);
        throw error;
    }
};
