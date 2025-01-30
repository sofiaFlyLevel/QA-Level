import { test, expect , type Page} from '@playwright/test';
import { userDataADT, userDataCHD, userDataINL, CabinClass, CabinType, paymentCards, Language, MoneyChosee, LenguageChoose} from '../fixtures/userData';
import { entornoData, apiData } from '../fixtures/environmentData';
import { ruteData } from '../fixtures/ruteData';
import {fillPassengerFor} from '../page-objects/PassengerPage'
import {selectRoundTripDates, adjustPassengerCount} from '../page-objects/searchPage'
import {selectFlights} from '../page-objects/FlightPage'
import {payWithCard} from '../page-objects/paymentPage'
import {validationConfirmPage} from '../page-objects/confirmation'
import {getDateOfBirth} from '../page-objects/basePage'
import fs from 'fs';
// C:\Users\sofiamartínezlópez\AppData\Roaming\Python\Python312\Scripts\trcli -y -h "https://leveltestautomation.testrail.io" -u "sofiainkoova@gmail.com" -p "TestRail1!" --project "Level" parse_junit -f "./test-results/junit-report.xml" --title "Playwright Automated Test Run"
// C:\Users\sofiamartínezlópez\AppData\Roaming\Python\Python312\Scripts\trcli -y -h "https://leveltestautomation.testrail.io" -u "sofiainkoova@gmail.com" -p "TestRail1!" --project "Level" parse_junit -f "./test-results/processed-junit-report.xml" --title "Playwright Automated Test Run" --comment "Automated test execution steps attached. See details below."
// npm run pro
let ENTORNO = entornoData.pre.url; 
const isProdEnvironment = ENTORNO === entornoData.prod.url;
let oneTripBoll = false;
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

async function selectSeat(page, index, seatType, desiredType) {
  let foundDesiredSeat = false;
  let attempts = 0;
  const maxAttempts = 10; // Límite de intentos para evitar bucles infinitos

  while (!foundDesiredSeat && attempts < maxAttempts) {
    // Obtener asientos disponibles
    const seats = await page.$$('.seat-icon__zoom img:not(.occupied)');
    
    if (seats.length === 0) {
      console.log(`No hay asientos disponibles para ${seatType}`);
      return;
    }

    // Seleccionar un asiento aleatorio
    let randomIndex = Math.floor(Math.random() * seats.length);
    await seats[randomIndex].click();
    await page.waitForTimeout(500);

    // Verificar la clase del asiento seleccionado
    const seatClass = await page.locator('.selection-box__container').nth(index).getAttribute('class');

    // Si el asiento coincide con el tipo deseado, terminar la búsqueda
    if (!desiredType || seatClass.includes(`seat--${desiredType}`)) {
      foundDesiredSeat = true;
    } else {
      if (index === 0) {
        // Para el asiento de ida: hacer click en el botón "Edit previous flight"
        try {
          await page.locator('button.selected-seats__button.button--link').click();
          await page.waitForTimeout(500);
        } catch (error) {
          console.log('No se pudo hacer click en el botón Edit previous flight');
          // Si falla, intentar con el selector por número de asiento
          try {
            const seatNumber = await page.locator('.selection-box__container.selected .selection-box__seat-number').innerText();
            await page.click(`.selection-box__container:has(.selection-box__seat-number:text("${seatNumber}"))`);
            await page.waitForTimeout(500);
          } catch (error2) {
            // Si aún falla, intentar forzar el click por coordenadas
            const element = await page.$('.selection-box__container.selected');
            if (element) {
              const box = await element.boundingBox();
              if (box) {
                await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
              }
            }
          }
        }
        
      } else {
        // Para el asiento de vuelta: probar con otros asientos disponibles
        for (let i = 0; i < seats.length; i++) {
          if (i !== randomIndex) {
            await seats[i].click();
            await page.waitForTimeout(500);
            
            const newSeatClass = await page.locator('.selection-box__container').nth(index).getAttribute('class');
            if (newSeatClass.includes(`seat--${desiredType}`)) {
              foundDesiredSeat = true;
              break;
            }
          }
        }
        // Si no se encontró un asiento adecuado después de probar todos, incrementar el contador
        if (!foundDesiredSeat) {
          attempts++;
        }
      }
    }

    attempts++;
  }

  if (!foundDesiredSeat) {
    console.log(`No se encontró un asiento del tipo ${desiredType} después de ${maxAttempts} intentos`);
    return;
  }

  // Obtener y mostrar el número del asiento seleccionado
  await page.waitForTimeout(1000);
  const seatNumber = await page.locator('.selection-box__seat-number').nth(index).innerText();
  console.log(`Asiento ${seatType}:`, seatNumber);
}
async function selectSeatsAndContinue(page) {
  await page.waitForTimeout(10000);

  // Seleccionar asiento de ida
  await selectSeat(page, 0, 'ida', 'front');
  await page.waitForTimeout(3000);

  // Seleccionar asiento de vuelta
  await selectSeat(page, 1, 'vuelta', 'front');
  await page.waitForTimeout(5000);

  // Continuar al siguiente paso
  await page.getByRole('button', { name: 'Continue' }).click();
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

async function validationConfirmationPage(page)  {
  await validationConfirmPage(page);
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
          await page.locator('input[name="contactDetails\\.name"]').fill(DataADT[0].name);;
          await page.locator('input[name="contactDetails\\.surname"]').fill(DataADT[0].surname);
          
          await page.locator(`#contact`).getByRole('combobox').click();
          await page.locator(`#contact`).getByRole('combobox').fill(DataADT[0].nationality.substring(0, 3));
    
          await page.getByLabel(DataADT[0].nationality).click();
          await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
          await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
          await page.getByRole('button', { name: 'Customize your flight' }).click();
         
        },
        'test-results/screenshots/fillcontact-error.png',
        'fillContact',
        page, 
        TEST_RETRIES
      );
    }

      if (shouldContinueTests) {
        shouldContinueTests = await runWithRetries(
          () => selectSeatsAndContinue(page),
          'test-results/screenshots/fillSeat-error.png',
          'fillSeat',
          page, 
          TEST_RETRIES
        );
    }

    if (shouldContinueTests) {
        shouldContinueTests = await runWithRetries(
          async () => {
            // Esperar a que la URL contenga el path específico
            await page.waitForURL((url) => url.includes('/nwe/ancillaries/'));
            await page.getByRole('button', { name: 'Continue' }).click();
          },
          'test-results/screenshots/extrabaggage-error.png',
          'extraBaggage',
          page,
          TEST_RETRIES
        );
    }

  if (shouldContinueTests && !isProdEnvironment) {
    shouldContinueTests = await runWithRetries(
      () => payWithCardInformation(page, payCardData),
      'test-results/screenshots/payWithCard-error.png',
      'payWithCard',
      page, 
      TEST_RETRIES
    );
  }
  
  if (shouldContinueTests && !isProdEnvironment) {
    shouldContinueTests = await runWithRetries(
      () => validationConfirmationPage(page),
      'test-results/screenshots/confirmation-error.png',
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







// import { test } from '@playwright/test';
// import { BookingTest } from '../page-objects/global';
// import { 
//   userDataADT, CabinClass, CabinType, 
//   paymentCards, Language 
// } from '../fixtures/userData';
// import { ruteData } from '../fixtures/ruteData';
// import { apiData } from '../fixtures/environmentData';

// test.describe('Flight Booking Tests', () => {
//   const testData = {
//     apiData,
//     origin: ruteData.origin,
//     destination: ruteData.destination,
//     passengers: {
//       adults: [userDataADT[0]],
//       children: [],
//       infants: []
//     },
//     cabinClass: {
//       outbound: CabinClass.ECONOMY,
//       return: CabinClass.ECONOMY
//     },
//     cabinType: {
//       outbound: CabinType.LIGHT,
//       return: CabinType.LIGHT
//     },
//     language: Language.EN,
//     dayOffset: -1, 
//     payment: paymentCards[0]
//   };

//   const MAX_RETRIES = 3;
//   const RETRY_DELAY = 5000;

//   test('Complete booking flow with extra seat', async ({ browser }) => {
//     let attempt = 0;
//     let lastError = null;

//     while (attempt < MAX_RETRIES) {
//       const context = await browser.newContext({
//         storageState: undefined
//       });
//       const page = await context.newPage();
//       const bookingTest = new BookingTest(page, context);

//       try {
//         await bookingTest.executeWithRetry(
//           async () => {
//             await bookingTest.initializeTest();
//             await bookingTest.selectFlight(testData);
//             await bookingTest.fillPassengerDetails(testData);
//             await bookingTest.fillContactDetails(testData, 'purchase');
//             await bookingTest.processPayment(testData.payment);
//           },
//           'complete-booking-flow'
//         );
        
//         await context.close();
//         return;

//       } catch (error) {
//         lastError = error;
//         console.error(`Test attempt ${attempt + 1} failed:`, error);
        
//         await context.close();
        
//         if (error.fatal || error.name === 'ValidationError') {
//           throw error;
//         }
        
//         if (attempt < MAX_RETRIES - 1) {
//           console.log(`Retrying test in ${RETRY_DELAY/1000} seconds...`);
//           await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
//         }
//       }

//       attempt++;
//     }

//     throw new Error(`Test failed after ${MAX_RETRIES} attempts. Last error: ${lastError}`);
//   });
// });