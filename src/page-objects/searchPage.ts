import { getApiResponse, transformApiResponse, postApiResponse} from '../utils/apiHelper';
import { formatDateWithOrdinal } from './basePage';
import {Money, CabinClass, CabinType} from '../fixtures/userData'

export async function selectCountryAndDate(page, apiData, origin, destination, calendarIndex = 0) {
    try {
        // Llamada a la API para obtener fechas disponibles
        const apiResponse = await getApiResponse(apiData.baseUrl, origin, destination, apiData.definition);
        const transformedDates = transformApiResponse(apiResponse);
  
        // Calcular la fecha actual, el umbral de un mes y dos meses adelante
        const today = new Date();
        const oneMonthLater = new Date(today);
        oneMonthLater.setMonth(today.getMonth() + 1);
  
        const twoMonthsLater = new Date(today);
        twoMonthsLater.setMonth(today.getMonth() + 2);
  
        // Generar una fecha aleatoria entre 1 y 2 meses a partir de hoy
        const randomTime = new Date(today.getTime() + Math.random() * (twoMonthsLater.getTime() - oneMonthLater.getTime()));
  
        // Buscar la fecha más cercana a la fecha aleatoria generada
        const selectedDate = transformedDates.find(date => {
            const dateObj = new Date(date.year, date.month - 1, date.value);
            return dateObj >= randomTime;
        });
  
        if (!selectedDate) {
            throw new Error('No se encontró una fecha adecuada en el rango.');
        }
  
        // Asegurarse de que el mes actual en el selector sea el correcto
        const currentMonthLocator = page.locator('.react-datepicker__current-month').nth(calendarIndex);
        let currentMonthLabel = await currentMonthLocator.textContent();
        const targetMonth = new Date(selectedDate.year, selectedDate.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  
        while (currentMonthLabel !== targetMonth) {
            await page.locator('button.react-datepicker__navigation--next').nth(calendarIndex).click();
            currentMonthLabel = await currentMonthLocator.textContent();
        }
  
        // Formatear y seleccionar la fecha
        const formattedDateLabel = 'Choose ' + formatDateWithOrdinal(selectedDate) + ',';
        await page.getByLabel(formattedDateLabel).click();
  
        return selectedDate; // Retornar la fecha seleccionada
    } catch (error) {
        console.error('Error al seleccionar país y fecha:', error.message);
        throw error;
    }
  }
  

  export async function selectRoundTripDates(page, apiData, origin, destination, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType, DataADT, DataCHD, DataINL, calendarIndex = 0) {
    let selectedDepartureDate, selectedReturnDate;

    const passengers = {};

    // Add to passengers object conditionally based on the length of DataADT, DataCHD, and DataINL
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
        // Seleccionar fecha de salida (primer calendario)
        selectedDepartureDate = await selectCountryAndDate(page, apiData, origin, destination, 0);

        let formattedDate = `${selectedDepartureDate.year}-${String(selectedDepartureDate.month).padStart(2, '0')}-${String(selectedDepartureDate.value).padStart(2, '0')}`;

        const body = {
          "Passengers": passengers,
          "Preferences": {
           "Currency": Money
          },
          "Journeys": [
            {
              "Origin": origin,
              "Destination": destination,
              "DepartureDate": formattedDate
            }
          ]
        };
        const response = await postApiResponse('https://apis-dev.airpricing.net', body);

        // Check if the response contains Economy or Premium with the correct outboundFlightClass and outboundFlightType
        let validCabinType = false;

        response.journeys[0].fares.forEach(fare => {
            const cabinClassMatch = (outboundFlightClass === CabinClass.ECONOMY && fare.cabinType === "Economy") ||
                                    (outboundFlightClass === CabinClass.PREMIUM && fare.cabinType === "PremiumEconomy");

            const cabinTypeMatch = (outboundFlightType === CabinType.LIGHT && fare.fareFamily === "LIGHT") ||
                                   (outboundFlightType === CabinType.COMFORT && fare.fareFamily === "COMFORT") ||
                                   (outboundFlightType === CabinType.EXTRA && fare.fareFamily === "EXTRA");

            if (cabinClassMatch && cabinTypeMatch) {
                validCabinType = true;
            }
        });

        // If no matching cabin class or type is found, recalculate the departure date
        if (!validCabinType) {
            selectedDepartureDate = await selectCountryAndDate(page, apiData, origin, destination, 0);  // Recalculate the date
            formattedDate = `${selectedDepartureDate.year}-${String(selectedDepartureDate.month).padStart(2, '0')}-${String(selectedDepartureDate.value).padStart(2, '0')}`;
            body.Journeys[0].DepartureDate = formattedDate;
        }

        // Llamada a la API para fechas de regreso (cambiar origen y destino)
        const apiResponse = await getApiResponse(apiData.baseUrl, destination, origin, apiData.definition);
        const transformedReturnDates = transformApiResponse(apiResponse);

        // Crear un objeto de fecha para la fecha de salida
        const departureDateObj = new Date(selectedDepartureDate.year, selectedDepartureDate.month - 1, selectedDepartureDate.value);

        // Filtrar fechas de regreso para que estén después de la fecha de salida y al menos 7 días después
        const filteredReturnDates = transformedReturnDates.filter(returnDate => {
            const returnDateObj = new Date(returnDate.year, returnDate.month - 1, returnDate.value);
            const differenceInTime = returnDateObj - departureDateObj;
            const differenceInDays = differenceInTime / (1000 * 3600 * 24); // Convertir la diferencia a días
            return returnDateObj > departureDateObj && differenceInDays >= 7; // Asegurarse de que la fecha de regreso sea al menos 7 días después de la de salida
        });

        // Verificar que las fechas de regreso sean válidas y tengan la clase y tipo de vuelo correctos
        let validReturnDate = false;

        while (!validReturnDate && filteredReturnDates.length > 0) {
            selectedReturnDate = filteredReturnDates[0];

            // Verificar que la clase y tipo de vuelo de regreso coincidan
            let validReturnCabinType = false;
            const returnDateObj = new Date(selectedReturnDate.year, selectedReturnDate.month - 1, selectedReturnDate.value);
            
            const bodyReturn = {
              "Passengers": passengers,
              "Preferences": {
               "Currency": Money
              },
              "Journeys": [
                {
                  "Origin": destination,
                  "Destination": origin,
                  "DepartureDate": `${selectedReturnDate.year}-${String(selectedReturnDate.month).padStart(2, '0')}-${String(selectedReturnDate.value).padStart(2, '0')}`
                }
              ]
            };
            const returnResponse = await postApiResponse('https://apis-dev.airpricing.net', bodyReturn);

            returnResponse.journeys[0].fares.forEach(fare => {
                const cabinClassMatch = (returnFlightClass === CabinClass.ECONOMY && fare.cabinType === "Economy") ||
                                        (returnFlightClass === CabinClass.PREMIUM && fare.cabinType === "PremiumEconomy");

                const cabinTypeMatch = (returnFlightType === CabinType.LIGHT && fare.fareFamily === "LIGHT") ||
                                       (returnFlightType === CabinType.COMFORT && fare.fareFamily === "COMFORT") ||
                                       (returnFlightType === CabinType.EXTRA && fare.fareFamily === "EXTRA");

                if (cabinClassMatch && cabinTypeMatch) {
                    validReturnCabinType = true;
                }
            });

            // Si la fecha de regreso no cumple con los requisitos, seleccionar otra fecha de regreso
            if (!validReturnCabinType) {
                filteredReturnDates.shift(); // Eliminar la fecha no válida
            } else {
                validReturnDate = true;
            }
        }

        // Si no se encontró una fecha de regreso válida
        if (!validReturnDate) {
            throw new Error('No se encontró una fecha de regreso válida después de la fecha de salida.');
        }

        // Seleccionar la fecha de regreso válida
        const currentMonthLocator = page.locator('.react-datepicker__current-month').nth(calendarIndex);
        let currentMonthLabel = await currentMonthLocator.textContent();
        const targetMonth = new Date(selectedReturnDate.year, selectedReturnDate.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

        while (currentMonthLabel !== targetMonth) {
            await page.locator('button.react-datepicker__navigation--next').nth(calendarIndex).click();
            currentMonthLabel = await currentMonthLocator.textContent();
        }

        const formattedReturnDateLabel = 'Choose ' + formatDateWithOrdinal(selectedReturnDate) + ',';
        await page.getByLabel(formattedReturnDateLabel).click();

        // Mostrar las fechas seleccionadas
        console.log('Fecha de salida seleccionada:', selectedDepartureDate);
        console.log('Fecha de regreso seleccionada:', selectedReturnDate);

        return { selectedDepartureDate, selectedReturnDate }; // Retornar las fechas seleccionadas
    } catch (error) {
        console.error('Error al gestionar el flujo de ida y vuelta:', error.message);
        throw error;
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


