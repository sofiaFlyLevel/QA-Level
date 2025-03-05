import * as XLSX from 'xlsx';
import { existsSync } from 'fs';
import { Logger } from '../utils/Logger';

// Función mejorada para esperar a la URL de confirmación
async function waitForConfirmationUrl(page, timeout = 60000) {
    const logger = new Logger();
    logger.info(`Esperando a que la navegación a la página de confirmación se complete (máximo ${timeout}ms)...`);
    
    const startTime = Date.now();
    
    try {
        // Primero, esperar a que la navegación básica se complete
        await page.waitForLoadState('networkidle', { timeout: timeout / 2 });
        
        // Esperar a que la URL cambie al patrón de confirmación
        while (Date.now() - startTime < timeout) {
            const currentUrl = page.url();
            logger.info(`URL actual: ${currentUrl}`);
            
            if (currentUrl.includes('/nwe/confirmation/')) {
                logger.info(`URL de confirmación detectada después de ${Date.now() - startTime}ms`);
                
                // Esperar un momento adicional para que la página se cargue completamente
                await page.waitForTimeout(3000);
                
                // Esperar a que el contenido principal se cargue
                await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
                await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
                
                return true;
            }
            
            // Verificar si hay algún error o mensaje de fallo en la página
            const errorMessages = await page.locator('.error-message, .alert-danger, [role="alert"]').allTextContents().catch(() => []);
            if (errorMessages.length > 0) {
                logger.error(`Se encontraron mensajes de error en la página: ${errorMessages.join(', ')}`);
            }
            
            // Verificar si estamos en alguna otra página de respuesta (como error de pago)
            if (currentUrl.includes('/payment-error/') || currentUrl.includes('/error/')) {
                logger.error(`Redirigido a página de error: ${currentUrl}`);
                return false;
            }
            
            // Breve pausa antes de revisar de nuevo
            await page.waitForTimeout(1000);
        }
        
        logger.error(`Tiempo de espera agotado: URL de confirmación no detectada después de ${timeout}ms`);
        return false;
    } catch (error) {
        logger.error(`Error al esperar URL de confirmación: ${error.message}`);
        return false;
    }
}

async function saveBookingCodeToExcel(bookingCode, testCase) {
    try {
        const fileName = 'booking_codes.xlsx';
        let wb;
        let ws;

        // Extract all the relevant information from the test case
        const {
            flightConfig,
            passengerConfig,
            paymentInfo,
            flightDetails
        } = testCase;

        // Get current date and time
        const now = new Date().toLocaleString();

        // Create data object with all information
        const bookingData = {
            'Booking Code': bookingCode,
            'Date Created': now,
            // Flight information
            'Origin': flightConfig.origin,
            'Destination': flightConfig.destination,
            'Trip Type': flightConfig.isOneWay ? 'One Way' : 'Round Trip',
            'Outbound Flight Class': flightConfig.outboundFlightClass,
            'Outbound Flight Type': flightConfig.outboundFlightType,
            'Return Flight Class': flightConfig.returnFlightClass,
            'Return Flight Type': flightConfig.returnFlightType,
            // Passenger information
            'Adults Count': passengerConfig.adults.length,
            'Children Count': passengerConfig.children.length,
            'Infants Count': passengerConfig.infants.length,
            'Language': passengerConfig.language,
            // Contact information
            'Contact Name': passengerConfig.adults[0].name,
            'Contact Surname': passengerConfig.adults[0].surname,
            'Contact Email': passengerConfig.adults[0].email,
            'Contact Phone': passengerConfig.adults[0].phone,
            // Payment information
            'Payment Card': paymentInfo.cardNumber,
            'Payment Name': paymentInfo.nameOnCard
        };

        // Add detailed flight information if available
        if (flightDetails && flightDetails.outbound) {
            // Outbound flight details
            bookingData['Outbound Flight Number'] = flightDetails.outbound.flightNumber || '';
            bookingData['Outbound Departure Date'] = flightDetails.outbound.departureDate || '';
            bookingData['Outbound Departure Time'] = flightDetails.outbound.departureTime || '';
            bookingData['Outbound Arrival Date'] = flightDetails.outbound.arrivalDate || '';
            bookingData['Outbound Arrival Time'] = flightDetails.outbound.arrivalTime || '';
            bookingData['Outbound Duration'] = flightDetails.outbound.duration || '';

            // Return flight details (if not one-way)
            if (!flightConfig.isOneWay && flightDetails.return) {
                bookingData['Return Flight Number'] = flightDetails.return.flightNumber || '';
                bookingData['Return Departure Date'] = flightDetails.return.departureDate || '';
                bookingData['Return Departure Time'] = flightDetails.return.departureTime || '';
                bookingData['Return Arrival Date'] = flightDetails.return.arrivalDate || '';
                bookingData['Return Arrival Time'] = flightDetails.return.arrivalTime || '';
                bookingData['Return Duration'] = flightDetails.return.duration || '';
            }
        }

        // Add passenger details
        passengerConfig.adults.forEach((adult, index) => {
            const prefix = `Adult ${index + 1}`;
            bookingData[`${prefix} Name`] = adult.name;
            bookingData[`${prefix} Surname`] = adult.surname;
            bookingData[`${prefix} Age`] = adult.dateOfBirth;
            bookingData[`${prefix} Nationality`] = adult.nationality;
            bookingData[`${prefix} Gender`] = adult.gender;
            bookingData[`${prefix} Assistance`] = adult.assistance ? adult.assistance.join('; ') : 'None';
        });

        passengerConfig.children.forEach((child, index) => {
            const prefix = `Child ${index + 1}`;
            bookingData[`${prefix} Name`] = child.name;
            bookingData[`${prefix} Surname`] = child.surname;
            bookingData[`${prefix} Age`] = child.dateOfBirth;
            bookingData[`${prefix} Nationality`] = child.nationality;
            bookingData[`${prefix} Assistance`] = child.assistance ? child.assistance.join('; ') : 'None';
        });

        passengerConfig.infants.forEach((infant, index) => {
            const prefix = `Infant ${index + 1}`;
            bookingData[`${prefix} Name`] = infant.name;
            bookingData[`${prefix} Surname`] = infant.surname;
            bookingData[`${prefix} Age`] = infant.dateOfBirth;
            bookingData[`${prefix} Nationality`] = infant.nationality;
        });

        if (existsSync(fileName)) {
            // Read the existing file
            wb = XLSX.readFile(fileName);
            ws = wb.Sheets[wb.SheetNames[0]];
            
            // Get the current data as array of objects
            const data = XLSX.utils.sheet_to_json(ws);
            
            // Add the new data
            data.push(bookingData);
            
            // Create a new worksheet with the updated data
            ws = XLSX.utils.json_to_sheet(data);
        } else {
            // Create a new workbook and worksheet if the file doesn't exist
            wb = XLSX.utils.book_new();
            ws = XLSX.utils.json_to_sheet([bookingData]);
        }

        // Ensure the worksheet is in the workbook
        if (!wb.SheetNames.includes('Booking Codes')) {
            XLSX.utils.book_append_sheet(wb, ws, 'Booking Codes');
        } else {
            wb.Sheets['Booking Codes'] = ws;
        }

        // Save the file
        XLSX.writeFile(wb, fileName);

        console.log(`Successfully saved booking code ${bookingCode} and all details to Excel`);
        return bookingCode;
    } catch (error) {
        console.error('Error saving to Excel:', error);
        throw error;
    }
}

export async function validationConfirmPage(page, testCase) {
    const logger = new Logger();
    logger.info('Iniciando validación de la página de confirmación');
    
    try {
        // 1. Primero, esperar a que la navegación a la página de confirmación se complete
        const urlIsCorrect = await waitForConfirmationUrl(page);
        
        if (!urlIsCorrect) {
            // Si la URL no es correcta después del tiempo de espera, tomar screenshot y lanzar error
            await page.screenshot({ path: `confirmation-error-${Date.now()}.png` });
            const error = new Error('No se pudo navegar a la página de confirmación');
            error.name = 'NavigationError';
            throw error;
        }
        
        logger.info('Navegación a la página de confirmación completada');
        
        // 2. Añadir esperas adicionales para asegurar que la página esté cargada
        await page.waitForTimeout(3000); // Espera extra para dar tiempo a que todo se cargue
        
        // 3. Determinar el texto de cabecera según el idioma
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
            flightSummaryText = 'Flight Summary';
        }
        
        logger.info(`Buscando sección "${flightSummaryText}" en la página`);
        
        // 4. Comprobar si los elementos de confirmación están presentes
        let flightSummaryExists = false;
        
        // Intentar diferentes estrategias para encontrar el resumen de vuelo
        for (const strategy of ['exact', 'contains', 'role']) {
            try {
                if (strategy === 'exact') {
                    flightSummaryExists = await page.locator(`h5:text("${flightSummaryText}")`).isVisible({ timeout: 5000 });
                } else if (strategy === 'contains') {
                    flightSummaryExists = await page.locator(`h5:has-text("${flightSummaryText}")`).isVisible({ timeout: 5000 });
                } else if (strategy === 'role') {
                    flightSummaryExists = await page.locator('div.mt-5.row').filter({
                        has: page.locator(`h5.module_title:has-text("${flightSummaryText}")`)
                    }).isVisible({ timeout: 5000 });
                }
                
                if (flightSummaryExists) {
                    logger.info(`Sección "${flightSummaryText}" encontrada mediante estrategia: ${strategy}`);
                    break;
                }
            } catch (error) {
                logger.warn(`Error al buscar sección "${flightSummaryText}" con estrategia ${strategy}: ${error.message}`);
            }
        }

        if (!flightSummaryExists) {
            // Si no se encuentra el resumen de vuelo, intentar buscar otros elementos de confirmación
            logger.warn(`No se encontró la sección "${flightSummaryText}", buscando elementos alternativos de confirmación`);
            
            // Tomar una captura de pantalla para depuración
            await page.screenshot({ path: `confirmation-missing-summary-${Date.now()}.png` });
            
            // Comprobar si hay otros elementos que indican que estamos en la página de confirmación
            const hasBookingCode = await page.locator('span.booking-code').isVisible({ timeout: 5000 }).catch(() => false);
            const hasFlightInfo = await page.locator('.flight-info__journey-type').isVisible({ timeout: 5000 }).catch(() => false);
            
            if (hasBookingCode || hasFlightInfo) {
                logger.info('Se encontraron elementos alternativos de confirmación, continuando');
                flightSummaryExists = true;
            } else {
                const error = new Error(`${flightSummaryText} section not found on confirmation page`);
                error.name = 'ValidationError';
                throw error;
            }
        }

        // 5. Esperar a elementos críticos adicionales
        logger.info('Esperando a elementos adicionales de la página de confirmación');
        
        // Usar Promise.allSettled en lugar de Promise.all para evitar fallos si un elemento no está presente
        const results = await Promise.allSettled([
            page.waitForSelector('.flight-info__journey-type', { timeout: 15000 }),
            page.waitForSelector('.flight-info__routes', { timeout: 15000 }),
            page.waitForSelector('.flight-card__footer', { timeout: 15000 })
        ]);
        
        // Verificar qué elementos se pudieron encontrar
        results.forEach((result, index) => {
            const elements = ['.flight-info__journey-type', '.flight-info__routes', '.flight-card__footer'];
            if (result.status === 'fulfilled') {
                logger.info(`Elemento ${elements[index]} encontrado correctamente`);
            } else {
                logger.warn(`No se pudo encontrar el elemento ${elements[index]}: ${result.reason.message}`);
            }
        });

        // 6. Extraer el código de reserva
        logger.info('Extrayendo código de reserva');
        let bookingCode;
        
        try {
            const bookingCodeElement = await page.locator('span.booking-code').first();
            bookingCode = await bookingCodeElement.textContent();
            logger.info(`Código de reserva extraído: ${bookingCode}`);
        } catch (error) {
            logger.error(`Error al extraer código de reserva: ${error.message}`);
            // Comprobar si hay algún elemento con clase booking-code o similar
            const bookingElements = await page.locator('[class*="booking-code"], [class*="bookingCode"], [class*="pnr"]').count();
            
            if (bookingElements > 0) {
                // Intentar obtener el código con un selector más genérico
                bookingCode = await page.locator('[class*="booking-code"], [class*="bookingCode"], [class*="pnr"]').first().textContent();
                logger.info(`Código de reserva extraído con selector alternativo: ${bookingCode}`);
            } else {
                throw new Error('No se pudo extraer el código de reserva');
            }
        }

        // 7. Obtener datos adicionales del vuelo si es posible
        let flightDetails = {};
        try {
            // Intentar obtener datos de fecha/hora
            const dateElements = await page.locator('.flight-card__date').allTextContents();
            if (dateElements.length > 0) {
                flightDetails.departureDate = dateElements[0];
                if (dateElements.length > 1) {
                    flightDetails.returnDate = dateElements[1];
                }
            }
            
            // Intentar obtener números de vuelo
            const flightNumberElements = await page.locator('.flight-card__flight-number').allTextContents();
            if (flightNumberElements.length > 0) {
                flightDetails.flightNumbers = flightNumberElements.join(', ');
            }
            
            logger.info('Detalles de vuelo extraídos de la página de confirmación:', flightDetails);
        } catch (error) {
            logger.warn(`No se pudieron extraer todos los detalles del vuelo: ${error.message}`);
        }

        // 8. Combinar los datos y guardar en Excel
        const enrichedTestCase = {
            ...testCase,
            flightDetails: {
                ...testCase.flightDetails,
                confirmation: flightDetails
            }
        };

        // 9. Guardar en Excel
        await saveBookingCodeToExcel(bookingCode, enrichedTestCase);
        logger.info('Información guardada exitosamente en Excel');

        return {
            success: true,
            bookingCode
        };
    } catch (error) {
        logger.error(`Validación de página de confirmación fallida: ${error.message}`);
        error.fatal = true;
        throw error;
    }
}