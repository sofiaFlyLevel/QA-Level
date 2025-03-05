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

        // Objeto para almacenar la información de los vuelos
        const flightInformation = {
            outbound: {
                flightNumber: '',
                departureTime: '',
                arrivalTime: '',
                departureDate: '',
                arrivalDate: '',
                duration: ''
            },
            return: {
                flightNumber: '',
                departureTime: '',
                arrivalTime: '',
                departureDate: '',
                arrivalDate: '',
                duration: ''
            }
        };

        // Capturar información del vuelo de ida antes de hacer clic
        console.log("Recogiendo información del vuelo de ida");
        try {
            // Esperar a que los elementos estén disponibles
            await page.waitForSelector('.flight-card', { timeout: 5000 });
            
            // Intentar obtener el número de vuelo
            const outboundFlightNumbers = await page.locator('.flight-card').first().locator('.flight-card__flight-number').allTextContents();
            flightInformation.outbound.flightNumber = outboundFlightNumbers.join(', ');
            
            // Obtener horas de salida y llegada
            const outboundTimes = await page.locator('.flight-card').first().locator('.flight-card__time').allTextContents();
            if (outboundTimes.length >= 2) {
                flightInformation.outbound.departureTime = outboundTimes[0];
                flightInformation.outbound.arrivalTime = outboundTimes[1];
            }
            
            // Obtener fechas
            const outboundDates = await page.locator('.flight-card').first().locator('.flight-card__date').allTextContents();
            if (outboundDates.length >= 2) {
                flightInformation.outbound.departureDate = outboundDates[0];
                flightInformation.outbound.arrivalDate = outboundDates[1];
            }
            
            // Obtener duración
            const outboundDuration = await page.locator('.flight-card').first().locator('.flight-card__duration').textContent();
            flightInformation.outbound.duration = outboundDuration || '';
            
            console.log("Información del vuelo de ida recogida:", flightInformation.outbound);
        } catch (error) {
            console.warn("No se pudo obtener toda la información del vuelo de ida:", error.message);
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

            // Capturar información del vuelo de vuelta
            console.log("Recogiendo información del vuelo de vuelta");
            try {
                // Esperar a que los elementos estén disponibles (para el vuelo de vuelta)
                await page.waitForSelector('.flight-card', { timeout: 5000 });
                
                // Intentar obtener el número de vuelo
                const returnFlightNumbers = await page.locator('.flight-card').nth(1).locator('.flight-card__flight-number').allTextContents();
                flightInformation.return.flightNumber = returnFlightNumbers.join(', ');
                
                // Obtener horas de salida y llegada
                const returnTimes = await page.locator('.flight-card').nth(1).locator('.flight-card__time').allTextContents();
                if (returnTimes.length >= 2) {
                    flightInformation.return.departureTime = returnTimes[0];
                    flightInformation.return.arrivalTime = returnTimes[1];
                }
                
                // Obtener fechas
                const returnDates = await page.locator('.flight-card').nth(1).locator('.flight-card__date').allTextContents();
                if (returnDates.length >= 2) {
                    flightInformation.return.departureDate = returnDates[0];
                    flightInformation.return.arrivalDate = returnDates[1];
                }
                
                // Obtener duración
                const returnDuration = await page.locator('.flight-card').nth(1).locator('.flight-card__duration').textContent();
                flightInformation.return.duration = returnDuration || '';
                
                console.log("Información del vuelo de vuelta recogida:", flightInformation.return);
            } catch (error) {
                console.warn("No se pudo obtener toda la información del vuelo de vuelta:", error.message);
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

        // Devolver la información de vuelo capturada
        return flightInformation;
    } catch (error) {
        console.error("Error seleccionando vuelos:", error);
        // Devolver un objeto vacío en caso de error
        return {
            outbound: {},
            return: {}
        };
    }
}