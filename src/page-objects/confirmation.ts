import * as XLSX from 'xlsx';
import { existsSync } from 'fs';

async function saveBookingCodeToExcel(bookingCode, testCase) {
    try {
        const fileName = 'booking_codes.xlsx';
        let wb;
        let ws;

        // Extract all the relevant information from the test case
        const {
            flightConfig,
            passengerConfig,
            paymentInfo
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

async function waitForConfirmationUrl(page, timeout = 10000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        const currentUrl = page.url();
        if (currentUrl.includes('/nwe/confirmation/')) {
            return true;
        }
        await page.waitForTimeout(100);
    }
    return false;
}

export async function validationConfirmPage(page, testCase) {
    try {
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

        const flightSummaryExists = await page.locator('div.mt-5.row').filter({
            has: page.locator(`h5.module_title:has-text("${flightSummaryText}")`)
        }).isVisible();

        if (!flightSummaryExists) {
            const error = new Error(`${flightSummaryText} section not found on confirmation page`);
            error.name = 'ValidationError';
            throw error;
        }

        // And then in your function, before verifying isConfirmationUrl:
        const urlIsCorrect = await waitForConfirmationUrl(page);
        
        if (!urlIsCorrect) {
            const error = new Error('Not on confirmation page URL after waiting');
            error.name = 'ValidationError';
            throw error;
        }

        await page.waitForTimeout(2000);

        await Promise.all([
            page.waitForSelector('.flight-info__journey-type', { timeout: 10000 }),
            page.waitForSelector('.flight-info__routes', { timeout: 10000 }),
            page.waitForSelector('.flight-card__footer', { timeout: 10000 })
        ]);

        const bookingCodeElement = await page.locator('span.booking-code').first();
        const bookingCode = await bookingCodeElement.textContent();

        // Get flight details (if we have access to them at this point)
        let flightDetails = {};
        try {
            // Try to get departure/arrival dates and times
            const dateElements = await page.locator('.flight-card__date').allTextContents();
            if (dateElements.length > 0) {
                flightDetails.departureDate = dateElements[0];
                if (dateElements.length > 1) {
                    flightDetails.returnDate = dateElements[1];
                }
            }
            
            // Try to get flight numbers
            const flightNumberElements = await page.locator('.flight-card__flight-number').allTextContents();
            if (flightNumberElements.length > 0) {
                flightDetails.flightNumbers = flightNumberElements.join(', ');
            }
        } catch (error) {
            console.log('Could not extract all flight details from confirmation page:', error);
        }

        // Combine testCase with flightDetails
        const enrichedTestCase = {
            ...testCase,
            flightDetails
        };

        // Save all information to Excel
        await saveBookingCodeToExcel(bookingCode, enrichedTestCase);

        return {
            success: true,
            bookingCode
        };
    } catch (error) {
        console.error('Confirmation page validation failed:', error.message);
        error.fatal = true;
        throw error;
    }
}