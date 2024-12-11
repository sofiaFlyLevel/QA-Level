import { getApiResponse, transformApiResponse } from '../utils/apiHelper';
import { formatDateWithOrdinal } from './basePage';

export async function selectCountryAndDate(page, apiData, origin, destination, calendarIndex = 0) {
  try {
      // Llamada a la API para obtener fechas disponibles
      const apiResponse = await getApiResponse(apiData.baseUrl, origin, destination, apiData.definition);
      const transformedDates = transformApiResponse(apiResponse);

      // Calcular la fecha actual y el umbral de un mes adelante
      const today = new Date();
      const oneMonthLater = new Date(today);
      oneMonthLater.setMonth(today.getMonth() + 1);

      // Encontrar la fecha más cercana al umbral de un mes
      const selectedDate = transformedDates.find(date => {
          const dateObj = new Date(date.year, date.month - 1, date.value);
          return dateObj >= oneMonthLater;
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

export async function selectRoundTripDates(page, apiData, origin, destination,  calendarIndex = 0) {
  let selectedDepartureDate, selectedReturnDate;

  try {
      // Seleccionar fecha de salida (primer calendario)
      selectedDepartureDate = await selectCountryAndDate(page, apiData, origin, destination, 0);

      // Llamada a la API para fechas de regreso (cambiar origen y destino)
      const apiResponse = await getApiResponse(apiData.baseUrl, destination, origin, apiData.definition);
      const transformedReturnDates = transformApiResponse(apiResponse);

      // Filtrar fechas de regreso para que sean posteriores a la fecha de salida
      const filteredReturnDates = transformedReturnDates.filter(returnDate => {
          const returnDateObj = new Date(returnDate.year, returnDate.month - 1, returnDate.value);
          const departureDateObj = new Date(selectedDepartureDate.year, selectedDepartureDate.month - 1, selectedDepartureDate.value);
          return returnDateObj > departureDateObj;
      });

      // Seleccionar la primera fecha válida de regreso (segundo calendario)
      if (filteredReturnDates.length > 0) {
          selectedReturnDate = filteredReturnDates[0];

          const currentMonthLocator = page.locator('.react-datepicker__current-month').nth(calendarIndex);
          let currentMonthLabel = await currentMonthLocator.textContent();
          const targetMonth = new Date(selectedReturnDate.year, selectedReturnDate.month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });

          while (currentMonthLabel !== targetMonth) {
              await page.locator('button.react-datepicker__navigation--next').nth(1).click();
              currentMonthLabel = await currentMonthLocator.textContent();
          }

          const formattedReturnDateLabel = 'Choose ' + formatDateWithOrdinal(selectedReturnDate) + ',';
          await page.getByLabel(formattedReturnDateLabel).click();
      } else {
          console.error('No se encontraron fechas de regreso válidas después de la fecha de salida.');
      }

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