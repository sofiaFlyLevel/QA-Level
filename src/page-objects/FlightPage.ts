import {CabinClass} from '../fixtures/userData'
async function forceClick(page, selector, maxRetries = 3, delay = 500) {
    let attempts = 0;

    while (attempts < maxRetries) {
        try {
            await page.click(selector);
            console.log(`Successfully clicked the element: ${selector}`);
            return; // Salir si el clic fue exitoso
        } catch (error) {
            attempts++;
            console.warn(`Attempt ${attempts} to click ${selector} failed: ${error.message}`);
            if (attempts < maxRetries) {
                await page.waitForTimeout(delay); // Esperar antes de intentar de nuevo
            }
        }
    }

    throw new Error(`Failed to click the element ${selector} after ${maxRetries} attempts.`);
}

export async function selectFlights(page, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType, oneTrip = false) {
    try {
        // Espera inicial de 3 segundos
        await page.waitForTimeout(3000);

        if (!outboundFlightClass || !outboundFlightType) {
            throw new Error("Datos de vuelo de ida incompletos.");
        }

        // Intentar hacer clic en el selector del vuelo de ida
        await forceClick(page, `div.price-cabin:has-text(\"${outboundFlightClass}\")`);
        
        if (outboundFlightClass === CabinClass.PREMIUM) {
            await page.locator('div').filter({
                hasText: new RegExp(`^Continue with Premium ${outboundFlightType}`)
            }).nth(1).click();
        } else {
            await page.locator('div').filter({
                hasText: new RegExp(`^Continue with ${outboundFlightType}`)
            }).nth(1).click();
        }

        if (!oneTrip) {
            if (!returnFlightClass || !returnFlightType) {
                throw new Error("Datos de vuelo de vuelta incompletos.");
            }

            // Intentar hacer clic en el selector del vuelo de regreso
            await forceClick(page, `div.price-cabin:has-text(\"${returnFlightClass}\")`);
            
            if (returnFlightClass === CabinClass.PREMIUM) {
                await page.locator('div').filter({
                    hasText: new RegExp(`^Continue with Premium ${returnFlightType}`)
                }).nth(1).click();
            } else {
                await page.locator('div').filter({
                    hasText: new RegExp(`^Continue with ${returnFlightType}`)
                }).nth(1).click();
            }
        }
    } catch (error) {
        console.error("Error seleccionando vuelos:", error);
    }
}
