export async function validationConfirmPage(page) {
    try {
        // Define the title text based on the URL's forcedCulture parameter
        const currentUrl = page.url();
        const cultureMatch = currentUrl.match(/forcedCulture=(\w{2})/);
        
        let flightSummaryText;
        if (cultureMatch) {
            switch (cultureMatch[1]) {
                case 'es':
                    flightSummaryText = 'Resumen de vuelo';
                    break;
                case 'ca':
                    flightSummaryText = 'Resum del vol';
                    break;
                default:
                    flightSummaryText = 'Flight Summary';
            }
        } else {
            flightSummaryText = 'Flight Summary'; // Default to English
        }

        // Wait for the Flight Summary section with the correct language
        const flightSummaryExists = await page.locator('div.mt-5.row').filter({
            has: page.locator(`h5.module_title:has-text("${flightSummaryText}")`)
        }).isVisible();

        if (!flightSummaryExists) {
            throw new Error(`${flightSummaryText} section not found on confirmation page`);
        }

        // Verify URL pattern
        const isConfirmationUrl = currentUrl.includes('/nwe/confirmation/');
        
        if (!isConfirmationUrl) {
            throw new Error('Not on confirmation page URL');
        }

        // Validate flight details are present
        await Promise.all([
            page.waitForSelector('.flight-info__journey-type', { timeout: 10000 }),
            page.waitForSelector('.flight-info__routes', { timeout: 10000 }),
            page.waitForSelector('.flight-card__footer', { timeout: 10000 })
        ]);

        return true;
    } catch (error) {
        console.error('Confirmation page validation failed:', error.message);
        throw error;
    }
}