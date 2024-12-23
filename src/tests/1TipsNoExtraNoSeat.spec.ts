import { test, expect , type Page} from '@playwright/test';
import { userDataADT, userDataCHD, userDataINL, CabinClass, CabinType, paymentCards, Language, MoneyChosee, LenguageChoose} from '../fixtures/userData';
import { entornoData, apiData } from '../fixtures/environmentData';
import { ruteData } from '../fixtures/ruteData';
import {fillPassengerFor} from '../page-objects/PassengerPage'
import {selectRoundTripDates, adjustPassengerCount} from '../page-objects/searchPage'
import {selectFlights} from '../page-objects/FlightPage'
import {payWithCard} from '../page-objects/paymentPage'
import {getDateOfBirth} from '../page-objects/basePage'
import fs from 'fs';
// C:\Users\sofiamartínezlópez\AppData\Roaming\Python\Python312\Scripts\trcli -y -h "https://leveltestautomation.testrail.io" -u "sofiainkoova@gmail.com" -p "TestRail1!" --project "Level" parse_junit -f "./test-results/junit-report.xml" --title "Playwright Automated Test Run"
// C:\Users\sofiamartínezlópez\AppData\Roaming\Python\Python312\Scripts\trcli -y -h "https://leveltestautomation.testrail.io" -u "sofiainkoova@gmail.com" -p "TestRail1!" --project "Level" parse_junit -f "./test-results/processed-junit-report.xml" --title "Playwright Automated Test Run" --comment "Automated test execution steps attached. See details below."
// npm run pro
let ENTORNO = entornoData.pre.url; 
let oneTripBoll = true;
// Helper functions for test steps

// Function for opening the website and accepting cookies
async function openWebsiteAndAcceptCookies(page) {
  await page.goto(ENTORNO);
  await page.getByRole('button', { name: 'Accept all cookies' }).click();
}

// Function to select origin and destination cities
async function chooseCity(page, Origin, Destination) {
  await page.locator('div.searcher-input.station-selector.origin').click();
  await page.locator('div.iata', { hasText: Origin }).nth(0).click();
  await page.locator('div.iata').filter({ hasText: Destination }).nth(1).click();
}

//Function choose lenguage and Money 
async function chooseLengMoney(page) {
  await page.getByRole('button', { name: ' EN' }).click();

  // Hacer clic en el elemento correspondiente al idioma seleccionado
  await page.click(`div[aria-labelledby="collapsible-nav-dropdown"] .dropdown-item:text("${LenguageChoose}")`);
  await page.waitForTimeout(1000);

  // Hacer clic en el elemento correspondiente a la moneda seleccionada
  if(MoneyChosee != 'USD'){
    await page.getByRole('button', { name: 'USD ($)' }).click();
    await page.getByRole('button', { name: MoneyChosee }).click();
  }

}
// Function to toggle cities (origin and destination)
async function toggleCityButton(page) {
  await page.locator('.swap-btn-icon.flight-swap-icon.icon-swap-black').click();
  await page.locator('.swap-btn-icon.flight-swap-icon.icon-swap-black').click();
}

// Function to select round trip dates
async function chooseDate(page, apiData, Origin, Destination, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType,  DataADT, DataCHD, DataINL, oneTrip) {
  await selectRoundTripDates(page, apiData, Origin, Destination, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType,  DataADT, DataCHD, DataINL, oneTrip);
}

// Function to adjust the number of passengers
async function choosePassengers(page, DataADT, DataCHD, DataINL) {
  await adjustPassengerCount(page, DataADT, DataCHD, DataINL);
  await page.locator('#searcher_submit_button').click();
}

// Function to select flights for outbound and return
async function chooseFlights(page, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType, oneTrip) {
  await selectFlights(page, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType, oneTrip);
  // await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Continue' }).click();
}

// Function to fill passenger data
async function fillPassengerInformation(page,type, data, variable, i, lenguageLocal, dayOffset) {
  try {
    await fillPassengerFor(page, type, data, variable, i, lenguageLocal, dayOffset);
  } catch (error) {
    console.error('Error while filling passenger data:', error);
  }
 
}

// Function to pay with a credit card
async function payWithCardInformation(page, payCardData) {
    await payWithCard(page, payCardData);
    await page.waitForTimeout(1000); // Wait for 10 seconds
  }
  

async function global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType)
{
  await chooseLengMoney(page); 

  await chooseCity(page, Origin, Destination);

  if(oneTripBoll){
    await page.getByRole('button', { name: 'One way' }).click(); // en ingles esta 
  }


  await toggleCityButton(page);

  await chooseDate(page, apiData, Origin, Destination, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType,  DataADT, DataCHD, DataINL, oneTripBoll);

  await choosePassengers(page, DataADT, DataCHD, DataINL);

  await chooseFlights(page, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType, oneTripBoll);

}


const runWithRetries = async (fn, screenshotPath, testName, page, TEST_RETRIES) => {
  for (let attempt = 1; attempt <= TEST_RETRIES; attempt++) {
    try {
      console.log(`Ejecutando ${testName}, intento ${attempt}`);
      await fn();
      return true; // Éxito
    } catch (error) {
      console.error(`Intento ${attempt} fallido en ${testName}:`, error);
      if (attempt === TEST_RETRIES) {
        await page.screenshot({ path: screenshotPath });
        console.error(`Prueba ${testName} fallida después de ${TEST_RETRIES} intentos.`);
        return false; // Fallo
      }
    }
  }
};

const executeTests = async (browser, context, page, TEST_RETRIES, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType, lenguageLocal, dayOffset) => {
  let shouldContinueTests = true; // Re-initialize here for each execution attempt
  try {
    // Configurar navegador
    context = await browser.newContext();
    page = await context.newPage();
    await openWebsiteAndAcceptCookies(page);

    // Pruebas
    shouldContinueTests = await runWithRetries(
      () => global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType),
      'test-results/screenshots/booking-error.png',
      'Booking',
      page, 
      TEST_RETRIES
    );

    if (!shouldContinueTests) return shouldContinueTests; // Early exit if the booking test fails

    for (let i = 0; i < DataADT.length; i++) {
      if (!shouldContinueTests) break;
      shouldContinueTests = await runWithRetries(
        () => fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i, lenguageLocal, dayOffset),
        `test-results/screenshots/adult-${i + 1}-error.png`,
        `fillPassengerAdult ${i + 1}`,
        page, 
        TEST_RETRIES
      );
      if (!shouldContinueTests) return shouldContinueTests; // Early exit if the adult test fails
    }

    for (let i = 0; i < DataCHD.length; i++) {
      if (!shouldContinueTests) break;
      shouldContinueTests = await runWithRetries(
        () => fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i, lenguageLocal, dayOffset),
        `test-results/screenshots/child-${i + 1}-error.png`,
        `fillPassengerChild ${i + 1}`,
        page, 
        TEST_RETRIES
      );
      if (!shouldContinueTests) return shouldContinueTests; // Early exit if the child test fails
    }

    for (let i = 0; i < DataINL.length; i++) {
      if (!shouldContinueTests) break;
      shouldContinueTests = await runWithRetries(
        () => fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i, lenguageLocal, dayOffset),
        `test-results/screenshots/infant-${i + 1}-error.png`,
        `fillPassengerInfant ${i + 1}`,
        page, 
        TEST_RETRIES
      );
      if (!shouldContinueTests) return shouldContinueTests; // Early exit if the infant test fails
    }

    if (shouldContinueTests) {
      shouldContinueTests = await runWithRetries(
        async () => {
          await page.locator('#contact').click();
          await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
          await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
          await page.getByRole('button', { name: 'Complete your purchase' }).click();
          await page.waitForTimeout(1000);
        },
        'test-results/screenshots/fillcontact-error.png',
        'fillContact',
        page, 
        TEST_RETRIES
      );
    }

    
    if (shouldContinueTests) {
        shouldContinueTests = await runWithRetries(
          () => payWithCardInformation(page, payCardData),
          'test-results/screenshots/payWithCard-error.png',
          'payWithCard',
          page, 
          TEST_RETRIES
        );
      }

  } catch (error) {
    console.error('Error crítico durante la ejecución:', error);
    shouldContinueTests = false;
  } finally {
    if (page) await page.close();
    if (context) await context.close();
  }

  return shouldContinueTests; // Return the status of the test execution
};




// Test Suite
test.describe('1 Adt EcoLight - sin assitence', () => {
  let page;
  let context;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
    let payCardData = paymentCards[0];
  let lenguageLocal = Language.EN; 
  let dayOffset = -1; // Default value

  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.LIGHT;

  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.LIGHT;

  test('Ejecución completa con reintentos', async ({ browser }) => {
    let executionAttempt = 0; // Reset execution attempt counter
    const MAX_RETRIES = 5; // Número máximo de intentos para la ejecución completa
    const TEST_RETRIES = 3; // Número máximo de intentos para pruebas individuales
    let shouldContinueTests = false; // Default value
  
    while (executionAttempt < MAX_RETRIES && !shouldContinueTests) {
      executionAttempt++;
      console.log(`Ejecución completa, intento ${executionAttempt} de ${MAX_RETRIES}`);
       shouldContinueTests = await executeTests(browser, context, page, TEST_RETRIES, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType, lenguageLocal, dayOffset);
  
      if (shouldContinueTests) break; // Salir si todas las pruebas fueron exitosas
    }
  
    if (!shouldContinueTests) {
      throw new Error(`Pruebas fallidas después de ${MAX_RETRIES} intentos completos.`);
    }
  }, 240000); // Configuración del tiempo límite a 240 segundos
});



test.describe('Compra 2 Adulto (Diferente) Economy Light - Economy Light - Nombre con caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let context;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[1], userDataADT[2]]; 
  let DataCHD = []; 
  let DataINL = []; 
    let payCardData = paymentCards[0];
  let lenguageLocal = Language.EN; 
  let dayOffset = -1; // Default value 

  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.LIGHT;
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.LIGHT;
  

  test('Ejecución completa con reintentos', async ({ browser }) => {
    let executionAttempt = 0; // Reset execution attempt counter
    const MAX_RETRIES = 5; // Número máximo de intentos para la ejecución completa
    const TEST_RETRIES = 3; // Número máximo de intentos para pruebas individuales
    let shouldContinueTests = false; // Default value
  
    while (executionAttempt < MAX_RETRIES && !shouldContinueTests) {
      executionAttempt++;
      console.log(`Ejecución completa, intento ${executionAttempt} de ${MAX_RETRIES}`);
       shouldContinueTests = await executeTests(browser, context, page, TEST_RETRIES, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType, lenguageLocal, dayOffset);
  
      if (shouldContinueTests) break; // Salir si todas las pruebas fueron exitosas
    }
  
    if (!shouldContinueTests) {
      throw new Error(`Pruebas fallidas después de ${MAX_RETRIES} intentos completos.`);
    }
  }, 240000); // Configuración del tiempo límite a 240 segundos
  
  
});

test.describe('Compra 2 Adulto (Diferente) Economy Light - Economy Light - Nombre con caracteres especiales - Con assitence TODAS - sin asiento - sin extras', () => {
  let page;
  let context;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[4], userDataADT[5]]; 
  let DataCHD = []; 
  let DataINL = []; 
    let payCardData = paymentCards[0];
  let lenguageLocal = Language.EN; 
  let dayOffset = -1; // Default value 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.LIGHT;

  // vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.LIGHT;


    test('Ejecución completa con reintentos', async ({ browser }) => {
    let executionAttempt = 0; // Reset execution attempt counter
    const MAX_RETRIES = 5; // Número máximo de intentos para la ejecución completa
    const TEST_RETRIES = 3; // Número máximo de intentos para pruebas individuales
    let shouldContinueTests = false; // Default value

    // Intentos de ejecución
    while (executionAttempt < MAX_RETRIES && !shouldContinueTests) {
      executionAttempt++;
      console.log(`Ejecución completa, intento ${executionAttempt} de ${MAX_RETRIES}`);

      // Ejecutar las pruebas
      shouldContinueTests = await executeTests(
        browser, context, page, TEST_RETRIES,
        Origin, Destination, DataADT, DataCHD, DataINL,
        outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType
      );

      // Salir del ciclo si todas las pruebas fueron exitosas
      if (shouldContinueTests) break; 
    }

    // Si después de los intentos no se completaron correctamente, arrojar un error
    if (!shouldContinueTests) {
      throw new Error(`Pruebas fallidas después de ${MAX_RETRIES} intentos completos.`);
    }
  }, 240000); // Configuración del tiempo límite a 240 segundos
});

// test.describe('Compra 1 Adulto - 1 niño - Economy Light - Economy Light - Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
//   let page;
//   let context;
//   let Origin = ruteData.origin;
//   let Destination = ruteData.destination;
//   let DataADT = [userDataADT[0]]; 
//   let DataCHD = [userDataCHD[0]]; 
//   let DataINL = []; 
//     let payCardData = paymentCards[0];
  let lenguageLocal = Language.EN; 
  let dayOffset = -1; // Default value 

//   //ida 
//   const outboundFlightClass = CabinClass.ECONOMY;
//   const outboundFlightType = CabinType.LIGHT;

//   // vuelta
//   const returnFlightClass = CabinClass.ECONOMY;
//   const returnFlightType = CabinType.LIGHT;


//     test('Ejecución completa con reintentos', async ({ browser }) => {
//     let executionAttempt = 0; // Reset execution attempt counter
//     const MAX_RETRIES = 5; // Número máximo de intentos para la ejecución completa
//     const TEST_RETRIES = 3; // Número máximo de intentos para pruebas individuales
//     let shouldContinueTests = false; // Default value

//     // Intentos de ejecución
//     while (executionAttempt < MAX_RETRIES && !shouldContinueTests) {
//       executionAttempt++;
//       console.log(`Ejecución completa, intento ${executionAttempt} de ${MAX_RETRIES}`);

//       // Ejecutar las pruebas
//       shouldContinueTests = await executeTests(
//         browser, context, page, TEST_RETRIES,
//         Origin, Destination, DataADT, DataCHD, DataINL,
//         outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType
//       );

//       // Salir del ciclo si todas las pruebas fueron exitosas
//       if (shouldContinueTests) break; 
//     }

//     // Si después de los intentos no se completaron correctamente, arrojar un error
//     if (!shouldContinueTests) {
//       throw new Error(`Pruebas fallidas después de ${MAX_RETRIES} intentos completos.`);
//     }
//   }, 240000); // Configuración del tiempo límite a 240 segundos
// });

test.describe('Compra 1 Adulto - 1 niño - Economy Light - Economy Light - Nombre con caracteres especiales - sin asistencia - sin asiento - sin extras', () => {
  let page;
  let context;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]];
  let DataCHD = [userDataCHD[1]];
  let DataINL = [];
    let payCardData = paymentCards[0];
  let lenguageLocal = Language.EN; 
  let dayOffset = -1; // Default value

  // Ida
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.LIGHT;

  // Vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.LIGHT;

  test('Ejecución completa con reintentos', async ({ browser }) => {
    let executionAttempt = 0; // Reset execution attempt counter
    const MAX_RETRIES = 5; // Número máximo de intentos para la ejecución completa
    const TEST_RETRIES = 3; // Número máximo de intentos para pruebas individuales
    let shouldContinueTests = false; // Default value
  
    while (executionAttempt < MAX_RETRIES && !shouldContinueTests) {
      executionAttempt++;
      console.log(`Ejecución completa, intento ${executionAttempt} de ${MAX_RETRIES}`);
       shouldContinueTests = await executeTests(browser, context, page, TEST_RETRIES, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType, lenguageLocal, dayOffset);
  
      if (shouldContinueTests) break; // Salir si todas las pruebas fueron exitosas
    }
  
    if (!shouldContinueTests) {
      throw new Error(`Pruebas fallidas después de ${MAX_RETRIES} intentos completos.`);
    }
  }, 240000); // Configuración del tiempo límite a 240 segundos
});


test.describe('Compra 1 Adulto - 1 niño - Economy Light - Economy Light - Nombre con caracteres especiales - con assitence - sin asiento - sin extras', () => {
  let page;
  let context;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = [userDataCHD[2]]; 
  let DataINL = []; 
    let payCardData = paymentCards[0];
  let lenguageLocal = Language.EN; 
  let dayOffset = -1; // Default value 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.LIGHT;

  // vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.LIGHT;


        test('Ejecución completa con reintentos', async ({ browser }) => {
    let executionAttempt = 0; // Reset execution attempt counter
    const MAX_RETRIES = 5; // Número máximo de intentos para la ejecución completa
    const TEST_RETRIES = 3; // Número máximo de intentos para pruebas individuales
    let shouldContinueTests = false; // Default value

    // Intentos de ejecución
    while (executionAttempt < MAX_RETRIES && !shouldContinueTests) {
      executionAttempt++;
      console.log(`Ejecución completa, intento ${executionAttempt} de ${MAX_RETRIES}`);

      // Ejecutar las pruebas
      shouldContinueTests = await executeTests(
        browser, context, page, TEST_RETRIES,
        Origin, Destination, DataADT, DataCHD, DataINL,
        outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType
      );

      // Salir del ciclo si todas las pruebas fueron exitosas
      if (shouldContinueTests) break; 
    }

    // Si después de los intentos no se completaron correctamente, arrojar un error
    if (!shouldContinueTests) {
      throw new Error(`Pruebas fallidas después de ${MAX_RETRIES} intentos completos.`);
    }
  }, 240000); // Configuración del tiempo límite a 240 segundos
});

test.describe('Compra 1 Adulto - 3 niño - Economy Light - Economy Light - Nombre con caracteres especiales - con assitence - sin asiento - sin extras', () => {
  let page;
  let context;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = [userDataCHD[3], userDataCHD[4], userDataCHD[5]]; 
  let DataINL = []; 
    let payCardData = paymentCards[0];
  let lenguageLocal = Language.EN; 
  let dayOffset = -1; // Default value 

  // Ida
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.LIGHT;

  // Vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.LIGHT;

  test('Ejecución completa con reintentos', async ({ browser }) => {
    let executionAttempt = 0; // Reset execution attempt counter
    const MAX_RETRIES = 5; // Número máximo de intentos para la ejecución completa
    const TEST_RETRIES = 3; // Número máximo de intentos para pruebas individuales
    let shouldContinueTests = false; // Default value
  
    while (executionAttempt < MAX_RETRIES && !shouldContinueTests) {
      executionAttempt++;
      console.log(`Ejecución completa, intento ${executionAttempt} de ${MAX_RETRIES}`);
       shouldContinueTests = await executeTests(browser, context, page, TEST_RETRIES, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType, lenguageLocal, dayOffset);
  
      if (shouldContinueTests) break; // Salir si todas las pruebas fueron exitosas
    }
  
    if (!shouldContinueTests) {
      throw new Error(`Pruebas fallidas después de ${MAX_RETRIES} intentos completos.`);
    }
  }, 240000); // Configuración del tiempo límite a 240 segundos
});



//Infante


test.describe('Compra 1 Adulto - 1 infante - Economy Light- Nombre con caracteres especiales - sin asiento - sin extras', () => {
  let page;
  let context;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = [userDataINL[1]]; 
    let payCardData = paymentCards[0];
  let lenguageLocal = Language.EN; 
  let dayOffset = -1; // Default value 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.LIGHT;

  // vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.LIGHT;

  test('Ejecución completa con reintentos', async ({ browser }) => {
    let executionAttempt = 0; // Reset execution attempt counter
    const MAX_RETRIES = 5; // Número máximo de intentos para la ejecución completa
    const TEST_RETRIES = 3; // Número máximo de intentos para pruebas individuales
    let shouldContinueTests = false; // Default value
  
    while (executionAttempt < MAX_RETRIES && !shouldContinueTests) {
      executionAttempt++;
      console.log(`Ejecución completa, intento ${executionAttempt} de ${MAX_RETRIES}`);
       shouldContinueTests = await executeTests(browser, context, page, TEST_RETRIES, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType, lenguageLocal, dayOffset);
  
      if (shouldContinueTests) break; // Salir si todas las pruebas fueron exitosas
    }
  
    if (!shouldContinueTests) {
      throw new Error(`Pruebas fallidas después de ${MAX_RETRIES} intentos completos.`);
    }
  }, 240000); // Configuración del tiempo límite a 240 segundos
});


//Cabinas 
// Ida: Economy - Light, Vuelta: Economy - Light
test.describe('Compra 1 Adulto Economy Light - Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let context;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
    let payCardData = paymentCards[0];
  let lenguageLocal = Language.EN; 
  let dayOffset = -1; // Default value

  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.LIGHT;

  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.LIGHT;

  test('Ejecución completa con reintentos', async ({ browser }) => {
    let executionAttempt = 0; // Reset execution attempt counter
    const MAX_RETRIES = 5; // Número máximo de intentos para la ejecución completa
    const TEST_RETRIES = 3; // Número máximo de intentos para pruebas individuales
    let shouldContinueTests = false; // Default value
  
    while (executionAttempt < MAX_RETRIES && !shouldContinueTests) {
      executionAttempt++;
      console.log(`Ejecución completa, intento ${executionAttempt} de ${MAX_RETRIES}`);
       shouldContinueTests = await executeTests(browser, context, page, TEST_RETRIES, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType, lenguageLocal, dayOffset);
  
      if (shouldContinueTests) break; // Salir si todas las pruebas fueron exitosas
    }
  
    if (!shouldContinueTests) {
      throw new Error(`Pruebas fallidas después de ${MAX_RETRIES} intentos completos.`);
    }
  }, 240000); // Configuración del tiempo límite a 240 segundos
});

// Ida: Economy - Comfort, Vuelta: Economy - Comfort

test.describe('Compra 1 Adulto Economy Comfort - Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let context;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
    let payCardData = paymentCards[0];
  let lenguageLocal = Language.EN; 
  let dayOffset = -1; // Default value 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.COMFORT;

  // vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.COMFORT;

  test('Ejecución completa con reintentos', async ({ browser }) => {
    let executionAttempt = 0; // Reset execution attempt counter
    const MAX_RETRIES = 5; // Número máximo de intentos para la ejecución completa
    const TEST_RETRIES = 3; // Número máximo de intentos para pruebas individuales
    let shouldContinueTests = false; // Default value
  
    while (executionAttempt < MAX_RETRIES && !shouldContinueTests) {
      executionAttempt++;
      console.log(`Ejecución completa, intento ${executionAttempt} de ${MAX_RETRIES}`);
       shouldContinueTests = await executeTests(browser, context, page, TEST_RETRIES, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType, lenguageLocal, dayOffset);
  
      if (shouldContinueTests) break; // Salir si todas las pruebas fueron exitosas
    }
  
    if (!shouldContinueTests) {
      throw new Error(`Pruebas fallidas después de ${MAX_RETRIES} intentos completos.`);
    }
  }, 240000); // Configuración del tiempo límite a 240 segundos
});


// Ida: Economy - Extra, Vuelta: Economy - Light
test.describe('Compra 1 Adulto Economy Extra - Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let context;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
    let payCardData = paymentCards[0];
  let lenguageLocal = Language.EN; 
  let dayOffset = -1; // Default value 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.EXTRA;

  // vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.LIGHT;


  test('Ejecución completa con reintentos', async ({ browser }) => {
    let executionAttempt = 0; // Reset execution attempt counter
    const MAX_RETRIES = 5; // Número máximo de intentos para la ejecución completa
    const TEST_RETRIES = 3; // Número máximo de intentos para pruebas individuales
    let shouldContinueTests = false; // Default value
  
    while (executionAttempt < MAX_RETRIES && !shouldContinueTests) {
      executionAttempt++;
      console.log(`Ejecución completa, intento ${executionAttempt} de ${MAX_RETRIES}`);
       shouldContinueTests = await executeTests(browser, context, page, TEST_RETRIES, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType, lenguageLocal, dayOffset);
  
      if (shouldContinueTests) break; // Salir si todas las pruebas fueron exitosas
    }
  
    if (!shouldContinueTests) {
      throw new Error(`Pruebas fallidas después de ${MAX_RETRIES} intentos completos.`);
    }
  }, 240000); // Configuración del tiempo límite a 240 segundos
});

// Ida: Premium - Light, Vuelta: Economy - Light
test.describe('Compra 1 Adulto Premium Light- Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let context;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
    let payCardData = paymentCards[0];
  let lenguageLocal = Language.EN; 
  let dayOffset = -1; // Default value 

  //ida 
  const outboundFlightClass = CabinClass.PREMIUM;
  const outboundFlightType = CabinType.LIGHT;

  // vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.LIGHT;


  test('Ejecución completa con reintentos', async ({ browser }) => {
    let executionAttempt = 0; // Reset execution attempt counter
    const MAX_RETRIES = 5; // Número máximo de intentos para la ejecución completa
    const TEST_RETRIES = 3; // Número máximo de intentos para pruebas individuales
    let shouldContinueTests = false; // Default value
  
    while (executionAttempt < MAX_RETRIES && !shouldContinueTests) {
      executionAttempt++;
      console.log(`Ejecución completa, intento ${executionAttempt} de ${MAX_RETRIES}`);
       shouldContinueTests = await executeTests(browser, context, page, TEST_RETRIES, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType, lenguageLocal, dayOffset);
  
      if (shouldContinueTests) break; // Salir si todas las pruebas fueron exitosas
    }
  
    if (!shouldContinueTests) {
      throw new Error(`Pruebas fallidas después de ${MAX_RETRIES} intentos completos.`);
    }
  }, 240000); // Configuración del tiempo límite a 240 segundos
});
// Ida: Premium - Light, Vuelta: Economy - Comfort

test.describe('Compra 1 Adulto Premium Light - Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let context;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
    let payCardData = paymentCards[0];
  let lenguageLocal = Language.EN; 
  let dayOffset = -1; // Default value 

  //ida 
  const outboundFlightClass = CabinClass.PREMIUM;
  const outboundFlightType = CabinType.LIGHT;

  // vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.COMFORT;


  test('Ejecución completa con reintentos', async ({ browser }) => {
    let executionAttempt = 0; // Reset execution attempt counter
    const MAX_RETRIES = 5; // Número máximo de intentos para la ejecución completa
    const TEST_RETRIES = 3; // Número máximo de intentos para pruebas individuales
    let shouldContinueTests = false; // Default value
  
    while (executionAttempt < MAX_RETRIES && !shouldContinueTests) {
      executionAttempt++;
      console.log(`Ejecución completa, intento ${executionAttempt} de ${MAX_RETRIES}`);
       shouldContinueTests = await executeTests(browser, context, page, TEST_RETRIES, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType, lenguageLocal, dayOffset);
  
      if (shouldContinueTests) break; // Salir si todas las pruebas fueron exitosas
    }
  
    if (!shouldContinueTests) {
      throw new Error(`Pruebas fallidas después de ${MAX_RETRIES} intentos completos.`);
    }
  }, 240000); // Configuración del tiempo límite a 240 segundos
});

// Ida: Premium - Comfort, Vuelta: Economy - Light

test.describe('Compra 1 Adulto Premium Comfort - Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let context;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
    let payCardData = paymentCards[0];
  let lenguageLocal = Language.EN; 
  let dayOffset = -1; // Default value 

  //ida 
  const outboundFlightClass = CabinClass.PREMIUM;
  const outboundFlightType = CabinType.COMFORT;

  // vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.EXTRA;


  test('Ejecución completa con reintentos', async ({ browser }) => {
    let executionAttempt = 0; // Reset execution attempt counter
    const MAX_RETRIES = 5; // Número máximo de intentos para la ejecución completa
    const TEST_RETRIES = 3; // Número máximo de intentos para pruebas individuales
    let shouldContinueTests = false; // Default value
  
    while (executionAttempt < MAX_RETRIES && !shouldContinueTests) {
      executionAttempt++;
      console.log(`Ejecución completa, intento ${executionAttempt} de ${MAX_RETRIES}`);
       shouldContinueTests = await executeTests(browser, context, page, TEST_RETRIES, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType, lenguageLocal, dayOffset);
  
      if (shouldContinueTests) break; // Salir si todas las pruebas fueron exitosas
    }
  
    if (!shouldContinueTests) {
      throw new Error(`Pruebas fallidas después de ${MAX_RETRIES} intentos completos.`);
    }
  }, 240000); // Configuración del tiempo límite a 240 segundos
});


// Ida: Premium - Extra, Vuelta: Economy - Light
test.describe('Compra 1 Adulto Premium Extra - Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let context;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
    let payCardData = paymentCards[0];
  let lenguageLocal = Language.EN; 
  let dayOffset = -1; // Default value 

  //ida 
  const outboundFlightClass = CabinClass.PREMIUM;
  const outboundFlightType = CabinType.EXTRA;

  // vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.LIGHT;


  test('Ejecución completa con reintentos', async ({ browser }) => {
    let executionAttempt = 0; // Reset execution attempt counter
    const MAX_RETRIES = 5; // Número máximo de intentos para la ejecución completa
    const TEST_RETRIES = 3; // Número máximo de intentos para pruebas individuales
    let shouldContinueTests = false; // Default value
  
    while (executionAttempt < MAX_RETRIES && !shouldContinueTests) {
      executionAttempt++;
      console.log(`Ejecución completa, intento ${executionAttempt} de ${MAX_RETRIES}`);
       shouldContinueTests = await executeTests(browser, context, page, TEST_RETRIES, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType, lenguageLocal, dayOffset);
  
      if (shouldContinueTests) break; // Salir si todas las pruebas fueron exitosas
    }
  
    if (!shouldContinueTests) {
      throw new Error(`Pruebas fallidas después de ${MAX_RETRIES} intentos completos.`);
    }
  }, 240000); // Configuración del tiempo límite a 240 segundos
});


