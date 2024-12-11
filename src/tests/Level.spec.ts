import { test, expect } from '@playwright/test';
import { userDataADT, userDataCHD, userDataINL, CabinClass, CabinType, paymentCards} from '../fixtures/userData';
import { entornoData, apiData } from '../fixtures/environmentData';
import { ruteData } from '../fixtures/ruteData';
import {fillPassengerData} from '../page-objects/PassengerPage'
import {selectRoundTripDates, adjustPassengerCount} from '../page-objects/searchPage'
import {selectFlights} from '../page-objects/FlightPage'
import {payWithCard} from '../page-objects/paymentPage'
// import {handleErrorWithScreenshot} from '../page-objects/basePage'
import fs from 'fs';


let ENTORNO = entornoData.pre.url; 

test.describe('Compra 1 Adulto Economy Light - Economy Light - Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
  let payCardData = paymentCards[0]; 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.LIGHT;

  // vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.LIGHT;


  // Configuración inicial antes de ejecutar los tests
  test.beforeAll(async ({ browser }) => {
    // Crear la carpeta si no existe
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }
    const context = await browser.newContext();
    page = await context.newPage();

    // Abre la página solo una vez al inicio
    await page.goto(ENTORNO);

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

    //comprobar que el destino es el correcto 
    
  });

  //mirar que sea el mes que estamos
  //la vuelta es lo mismo pero intercambiando origen-destino 
  // escoger la fecha de vuelta, más tarde de la de ida 
  // guadar la informacion de las fechas selecionadas en un una variable 

  test('chooseDate', async () => {
    const tripDates = await selectRoundTripDates(page, apiData, Origin, Destination);

    // Acceder a las fechas seleccionadas
    const departureDate = tripDates.selectedDepartureDate;
    const returnDate = tripDates.selectedReturnDate;

    // Mostrar las fechas seleccionadas en la consola (opcional)
// console.log('Fecha de salida:', departureDate);
// console.log('Fecha de regreso:', returnDate);
  });
  
 

  test('choosePassage', async () => {
    await adjustPassengerCount(page, DataADT, DataCHD, DataINL); 

    await page.locator('#searcher_submit_button').click();

  });

  test('chosseFlights', async () => {

  await selectFlights(page, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType); 

  await page.getByRole('button', { name: 'Continue' }).click();

  }); 

  test('fillPassengerData', async () => {
    try {
      await fillPassengerData(page, DataADT, DataCHD, DataINL);
    } catch (error) {
      // await handleErrorWithScreenshot(page, error, 'fillPassengerData');
        console.error('Error al llenar datos de pasajeros:', error);
    }

    await page.getByRole('button', { name: 'Complete your purchase' }).click();
    await page.waitForTimeout(5000); // Espera 5 segundos
     
  });

  test('payWithCard', async () => {

    await payWithCard(page, payCardData); 
   
    await page.waitForTimeout(10000); // Espera 10 segundos
  }); 

  

});



test.describe('Compra 2 Adulto (El mismo) Economy Light - Economy Light - Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0], userDataADT[0]]; 
  let DataCHD = []; //userDataCHD[0]
  let DataINL = []; //userDataINL[0]
  let payCardData = paymentCards[0]; 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.LIGHT;

  // vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.LIGHT;


  // Configuración inicial antes de ejecutar los tests
  test.beforeAll(async ({ browser }) => {
    // Crear la carpeta si no existe
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }
    const context = await browser.newContext();
    page = await context.newPage();

    // Abre la página solo una vez al inicio
    await page.goto(ENTORNO);

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

    //comprobar que el destino es el correcto 
    
  });

  //mirar que sea el mes que estamos
  //la vuelta es lo mismo pero intercambiando origen-destino 
  // escoger la fecha de vuelta, más tarde de la de ida 
  // guadar la informacion de las fechas selecionadas en un una variable 

  test('chooseDate', async () => {
    await selectRoundTripDates(page, apiData, Origin, Destination)
  });
  
 

  test('choosePassage', async () => {
    await adjustPassengerCount(page, DataADT, DataCHD, DataINL); 

    await page.locator('#searcher_submit_button').click();

  });

  test('chosseFlights', async () => {

  await selectFlights(page, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType); 

  await page.getByRole('button', { name: 'Continue' }).click();

  }); 

  test('fillPassengerData', async () => {
    try {
      await fillPassengerData(page, DataADT, DataCHD, DataINL);
    } catch (error) {
      // await handleErrorWithScreenshot(page, error, 'fillPassengerData');
      console.error('Error al llenar datos de pasajeros:', error);
    }

    await page.getByRole('button', { name: 'Complete your purchase' }).click();
    await page.waitForTimeout(5000); // Espera 5 segundos
     
  });

  test('payWithCard', async () => {
    try {
      await payWithCard(page, payCardData); 
    }
    catch (error) {
      // await handleErrorWithScreenshot(page, error, 'payWithCard');
    }
  }); 

  

});

test.describe('Compra 2 Adulto (Diferente) Economy Light - Economy Light - Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0], userDataADT[1]]; 
  let DataCHD = []; 
  let DataINL = []; 
  let payCardData = paymentCards[0]; 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.LIGHT;

  // vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.LIGHT;


  // Configuración inicial antes de ejecutar los tests
  test.beforeAll(async ({ browser }) => {
    // Crear la carpeta si no existe
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }
    const context = await browser.newContext();
    page = await context.newPage();

    // Abre la página solo una vez al inicio
    await page.goto(ENTORNO);

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

    //comprobar que el destino es el correcto 
    
  });

  //mirar que sea el mes que estamos
  //la vuelta es lo mismo pero intercambiando origen-destino 
  // escoger la fecha de vuelta, más tarde de la de ida 
  // guadar la informacion de las fechas selecionadas en un una variable 

  test('chooseDate', async () => {
    await selectRoundTripDates(page, apiData, Origin, Destination)
  });
  
 

  test('choosePassage', async () => {
    await adjustPassengerCount(page, DataADT, DataCHD, DataINL); 

    await page.locator('#searcher_submit_button').click();

  });

  test('chosseFlights', async () => {

  await selectFlights(page, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType); 

  await page.getByRole('button', { name: 'Continue' }).click();

  }); 

  test('fillPassengerData', async () => {
    try {
      await fillPassengerData(page, DataADT, DataCHD, DataINL);
    } catch (error) {
      // await handleErrorWithScreenshot(page, error, 'fillPassengerData');
        console.error('Error al llenar datos de pasajeros:', error);
    }

    await page.getByRole('button', { name: 'Complete your purchase' }).click();
    await page.waitForTimeout(5000); // Espera 5 segundos
     
  });

  test('payWithCard', async () => {

    await payWithCard(page, payCardData); 
   
    await page.waitForTimeout(10000); // Espera 10 segundos
  }); 

  

});


test.describe('Compra 2 Adulto (Diferente) Economy Light - Economy Light - Nombre con caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[1], userDataADT[2]]; 
  let DataCHD = []; 
  let DataINL = []; 
  let payCardData = paymentCards[0]; 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.LIGHT;

  // vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.LIGHT;


  // Configuración inicial antes de ejecutar los tests
  test.beforeAll(async ({ browser }) => {
    // Crear la carpeta si no existe
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }
    const context = await browser.newContext();
    page = await context.newPage();

    // Abre la página solo una vez al inicio
    await page.goto(ENTORNO);

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

    //comprobar que el destino es el correcto 
    
  });

  //mirar que sea el mes que estamos
  //la vuelta es lo mismo pero intercambiando origen-destino 
  // escoger la fecha de vuelta, más tarde de la de ida 
  // guadar la informacion de las fechas selecionadas en un una variable 

  test('chooseDate', async () => {
    await selectRoundTripDates(page, apiData, Origin, Destination)
  });
  
 

  test('choosePassage', async () => {
    await adjustPassengerCount(page, DataADT, DataCHD, DataINL); 

    await page.locator('#searcher_submit_button').click();

  });

  test('chosseFlights', async () => {

  await selectFlights(page, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType); 

  await page.getByRole('button', { name: 'Continue' }).click();

  }); 

  test('fillPassengerData', async () => {
    try {
      await fillPassengerData(page, DataADT, DataCHD, DataINL);
    } catch (error) {
      // await handleErrorWithScreenshot(page, error, 'fillPassengerData');
        console.error('Error al llenar datos de pasajeros:', error);
    }

    await page.getByRole('button', { name: 'Complete your purchase' }).click();
    await page.waitForTimeout(5000); // Espera 5 segundos
     
  });

  test('payWithCard', async () => {

    await payWithCard(page, payCardData); 
   
    await page.waitForTimeout(10000); // Espera 10 segundos
  }); 

  

});

test.describe('Compra 2 Adulto (Diferente) Economy Light - Economy Light - Nombre sin caracteres especiales - Con assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[1], userDataADT[3]]; 
  let DataCHD = []; 
  let DataINL = []; 
  let payCardData = paymentCards[0]; 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.LIGHT;

  // vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.LIGHT;


  // Configuración inicial antes de ejecutar los tests
  test.beforeAll(async ({ browser }) => {
    // Crear la carpeta si no existe
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }
    const context = await browser.newContext();
    page = await context.newPage();

    // Abre la página solo una vez al inicio
    await page.goto(ENTORNO);

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

    //comprobar que el destino es el correcto 
    
  });

  //mirar que sea el mes que estamos
  //la vuelta es lo mismo pero intercambiando origen-destino 
  // escoger la fecha de vuelta, más tarde de la de ida 
  // guadar la informacion de las fechas selecionadas en un una variable 

  test('chooseDate', async () => {
    await selectRoundTripDates(page, apiData, Origin, Destination)
  });
  
 

  test('choosePassage', async () => {
    await adjustPassengerCount(page, DataADT, DataCHD, DataINL); 

    await page.locator('#searcher_submit_button').click();

  });

  test('chosseFlights', async () => {

  await selectFlights(page, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType); 

  await page.getByRole('button', { name: 'Continue' }).click();

  }); 

  test('fillPassengerData', async () => {
    try {
      await fillPassengerData(page, DataADT, DataCHD, DataINL);
    } catch (error) {
      // await handleErrorWithScreenshot(page, error, 'fillPassengerData');
        console.error('Error al llenar datos de pasajeros:', error);
    }

    await page.getByRole('button', { name: 'Complete your purchase' }).click();
    await page.waitForTimeout(5000); // Espera 5 segundos
     
  });

  test('payWithCard', async () => {

    await payWithCard(page, payCardData); 
   
    await page.waitForTimeout(10000); // Espera 10 segundos
  }); 

  

});

test.describe('Compra 2 Adulto (Diferente) Economy Light - Economy Light - Nombre con caracteres especiales - Con assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[4], userDataADT[5]]; 
  let DataCHD = []; 
  let DataINL = []; 
  let payCardData = paymentCards[0]; 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.LIGHT;

  // vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.LIGHT;


  // Configuración inicial antes de ejecutar los tests
  test.beforeAll(async ({ browser }) => {
    // Crear la carpeta si no existe
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }
    const context = await browser.newContext();
    page = await context.newPage();

    // Abre la página solo una vez al inicio
    await page.goto(ENTORNO);

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

    //comprobar que el destino es el correcto 
    
  });

  //mirar que sea el mes que estamos
  //la vuelta es lo mismo pero intercambiando origen-destino 
  // escoger la fecha de vuelta, más tarde de la de ida 
  // guadar la informacion de las fechas selecionadas en un una variable 

  test('chooseDate', async () => {
    await selectRoundTripDates(page, apiData, Origin, Destination)
  });
  
 

  test('choosePassage', async () => {
    await adjustPassengerCount(page, DataADT, DataCHD, DataINL); 

    await page.locator('#searcher_submit_button').click();

  });

  test('chosseFlights', async () => {

  await selectFlights(page, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType); 

  await page.getByRole('button', { name: 'Continue' }).click();

  }); 

  test('fillPassengerData', async () => {
    try {
      await fillPassengerData(page, DataADT, DataCHD, DataINL);
    } catch (error) {
      // await handleErrorWithScreenshot(page, error, 'fillPassengerData');
        console.error('Error al llenar datos de pasajeros:', error);
    }

    await page.getByRole('button', { name: 'Complete your purchase' }).click();
    await page.waitForTimeout(5000); // Espera 5 segundos
     
  });

  test('payWithCard', async () => {

    await payWithCard(page, payCardData); 
   
    await page.waitForTimeout(10000); // Espera 10 segundos
  }); 

  

});