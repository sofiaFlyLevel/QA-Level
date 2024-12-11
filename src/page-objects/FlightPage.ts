import {CabinClass} from '../fixtures/userData'
export async function selectFlights(page, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType) {
    try {
        // Espera 5 segundos
        await page.waitForTimeout(5000);

        if (!outboundFlightClass || !outboundFlightType) {
            throw new Error("Datos de vuelo de ida incompletos.");
        }

        await page.click(`div.price-cabin:has-text(\"${outboundFlightClass}\")`);
        if(outboundFlightClass == CabinClass.PREMIUM){
            await page.locator('div').filter({
                hasText: new RegExp(`^Continue with Premium ${outboundFlightType}`)
            }).nth(1).click();
        }
        else{
            await page.locator('div').filter({
                hasText: new RegExp(`^Continue with ${outboundFlightType}`)
            }).nth(1).click();
        }
        


        if (!returnFlightClass || !returnFlightType) {
            throw new Error("Datos de vuelo de vuelta incompletos.");
        }

        await page.click(`div.price-cabin:has-text(\"${returnFlightClass}\")`);
        if(outboundFlightClass == CabinClass.PREMIUM){
        await page.locator('div').filter({
            hasText: new RegExp(`^Continue with Premium ${returnFlightType}`)
        }).nth(1).click();
        }
        else{
            await page.locator('div').filter({
                hasText: new RegExp(`^Continue with ${returnFlightType}`)
            }).nth(1).click();
        }

    } catch (error) {
        console.error("Error seleccionando vuelos:", error);
    } 
}