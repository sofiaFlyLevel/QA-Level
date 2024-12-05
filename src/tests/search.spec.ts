import { test, expect } from '@playwright/test';
import { userData } from '../fixtures/userData';
import { entornoData, apiData } from '../fixtures/environmentData';
import { ruteData } from '../fixtures/ruteData';
import { getApiResponse, transformApiResponse } from '../utils/apiHelper';
import { formatDateWithOrdinal } from '../page-objects/basePage';

// Define variables que se compartirán entre los tests
let Origin = ruteData.origin;
let Destination = ruteData.destination;

test.describe('chooseTicket', () => {
  let page;

  // Configuración inicial antes de ejecutar los tests
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();

    // Abre la página solo una vez al inicio
    await page.goto(entornoData.pre.url);
  });

  // Cierra el contexto y la página al finalizar todos los tests
  test.afterAll(async () => {
    await page.close();
  });

  test('chooseCity', async () => {
    await page.locator('div.searcher-input.station-selector.origin').click();
    await page.locator('div.iata', { hasText: Origin }).nth(0).click();
    await page.locator('div.iata').filter({ hasText: Destination }).nth(1).click();

  });

  //mirar que sea el mes que estamos
  //la vuelta es lo mismo pero intercambiando origen-destino 
  // escoger la fecha de vuelta, más tarde de la de ida 
  // guadar la informacion de las fechas selecionadas en un una variable 

  test('chooseDate', async () => {
    let selectedDepartureDate, selectedReturnDate; // Declare both variables outside the try block
  
    try {
      // First API call with the original Origin and Destination
      const apiResponse1 = await getApiResponse(apiData.baseUrl, Origin, Destination, apiData.definition);
      const transformedArray1 = transformApiResponse(apiResponse1);
  
      // Select the first date from transformedArray1 (departure date)
      const firstDate = 'Choose ' + formatDateWithOrdinal(transformedArray1[0]) + ','; 
      // console.log('Departure Dates:', transformedArray1);
  
      // Store selected departure date
      selectedDepartureDate = transformedArray1[0];
  
      // Choose the first available date
      await page.getByLabel(firstDate).click();
  
      // Second API call with the swapped Origin and Destination (return trip)
      const apiResponse2 = await getApiResponse(apiData.baseUrl, Destination, Origin, apiData.definition);
      const transformedArray2 = transformApiResponse(apiResponse2);
  
      // Filter return dates to ensure they are later than the departure date
      const filteredReturnDates = transformedArray2.filter(returnDate => {
        const returnMonthIndex = parseInt(returnDate.month, 10);
        const returnDay = returnDate.value;
  
        const departureMonthIndex = parseInt(selectedDepartureDate.month, 10);
        const departureDay = selectedDepartureDate.value;
  
        // Ensure the return date is later in the same month or in a future month
        return (
          returnMonthIndex > departureMonthIndex || 
          (returnMonthIndex === departureMonthIndex && returnDay > departureDay)
        )
      });
  
      // If there are filtered return dates, select the first available one
      if (filteredReturnDates.length > 0) {
        const secondDate = 'Choose ' + formatDateWithOrdinal(filteredReturnDates[0]) + ',';
        // console.log('Return Dates:', filteredReturnDates);
  
        // Store selected return date
        selectedReturnDate = filteredReturnDates[0];
  
        // Choose the first available return date
        await page.getByLabel(secondDate).click();
      } else {
        console.error('No valid return dates found after the departure date.');
        // You can choose to set a fallback return date if needed:
        // selectedReturnDate = transformedArray2[0]; // For example, pick the first return date
      }
  
      // Store the selected departure and return dates (in the desired format)
      console.log('Selected Departure Date:', selectedDepartureDate);
      console.log('Selected Return Date:', selectedReturnDate);
  
    } catch (error) {
      console.error('Error al obtener la respuesta de la API:', error.message);
    }
  
    
  });
  
 

  test('choosePassage', async () => {
    // Puedes agregar interacciones adicionales aquí
    console.log('Elegir pasaje ejecutado');
    await page.locator('div').filter({ hasText: /^Adults12\+ years1$/ }).locator('span').nth(2).click();
    await page.locator('div').filter({ hasText: /^Children2 - 11 years0$/ }).locator('span').nth(2).click();
    await page.locator('div').filter({ hasText: /^Infants7 days - 23 months0$/ }).locator('span').nth(2).click();

    await page.locator('#searcher_submit_button').click();

  });


});
