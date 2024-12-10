import { test, expect } from '@playwright/test';
import {userDataADT, userDataCHD, ticketData, paymentCards, userDataINL} from '../fixtures/userData';
import { entornoData, apiData } from '../fixtures/environmentData';
import { ruteData } from '../fixtures/ruteData';
import { getApiResponse, transformApiResponse } from '../utils/apiHelper';
import { formatDateWithOrdinal, formatDate, extractPhoneWithoutPrefix } from '../page-objects/basePage';

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

    await page.getByRole('button', { name: 'Accept all cookies' }).click();
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

  test('toggleCityButton', async () =>{
    await page.locator('.swap-btn-icon.flight-swap-icon.icon-swap-black').click();
    await page.locator('.swap-btn-icon.flight-swap-icon.icon-swap-black').click();
    
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
    // Ajustando el número de adultos, niños y bebés según las variables

    for (let i = 1; i < ticketData.ADT; i++) {
     // Click the "plus" button for children
      await page.click('.pax-item[data-field="adult"] .js-plus');
    }

    for (let j = 0; j < ticketData.CHD; j++) {
      // Click the "plus" button for children
      await page.click('.pax-item[data-field="child"] .js-plus');
    }

    for (let k = 0; k < ticketData.INL; k++) {
     // Click the "plus" button for children
    await page.click('.pax-item[data-field="infant"] .js-plus');
    }


    await page.locator('#searcher_submit_button').click();

  });

  test('chosseVFlight', async () => {

  await page.waitForTimeout(5000); // Espera 5 segundos

  //ida 
  const outboundFlightClass = userDataADT[0].cabinData?.outboundClassFlight;
  const outboundFlightType = userDataADT[0].cabinData?.outboundTypeFlight;

  await page.click(`div.price-cabin:has-text("${outboundFlightClass}")`);

  // Usar la variable `outboundFlightType` dentro del filtro
  await page.locator('div').filter({ hasText: new RegExp(`^Continue with ${outboundFlightType}`) }).nth(1).click();

  // vuelta
  const returnFlightClass = userDataADT[0].cabinData?.returnClassFlight;
  const returnFlightType = userDataADT[0].cabinData?.returnTypeFlight;

  await page.click(`div.price-cabin:has-text("${returnFlightClass}")`);
  // Luego selecciona la opción de tipo de vuelo de retorno (Light, Comfort, Extra)
  await page.locator('div').filter({ hasText: new RegExp(`^Continue with ${returnFlightType}`) }).nth(1).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  }); 

  test('fillPassengerData', async () => {

    // Suponiendo que ticketData.ADT es la cantidad de adultos
    for (let i = 0; i < ticketData.ADT; i++) {
      // Cambiar el '0' por 'i' para cada adulto
      await page.locator(`#Adult-${i}`).click();
      await page.waitForTimeout(5000); //lo tenemos asi por el combox que falta que se distinga para cada usuario 

      // Completar los datos del adulto correspondiente
      await page.locator(`[name="adults[${i}].name"]`).fill(userDataADT[i].name);
      await page.locator(`[name="adults[${i}].surname"]`).fill(userDataADT[i].surname);
      await page.locator(`[name="adults[${i}].dateOfBirth"]`).fill(formatDate(userDataADT[i].dateOfBirth));

      // Seleccionar la nacionalidad (suponiendo que esto es lo que debe hacerse para cada adulto)
      await page.getByRole('combobox').click();
      await page.getByRole('combobox').fill(userDataADT[i].nationality.substring(0, 3));

      await page.getByLabel(userDataADT[i].nationality).click();

      // Seleccionar el género para el adulto correspondiente
      await page.getByRole('radio', { name: userDataADT[i].gender }).check();

      
        // Comprobamos si hay asistencia
      if (userDataADT[i].assistance.length > 0) {
        // Hacer clic en el elemento para expandir las opciones de asistencia
        await page.locator(`#Adult-${i} .assistant-label`).click();
    
        // Recorrer las opciones de asistencia y seleccionarlas
        for (let j = 0; j < userDataADT[i].assistance.length; j++) {
          const assistanceOption = userDataADT[i].assistance[j];
    
          // Buscar la opción de asistencia y marcarla si existe
          const checkboxLocator = page.locator(`#Adult-${i} .form-check-input + span:has-text("${assistanceOption}")`);
          if (await checkboxLocator.isVisible()) {
            await checkboxLocator.click();  // Marcar la casilla
          } else {
            console.log(`No se encontró la opción de asistencia: ${assistanceOption} para el pasajero ${i}`);
          }
        }
      }
      
      
    }

    for (let i = 0; i < ticketData.CHD; i++) {
      // Cambiar el '0' por 'i' para cada adulto
      await page.locator(`#Child-${i}`).click();
      await page.waitForTimeout(5000); //lo tenemos asi por el combox que falta que se distinga para cada usuario 

      // Completar los datos del adulto correspondiente
      await page.locator(`[name="children[${i}].name"]`).fill(userDataCHD[i].name);
      await page.locator(`[name="children[${i}].surname"]`).fill(userDataCHD[i].surname);
      await page.locator(`[name="children[${i}].dateOfBirth"]`).fill(formatDate(userDataCHD[i].dateOfBirth));

      // Seleccionar la nacionalidad (suponiendo que esto es lo que debe hacerse para cada adulto)
      await page.getByRole('combobox').click();
      await page.getByRole('combobox').fill(userDataCHD[i].nationality.substring(0, 3));

      await page.getByLabel(userDataCHD[i].nationality).click();

       // Comprobamos si hay asistencia
       if (userDataCHD[i].assistance.length > 0) {
        // Hacer clic en el elemento para expandir las opciones de asistencia
        await page.locator(`#Child-${i} .assistant-label`).click();
    
        // Recorrer las opciones de asistencia y seleccionarlas
        for (let j = 0; j < userDataCHD[i].assistance.length; j++) {
          const assistanceOption = userDataCHD[i].assistance[j];
    
          // Buscar la opción de asistencia y marcarla si existe
          const checkboxLocator = page.locator(`#Child-${i} .form-check-input + span:has-text("${assistanceOption}")`);
          if (await checkboxLocator.isVisible()) {
            await checkboxLocator.click();  // Marcar la casilla
          } else {
            console.log(`No se encontró la opción de asistencia: ${assistanceOption} para el pasajero ${i}`);
          }
        }
      }
    }

    for (let i = 0; i < ticketData.INL; i++) {
      // Cambiar el '0' por 'i' para cada adulto
      await page.locator(`#Infant-${i}`).click();
      await page.waitForTimeout(5000); //lo tenemos asi por el combox que falta que se distinga para cada usuario 

      // Completar los datos del adulto correspondiente
      await page.locator(`[name="infants[${i}].name"]`).fill(userDataINL[i].name);
      await page.locator(`[name="infants[${i}].surname"]`).fill(userDataINL[i].surname);
      await page.locator(`[name="infants[${i}].dateOfBirth"]`).fill(formatDate(userDataINL[i].dateOfBirth));

      // Seleccionar la nacionalidad (suponiendo que esto es lo que debe hacerse para cada adulto)
      await page.getByRole('combobox').click();
      await page.getByRole('combobox').fill(userDataINL[i].nationality.substring(0, 3));

      await page.getByLabel(userDataINL[i].nationality).click();
    }

    await page.waitForTimeout(5000); // Espera 5 segundos
  
    await page.locator('#contact').click();
  
    await page.locator('input[name="contactDetails.phone"]').fill(userDataADT[0].phone);
    await page.locator('input[name="contactDetails.email"]').fill(userDataADT[0].email);

    await page.getByRole('button', { name: 'Complete your purchase' }).click();
    await page.waitForTimeout(5000); // Espera 5 segundos
  
   
  });

  test('pay', async () =>{

     // Verifica y espera a que el iframe esté presente
     await page.waitForSelector('iframe[title="Iframe for expiry date"]');
  
     // Localiza el iframe y su contenido
     const iframe = page.frame({ url: /securedFields/ }); // Buscar iframe por URL parcial
     if (iframe) {
         console.log("Iframe encontrado.");
         await iframe.locator('input[data-fieldtype="encryptedCardNumber"]').fill(paymentCards[0].cardNumber);
     } else {
         console.log("Iframe no encontrado.");
     }
   
     await page.locator('iframe[title="Iframe for expiry date"]').contentFrame().getByLabel('Expiry date').fill(paymentCards[0].expiryDate);
     await page.locator('iframe[title="Iframe for security code"]').contentFrame().getByLabel('Security code').fill(paymentCards[0].cvc);
   
     await page.getByLabel('Name on card').click();
     await page.getByLabel('Name on card').fill('sofia');
       
   
     await page.getByRole('checkbox').check();
   
     await page.getByRole('button', { name: 'Pay $' }).click();
   
     await page.waitForTimeout(10000); // Espera 10 segundos
  })

  

});
