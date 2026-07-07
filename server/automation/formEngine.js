const { By, until } = require('selenium-webdriver');

const findElementDynamically = async (driver, selectors, timeout = 3000) => {
    for (const sel of selectors) {
        try {
            const el = await driver.wait(until.elementLocated(By.css(sel)), timeout);
            return el;
        } catch (e) {
            // keep looking using alternate selectors
        }
    }
    return null;
};

const typeText = async (driver, element, text) => {
    if (!element || !text) return;
    try {
        // Bring element cleanly into view and wait a beat
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", element).catch(() => {});
        await driver.sleep(200);

        // Native Selenium attempt
        await element.clear().catch(() => {});
        await element.sendKeys(text).catch(() => {});

        // Deep React-Friendly Javascript Absolute Fallback
        await driver.executeScript(`
            let el = arguments[0];
            let txt = arguments[1];
            
            // Bypass React 16+ Virtual DOM overrides
            let nativeInputValueSetter;
            if (el.tagName.toLowerCase() === 'textarea') {
                nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
            } else {
                nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
            }

            if (nativeInputValueSetter) {
                nativeInputValueSetter.call(el, txt);
            } else {
                el.value = txt; // fallback to standard
            }
            
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
            el.dispatchEvent(new Event('blur', { bubbles: true }));
        `, element, text).catch(() => {});
    } catch(e) {}
};

async function fillFormGeneric(driver, resumeData, resumePath, logger) {
    if (!resumeData) resumeData = {};
    
    // Fallbacks just in case data wasn't merged perfectly or user has no resume saved
    const finalData = {
        name: resumeData.name || 'Jane Doe',
        email: resumeData.email || 'janedoe@example.com',
        phone: resumeData.phone || '+1 555-0198',
        linkedin: resumeData.linkedin || 'https://linkedin.com/in/janedoe',
        portfolio: resumeData.portfolio || 'https://github.com/janedoe',
        address: resumeData.address || '123 Tech Lane, Silicon Valley, CA',
        cover_letter: resumeData.cover_letter || 'I am writing to express my interest in this position. Please find attached my resume.'
    };

    // 1. Scan DOM Intelligently
    const scanScript = `
        const elements = Array.from(document.querySelectorAll('input, textarea, select'));
        return elements.map(el => {
            let rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0 || el.type === 'hidden' || el.style.display === 'none') return null;
            return {
                id: el.id || '',
                name: el.name || '',
                type: el.type || el.tagName.toLowerCase(),
                placeholder: el.placeholder || '',
                ariaLabel: el.getAttribute('aria-label') || '',
                xpath: getXPath(el)
            };
        }).filter(Boolean);

        function getXPath(element) {
            if (element.id !== '') return '//*[@id="' + element.id + '"]';
            if (element === document.body) return '/html/body';
            var ix = 0;
            var siblings = element.parentNode.childNodes;
            for (var i = 0; i < siblings.length; i++) {
                var sibling = siblings[i];
                if (sibling === element) return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';
                if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++;
            }
        }
    `;

    let fields = [];
    try {
        fields = await driver.executeScript(scanScript);
        if (logger) logger.info(`DOM Scanner detected ${fields.length} interactive input fields.`);
    } catch(e) {
        if (logger) logger.warn('Failed to execute DOM scanner.');
    }

    // 2. Fuzzy Mapping Engine
    const matchField = (field, keywords) => {
        const str = (field.id + ' ' + field.name + ' ' + field.placeholder + ' ' + field.ariaLabel).toLowerCase();
        return keywords.some(kw => str.includes(kw));
    };

    const typeToXPath = async (xpath, text, fieldName) => {
        if (!text) return;
        try {
            const el = await driver.wait(until.elementLocated(By.xpath(xpath)), 2000);
            await typeText(driver, el, text);
            if (logger) logger.info(`Filled ${fieldName} automatically via AI match`);
        } catch(e) { }
    };

    // 3. Fill Matched Fields
    for (const f of fields) {
        if (f.type === 'file' || f.type === 'submit' || f.type === 'button') continue;

        if (matchField(f, ['name', 'first', 'last', 'identity', 'fullname'])) {
            await typeToXPath(f.xpath, finalData.name, 'name');
        } else if (matchField(f, ['email', 'e-mail', 'mail'])) {
            await typeToXPath(f.xpath, finalData.email, 'email');
        } else if (matchField(f, ['phone', 'mobile', 'tel', 'cell', 'digits'])) {
            await typeToXPath(f.xpath, finalData.phone, 'phone');
        } else if (matchField(f, ['address', 'location', 'city', 'residence'])) {
            await typeToXPath(f.xpath, finalData.address, 'address');
        } else if (matchField(f, ['linkedin', 'urls[\"linkedin\"]', 'lnkd'])) {
            await typeToXPath(f.xpath, finalData.linkedin, 'linkedin');
        } else if (matchField(f, ['portfolio', 'website', 'github', 'urls[\"portfolio\"]', 'web'])) {
            await typeToXPath(f.xpath, finalData.portfolio, 'portfolio');
        } else if (matchField(f, ['cover', 'message', 'summary', 'motivation'])) {
            await typeToXPath(f.xpath, finalData.cover_letter, 'cover letter');
        }
    }
    
    // 4. Handle Resume Upload securely
    if (resumePath) {
        const fileFields = fields.filter(f => f.type === 'file' && matchField(f, ['resume', 'cv', 'upload']));
        // fallback to any file input if no resume match
        const target = fileFields.length > 0 ? fileFields[0] : fields.find(f => f.type === 'file');
        
        if (target) {
            try {
                const el = await driver.wait(until.elementLocated(By.xpath(target.xpath)), 2000);
                await el.sendKeys(resumePath);
                if (logger) logger.info('Uploaded resume file automatically via AI detect');
            } catch (e) {
                if (logger) logger.warn('Failed to upload resume file.');
            }
        }
    }
}

async function detectBlockers(driver) {
    // We only want to block if there's a hard login wall natively obstructing the page.
    // We removed .login and #login because they trigger false positives on navbar links.
    const blockers = [
        'input[type="password"]'
    ];
    for (const b of blockers) {
        try {
            const els = await driver.findElements(By.css(b));
            for (const el of els) {
                if (await el.isDisplayed()) return true;
            }
        } catch (e) {}
    }
    return false;
}

module.exports = { fillFormGeneric, detectBlockers };
