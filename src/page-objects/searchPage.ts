import { getApiResponse, transformApiResponse, postApiResponse} from '../utils/apiHelper';
import { formatDateWithOrdinal } from './basePage';
import {Money, CabinClass, CabinType, rangeStartMonthsExport, rangeEndMonthsExport} from '../fixtures/userData'


export async function selectCountryAndDate(page, apiData, origin, destination, calendarIndex = 0, startDate = null, rangeStartMonths, rangeEndMonths ) {
    try {
        // Llamada a la API para obtener fechas disponibles
        const apiResponse = await getApiResponse(apiData.baseUrl, origin, destination, apiData.definition);
        const transformedDates = transformApiResponse(apiResponse);

        // Calcular la fecha inicial (si no se pasa, usar hoy) y los límites de rango en meses
        const today = startDate ? new Date(startDate) : new Date();
        const rangeStartDate = new Date(today);
        rangeStartDate.setMonth(today.getMonth() + rangeStartMonths);

        const rangeEndDate = new Date(today);
        rangeEndDate.setMonth(today.getMonth() + rangeEndMonths);

        // Generar una fecha aleatoria dentro del rango especificado
        const randomTime = new Date(rangeStartDate.getTime() + Math.random() * (rangeEndDate.getTime() - rangeStartDate.getTime()));

        // Buscar la fecha más cercana a la fecha aleatoria generada
        const selectedDate = transformedDates.find(date => {
            const dateObj = new Date(date.year, date.month - 1, date.value);
            return dateObj >= randomTime;
        });

        if (!selectedDate) {
            throw new Error('No se encontró una fecha adecuada en el rango.');
        }

        // Asegurarse de que el mes actual en el selector sea el correcto
        const currentMonthLocator = page.locator('.react-datepicker__current-month').nth(13);

        let currentMonthLabel = await currentMonthLocator.textContent();
        const targetMonth = new Date(selectedDate.year, selectedDate.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

        while (currentMonthLabel !== targetMonth) {
            await page.getByRole('button', { name: 'Next Month' }).click();
            //await page.locator('button.react-datepicker__navigation--next').nth(calendarIndex).click();
            
            currentMonthLabel = await currentMonthLocator.textContent();
        }

        return selectedDate; // Retornar la fecha seleccionada
    } catch (error) {
        console.error('Error al seleccionar país y fecha:', error.message);
        throw error;
    }
}

export async function selectRoundTripDates(page, apiData, origin, destination, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType, DataADT, DataCHD, DataINL, oneTrip = false, 
    calendarIndex = 0, rangeStartMonths = rangeStartMonthsExport, rangeEndMonths = rangeEndMonthsExport) {
    let selectedDepartureDate, selectedReturnDate, transformedDates;

    const passengers = {};

    // Add passenger data
    if (DataADT.length > 0) {
        passengers.ADT = DataADT.length;
    }
    if (DataCHD.length > 0) {
        passengers.CHD = DataCHD.length;
    }
    if (DataINL.length > 0) {
        passengers.INF = DataINL.length;
    }

    try {
        // Select departure date
        
        selectedDepartureDate = await selectCountryAndDate(page, apiData, origin, destination, 0, null, rangeStartMonths, rangeEndMonths);
        let formattedDepartureDate = `${selectedDepartureDate.year}-${String(selectedDepartureDate.month).padStart(2, '0')}-${String(selectedDepartureDate.value).padStart(2, '0')}`;

        // Validate cabin class and type for outbound flight
        const outboundBody = {
            "Passengers": passengers,
            "Preferences": {
                "Currency": Money
            },
            "Journeys": [
                {
                    "Origin": origin,
                    "Destination": destination,
                    "DepartureDate": formattedDepartureDate
                }
            ]
        };

        const outboundResponse = await postApiResponse('https://apis-dev.airpricing.net', outboundBody);
        validateCabinType(outboundResponse, outboundFlightClass, outboundFlightType);

        const formattedDepartureLabel = 'Choose ' + formatDateWithOrdinal(selectedDepartureDate) + ',';
        const elements = await page.getByLabel(formattedDepartureLabel).all();
        await elements[elements.length - 1].click();

        if (!oneTrip) {
            // Select return date
            const transformedReturnDates = transformApiResponse(await getApiResponse(apiData.baseUrl, destination, origin, apiData.definition));

            selectedReturnDate = transformedReturnDates.find(date => {
                const dateObj = new Date(date.year, date.month - 1, date.value);
                const departureDateObj = new Date(selectedDepartureDate.year, selectedDepartureDate.month - 1, selectedDepartureDate.value);
                return dateObj > departureDateObj;
            });

            if (!selectedReturnDate) {
                throw new Error('No suitable return date found.');
            }

            let formattedReturnDate = `${selectedReturnDate.year}-${String(selectedReturnDate.month).padStart(2, '0')}-${String(selectedReturnDate.value).padStart(2, '0')}`;

            const returnBody = {
                "Passengers": passengers,
                "Preferences": {
                    "Currency": Money
                },
                "Journeys": [
                    {
                        "Origin": destination,
                        "Destination": origin,
                        "DepartureDate": formattedReturnDate
                    }
                ]
            };

            const returnResponse = await postApiResponse('https://apis-dev.airpricing.net', returnBody);
            validateCabinType(returnResponse, returnFlightClass, returnFlightType);
            await page.waitForTimeout(2000);

            // Check if departure and return dates are in different months
            const isDifferentMonth = selectedDepartureDate.month !== selectedReturnDate.month;
            
            const formattedReturnLabel = 'Choose ' + formatDateWithOrdinal(selectedReturnDate) + ',';
            const elements2 = await page.getByLabel(formattedReturnLabel).all();
            
            // Use different index based on whether months are different
           
            await elements2[elements2.length - 1].click();
            

            console.log('Selected departure date:', selectedDepartureDate);
            console.log('Selected return date:', selectedReturnDate);

            return { selectedDepartureDate, selectedReturnDate };
        } else {
            console.log('Selected departure date:', selectedDepartureDate);
            return selectedDepartureDate;
        }
    } catch (error) {
        console.error('Error managing round trip flow:', error.message);
        throw error;
    }
}

// Función para validar clase de cabina y tipo
function validateCabinType(response, flightClass, flightType) {
    let validCabinType = false;

    response.journeys[0].fares.forEach(fare => {
        const cabinClassMatch = (flightClass === CabinClass.ECONOMY && fare.cabinType === "Economy") ||
                                (flightClass === CabinClass.PREMIUM && fare.cabinType === "PremiumEconomy");

        const cabinTypeMatch = (flightType === CabinType.LIGHT && fare.fareFamily === "LIGHT") ||
                               (flightType === CabinType.COMFORT && fare.fareFamily === "COMFORT") ||
                               (flightType === CabinType.EXTRA && fare.fareFamily === "EXTRA") ||
                               (flightClass === CabinClass.PREMIUM &&
                                ["PREMIUM-LIGHT", "PREMIUM-COMFORT", "PREMIUM-EXTRA"].includes(fare.fareFamily));

        if (cabinClassMatch && cabinTypeMatch) {
            validCabinType = true;
        }
    });

    if (!validCabinType) {
        throw new Error('No se encontró un tipo de cabina válido.');
    }
}







  

  
// Función para ajustar la cantidad de pasajeros
export async function adjustPassengerCount(page, DataADT, DataCHD, DataINL) {
  console.log('Ajustando número de pasajeros');

  // Ajustar adultos
  for (let i = 1; i < DataADT.length; i++) {
      await page.click('.pax-item[data-field="adult"] .js-plus');
  }

  // Ajustar niños
  for (let j = 0; j < DataCHD.length; j++) {
      await page.click('.pax-item[data-field="child"] .js-plus');
  }

  // Ajustar bebés
  for (let k = 0; k < DataINL.length; k++) {
      await page.click('.pax-item[data-field="infant"] .js-plus');
  }
}


