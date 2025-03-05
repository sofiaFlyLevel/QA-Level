import {CabinClass} from '../fixtures/userData'
import { Logger } from '../utils/Logger';

async function forceClick(page, selector, maxRetries = 3, delay = 500) {
    let attempts = 0;
    const logger = new Logger();

    while (attempts < maxRetries) {
        try {
            await page.click(selector);
            logger.info(`Successfully clicked the element: ${selector}`);
            return; // Salir si el clic fue exitoso
        } catch (error) {
            attempts++;
            logger.warn(`Attempt ${attempts} to click ${selector} failed: ${error.message}`);
            if (attempts < maxRetries) {
                await page.waitForTimeout(delay); // Esperar antes de intentar de nuevo
            }
        }
    }

    throw new Error(`Failed to click the element ${selector} after ${maxRetries} attempts.`);
}

/**
 * Extrae la información detallada de una tarjeta de vuelo
 * @param page - Instancia de la página
 * @param cardIndex - Índice de la tarjeta (0 para ida, 1 para vuelta)
 * @param cardType - Tipo de tarjeta ("OUTBOUND" o "INBOUND")
 */
async function extractFlightCardInfo(page, cardIndex, cardType) {
    const logger = new Logger();
    logger.info(`Extrayendo información de vuelo ${cardType}, tarjeta #${cardIndex}`);

    try {
        // Asegurarse de que la tarjeta existe
        const cardSelector = `.${cardType.toLowerCase()}-flight-container .card-flight:nth-child(${cardIndex + 1})`;
        await page.waitForSelector(cardSelector, { timeout: 10000 });
        
        // Extraer tipo de vuelo y fecha
        const flightTypeSelector = `${cardSelector} .selection-flight-details .flight-types`;
        const flightDateSelector = `${cardSelector} .selection-flight-details .flight-dates`;
        
        // El flightType realmente es solo la dirección del vuelo (OUTBOUND/INBOUND)
        // Esto lo usaremos para distinguir vuelos, pero no es el tipo real de cabina
        const flightDirection = await page.locator(flightTypeSelector).textContent().catch(() => cardType);
        let flightDate = await page.locator(flightDateSelector).textContent().catch(() => "");
        // Limpiar el formato de la fecha (quitar el pipe y espacios)
        flightDate = flightDate.replace(/\|\s+/g, "");
        
        // Extraer aeropuertos de origen y destino
        const originCodeSelector = `${cardSelector} .info-departure .station-label__code`;
        const originNameSelector = `${cardSelector} .info-departure .station-label__name`;
        const destCodeSelector = `${cardSelector} .info-arrival .station-label__code`;
        const destNameSelector = `${cardSelector} .info-arrival .station-label__name`;
        
        const originCode = await page.locator(originCodeSelector).textContent().catch(() => "");
        const originName = await page.locator(originNameSelector).textContent().catch(() => "");
        const destCode = await page.locator(destCodeSelector).textContent().catch(() => "");
        const destName = await page.locator(destNameSelector).textContent().catch(() => "");
        
        // Extraer horarios
        const departureTimeSelector = `${cardSelector} .departure-time`;
        const arrivalTimeSelector = `${cardSelector} .arrival-time`;
        const durationSelector = `${cardSelector} .flight-duration`;
        
        let departureTime = await page.locator(departureTimeSelector).textContent().catch(() => "");
        let arrivalTime = await page.locator(arrivalTimeSelector).textContent().catch(() => "");
        const duration = await page.locator(durationSelector).textContent().catch(() => "");
        
        // Verificar si hay indicador de día siguiente (+1)
        let nextDayIndicator = false;
        const nextDaySelector = `${cardSelector} .next-day-indicator`;
        const nextDayElements = await page.locator(nextDaySelector).count();
        
        if (nextDayElements > 0) {
            nextDayIndicator = true;
            // Limpiar el texto de llegada para quitar el indicador +1
            arrivalTime = arrivalTime.replace(/\+1 day\s+/g, "");
        }
        
        // Extraer aerolínea y número de vuelo
        const carrierSelector = `${cardSelector} .operate-by`;
        const carrierLogo = await page.locator(`${carrierSelector} img.carrier-logo`).getAttribute('alt').catch(() => "");
        let airline = "";
        
        // Intentar extraer el código de aerolínea del alt del logo
        if (carrierLogo) {
            const airlineMatch = carrierLogo.match(/(\w+)\s+logo/i);
            airline = airlineMatch ? airlineMatch[1] : carrierLogo;
        }
        
        // Ahora extraemos AMBOS precios y clases de cabina
        const economySelector = `${cardSelector} .btn-economy`;
        const premiumSelector = `${cardSelector} .btn-premium`;
        
        // Obtener nombres de cabina
        const economyCabinName = await page.locator(`${economySelector} .cabin-name`).textContent().catch(() => "ECONOMY");
        const premiumCabinName = await page.locator(`${premiumSelector} .cabin-name`).textContent().catch(() => "PREMIUM");
        
        // Obtener precios de cabina
        const economyPrice = await page.locator(`${economySelector} .cabin-price`).textContent().catch(() => "");
        const premiumPrice = await page.locator(`${premiumSelector} .cabin-price`).textContent().catch(() => "");
        
        // Por defecto considerar ambas opciones de cabina (se seleccionará una después)
        const cabinOptions = {
            economy: {
                name: economyCabinName.trim(),
                price: economyPrice.trim()
            },
            premium: {
                name: premiumCabinName.trim(),
                price: premiumPrice.trim()
            }
        };
        
        // Extraer número de vuelo si está visible
        let flightNumber = "";
        
        // En algunas páginas el número de vuelo está visible
        const flightNumberSelector = `${cardSelector} .flight-card__flight-number`;
        if (await page.locator(flightNumberSelector).count() > 0) {
            flightNumber = await page.locator(flightNumberSelector).first().textContent().catch(() => "");
        }
        
        return {
            direction: flightDirection.trim(), // OUTBOUND o INBOUND
            date: flightDate.trim(),
            origin: {
                code: originCode.trim(),
                name: originName.trim()
            },
            destination: {
                code: destCode.trim(),
                name: destName.trim()
            },
            times: {
                departure: departureTime.trim(),
                arrival: arrivalTime.trim(),
                duration: duration.trim(),
                nextDay: nextDayIndicator
            },
            airline: airline,
            flightNumber: flightNumber.trim(),
            cabinOptions: cabinOptions,
            cardSelector: cardSelector // Guardamos el selector para hacer click después
        };
    } catch (error) {
        logger.error(`Error extrayendo información de vuelo ${cardType}: ${error.message}`);
        return {
            direction: cardType,
            error: error.message
        };
    }
}

export async function selectFlights(page, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType, oneTrip = false) {
    const logger = new Logger();
    
    try {
        // Espera inicial de 3 segundos
        await page.waitForTimeout(3000);

        if (!outboundFlightClass || !outboundFlightType) {
            throw new Error("Datos de vuelo de ida incompletos.");
        }

        // Objeto para almacenar la información de los vuelos
        const flightInformation = {
            outbound: {},
            return: {}
        };

        // Capturar información del vuelo de ida
        logger.info("Capturando información del vuelo de ida");
        try {
            flightInformation.outbound = await extractFlightCardInfo(page, 0, "OUTBOUND");
            
            // Añadir la información de clase y tipo seleccionados
            flightInformation.outbound.selectedCabin = {
                class: outboundFlightClass,
                type: outboundFlightType,
                fullName: `${outboundFlightClass} ${outboundFlightType}`
            };
            
            logger.info("Información del vuelo de ida capturada con éxito", flightInformation.outbound);
        } catch (error) {
            logger.error("Error al capturar información del vuelo de ida:", error.message);
        }

        // Determinar qué botón de cabina seleccionar para el vuelo de ida
        let cabinButtonSelector;
        if (outboundFlightClass.toLowerCase() === 'premium') {
            cabinButtonSelector = `.outbound-flight-container .card-flight:nth-child(1) .btn-premium`;
        } else {
            cabinButtonSelector = `.outbound-flight-container .card-flight:nth-child(1) .btn-economy`;
        }

        // Hacer clic en el botón de cabina correspondiente
        logger.info(`Seleccionando cabina para vuelo de ida: ${outboundFlightClass}`);
        await forceClick(page, cabinButtonSelector, 5, 1000);
        
        // Hacer clic en el botón "Continue with X Y"
        if (outboundFlightClass === CabinClass.PREMIUM) {
            await page.waitForSelector(`div:has-text("Continue with Premium ${outboundFlightType}")`, { timeout: 10000 });
            await page.locator('div').filter({
                hasText: new RegExp(`^Continue with Premium ${outboundFlightType}`)
            }).first().click({ timeout: 5000 });
        } else {
            await page.waitForSelector(`div:has-text("Continue with ${outboundFlightType}")`, { timeout: 10000 });
            await page.locator('div').filter({
                hasText: new RegExp(`^Continue with ${outboundFlightType}`)
            }).first().click({ timeout: 5000 });
        }

        // Esperar a que se procese la selección
        await page.waitForTimeout(2000);

        if (!oneTrip) {
            if (!returnFlightClass || !returnFlightType) {
                throw new Error("Datos de vuelo de vuelta incompletos.");
            }

            // Capturar información del vuelo de vuelta
            logger.info("Capturando información del vuelo de vuelta");
            try {
                // Esperar a que la página de selección de vuelo de regreso esté lista
                await page.waitForSelector('.inbound-flight-container .card-flight', { timeout: 20000 });
                
                flightInformation.return = await extractFlightCardInfo(page, 0, "INBOUND");
                
                // Añadir la información de clase y tipo seleccionados
                flightInformation.return.selectedCabin = {
                    class: returnFlightClass,
                    type: returnFlightType,
                    fullName: `${returnFlightClass} ${returnFlightType}`
                };
                
                logger.info("Información del vuelo de vuelta capturada con éxito", flightInformation.return);
            } catch (error) {
                logger.error("Error al capturar información del vuelo de vuelta:", error.message);
            }

            // Determinar qué botón de cabina seleccionar para el vuelo de vuelta
            let returnCabinButtonSelector;
            if (returnFlightClass.toLowerCase() === 'premium') {
                returnCabinButtonSelector = `.inbound-flight-container .card-flight:nth-child(1) .btn-premium`;
            } else {
                returnCabinButtonSelector = `.inbound-flight-container .card-flight:nth-child(1) .btn-economy`;
            }

            // Hacer clic en el botón de cabina correspondiente
            logger.info(`Seleccionando cabina para vuelo de vuelta: ${returnFlightClass}`);
            await forceClick(page, returnCabinButtonSelector, 5, 1000);
            
            // Hacer clic en el botón "Continue with X Y"
            if (returnFlightClass === CabinClass.PREMIUM) {
                await page.waitForSelector(`div:has-text("Continue with Premium ${returnFlightType}")`, { timeout: 10000 });
                await page.locator('div').filter({
                    hasText: new RegExp(`^Continue with Premium ${returnFlightType}`)
                }).first().click({ timeout: 5000 });
            } else {
                await page.waitForSelector(`div:has-text("Continue with ${returnFlightType}")`, { timeout: 10000 });
                await page.locator('div').filter({
                    hasText: new RegExp(`^Continue with ${returnFlightType}`)
                }).first().click({ timeout: 5000 });
            }
        }

        // Devolver la información de vuelo capturada
        return flightInformation;
    } catch (error) {
        logger.error("Error seleccionando vuelos:", error.message);
        // Devolver un objeto vacío en caso de error
        return {
            outbound: {},
            return: {}
        };
    }
}