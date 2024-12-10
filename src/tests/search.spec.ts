import { test, expect } from '@playwright/test';
import {userDataADT, userDataCHD, ticketData, paymentCards} from '../fixtures/userData';
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
    await page.goto(entornoData.dev.url);

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

  // await page.getByRole('button', { name: `${returnFlightClass} Icon ${returnFlightClass} $` }).click();

// Luego selecciona la opción de tipo de vuelo de retorno (Light, Comfort, Extra)
await page.locator('div').filter({ hasText: new RegExp(`^Continue with ${returnFlightType}`) }).nth(1).click();

// await page.locator('div').filter({ hasText: `^Continue with ${returnFlightType}` }).nth(1).click();

  // await page.locator('.icon-chevron-up').click();
  await page.getByRole('button', { name: 'Continue' }).click();

  // await page.waitForTimeout(5000); // Espera 5 segundos


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
    }


  // await page.locator('#Adult-0').click();

  //   await page.locator('[name="adults[0].name"]').fill(userDataADT[0].name);
  //   await page.locator('[name="adults[0].surname"]').fill(userDataADT[0].surname);
  //   await page.locator('[name="adults[0].dateOfBirth"]').fill(formatDate(userDataADT[0].dateOfBirth));
  //   await page.getByRole('combobox').click();
  //   await page.getByLabel('Algeria').click();
  //   await page.getByRole('radio', { name: userDataADT[0].genere}).check();


  // await page.locator('#Adult-1').click();

  // await page.locator('.d-flex > .icon-chevron-right').first().click();

  await page.waitForTimeout(5000); // Espera 5 segundos


  await page.getByRole('textbox', { name: 'Write name' }).click();
  await page.getByRole('textbox', { name: 'Write name' }).fill(userDataADT[1].nombre);
  await page.getByRole('textbox', { name: 'Write surname' }).click();
  await page.getByRole('textbox', { name: 'Write surname' }).fill(userDataADT[1].apellido);
  await page.getByRole('textbox', { name: 'MM/DD/YYYY' }).click();
  await page.getByRole('textbox', { name: 'MM/DD/YYYY' }).fill(formatDate(userDataADT[1].fecha_nacimiento));
  await page.getByRole('combobox', { name: 'Select a country' }).click();
  await page.getByRole('combobox', { name: 'Select a country' }).fill('Spa');
  await page.getByLabel('Spain').click();
  await page.getByRole('radio', { name: 'Male', exact: true }).check();
  await page.locator('#Child-0 > .px-4 > .card-title > div > .icon-chevron-right').click();

  await page.waitForTimeout(5000); // Espera 5 segundos

    await page.getByRole('textbox', { name: 'Write name' }).click();
    await page.getByRole('textbox', { name: 'Write name' }).fill(userDataCHD[0].nombre);
    await page.getByRole('textbox', { name: 'Write surname' }).click();
    await page.getByRole('textbox', { name: 'Write surname' }).fill(userDataCHD[0].apellido);
    await page.getByRole('textbox', { name: 'MM/DD/YYYY' }).dblclick();
    await page.getByRole('textbox', { name: 'MM/DD/YYYY' }).fill(formatDate(userDataCHD[0].fecha_nacimiento));
    await page.getByRole('combobox', { name: 'Select a country' }).click();
    await page.getByRole('combobox', { name: 'Select a country' }).fill('b');
    await page.getByLabel('Aruba').click();
    await page.locator('#Child-0 span').filter({ hasText: 'Do you require personal' }).locator('span').click();
    await page.getByRole('checkbox', { name: 'Hearing difficulty' }).check();
    await page.getByRole('checkbox', { name: 'Visual difficulty' }).check();
    await page.getByRole('checkbox', { name: 'Intellectual disability' }).check();
  
  
    // await page.locator('#Infant-0 > .px-4 > .card-title > div > .icon-chevron-right').click();
    // await page.waitForTimeout(5000); // Espera 5 segundos
  
    // await page.getByRole('textbox', { name: 'Write name' }).click();
    // await page.getByRole('textbox', { name: 'Write name' }).fill('kama');
    // await page.getByRole('textbox', { name: 'Write surname' }).click();
    // await page.getByRole('textbox', { name: 'Write surname' }).fill('homa');
    // await page.getByRole('textbox', { name: 'MM/DD/YYYY' }).dblclick();
    // await page.getByRole('textbox', { name: 'MM/DD/YYYY' }).fill('08/01/2023_');
    // await page.getByRole('combobox', { name: 'Select a country' }).click();
    // await page.getByRole('combobox', { name: 'Select a country' }).fill('f');
    // await page.getByLabel('Burkina Faso').click();
  
    await page.locator('#contact > .px-4 > .card-title > .d-flex > .icon-chevron-right').click();
  
    await page.getByPlaceholder('123456789').click();
    await page.getByPlaceholder('123456789').fill(extractPhoneWithoutPrefix(userDataADT[0].phone));
    await page.getByPlaceholder('abcde@example.com').click();
    await page.getByPlaceholder('abcde@example.com').fill(userDataADT[0].email);
    await page.getByRole('button', { name: 'Complete your purchase' }).click();
    await page.waitForTimeout(5000); // Espera 5 segundos
  
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
  });
  

});
