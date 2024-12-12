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

// Niño 
test.describe('Compra 1 Adulto - 1 niño - Economy Light - Economy Light - Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = [userDataCHD[0]]; 
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

test.describe('Compra 1 Adulto - 1 niño - Economy Light - Economy Light - Nombre con caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = [userDataCHD[1]]; 
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

test.describe('Compra 1 Adulto - 1 niño - Economy Light - Economy Light - Nombre con caracteres especiales - con assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = [userDataCHD[2]]; 
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

test.describe('Compra 1 Adulto - 1 niño - Economy Light - Economy Light - Nombre sin caracteres especiales - con assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = [userDataCHD[3]]; 
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

test.describe('Compra 1 Adulto - 3 niño - Economy Light - Economy Light - Nombre con caracteres especiales - con assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = [userDataCHD[3], userDataCHD[4], userDataCHD[5]]; 
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


//Infante
test.describe('Compra 1 Adulto - 1 infante - Economy Light - Economy Light - Nombre sin caracteres especiales - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = [userDataINL[0]]; 
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

test.describe('Compra 1 Adulto - 1 infante - Economy Light - Economy Light - Nombre con caracteres especiales - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = [userDataINL[1]]; 
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


//Cabinas 

//Ida: Economy - Light, Vuelta: Economy - Light

// Ida: Economy - Light, Vuelta: Economy - Comfort

// Ida: Economy - Light, Vuelta: Economy - Extra

// Ida: Economy - Light, Vuelta: Premium - Light

// Ida: Economy - Light, Vuelta: Premium - Comfort

// Ida: Economy - Light, Vuelta: Premium - Extra

// Ida: Economy - Comfort, Vuelta: Economy - Light

// Ida: Economy - Comfort, Vuelta: Economy - Comfort

// Ida: Economy - Comfort, Vuelta: Economy - Extra

// Ida: Economy - Comfort, Vuelta: Premium - Light

// Ida: Economy - Comfort, Vuelta: Premium - Comfort

// Ida: Economy - Comfort, Vuelta: Premium - Extra

// Ida: Economy - Extra, Vuelta: Economy - Light

// Ida: Economy - Extra, Vuelta: Economy - Comfort

// Ida: Economy - Extra, Vuelta: Economy - Extra

// Ida: Economy - Extra, Vuelta: Premium - Light

// Ida: Economy - Extra, Vuelta: Premium - Comfort

// Ida: Economy - Extra, Vuelta: Premium - Extra

// Ida: Premium - Light, Vuelta: Economy - Light

// Ida: Premium - Light, Vuelta: Economy - Comfort

// Ida: Premium - Light, Vuelta: Economy - Extra

// Ida: Premium - Light, Vuelta: Premium - Light

// Ida: Premium - Light, Vuelta: Premium - Comfort

// Ida: Premium - Light, Vuelta: Premium - Extra

// Ida: Premium - Comfort, Vuelta: Economy - Light

// Ida: Premium - Comfort, Vuelta: Economy - Comfort

// Ida: Premium - Comfort, Vuelta: Economy - Extra

// Ida: Premium - Comfort, Vuelta: Premium - Light

// Ida: Premium - Comfort, Vuelta: Premium - Comfort

// Ida: Premium - Comfort, Vuelta: Premium - Extra

// Ida: Premium - Extra, Vuelta: Economy - Light

// Ida: Premium - Extra, Vuelta: Economy - Comfort

// Ida: Premium - Extra, Vuelta: Economy - Extra

// Ida: Premium - Extra, Vuelta: Premium - Light

// Ida: Premium - Extra, Vuelta: Premium - Comfort

// Ida: Premium - Extra, Vuelta: Premium - Extra