import { test, expect , type Page} from '@playwright/test';
import { userDataADT, userDataCHD, userDataINL, CabinClass, CabinType, paymentCards, LenguageChoose, MoneyChosee} from '../fixtures/userData';
import { entornoData, apiData } from '../fixtures/environmentData';
import { ruteData } from '../fixtures/ruteData';
import {fillPassengerFor} from '../page-objects/PassengerPage'
import {selectRoundTripDates, adjustPassengerCount} from '../page-objects/searchPage'
import {selectFlights} from '../page-objects/FlightPage'
import {payWithCard} from '../page-objects/paymentPage'
// import {handleErrorWithScreenshot} from '../page-objects/basePage'
import fs from 'fs';
// C:\Users\sofiamartínezlópez\AppData\Roaming\Python\Python312\Scripts\trcli -y -h "https://leveltestautomation.testrail.io" -u "sofiainkoova@gmail.com" -p "TestRail1!" --project "Level" parse_junit -f "./test-results/junit-report.xml" --title "Playwright Automated Test Run"
// C:\Users\sofiamartínezlópez\AppData\Roaming\Python\Python312\Scripts\trcli -y -h "https://leveltestautomation.testrail.io" -u "sofiainkoova@gmail.com" -p "TestRail1!" --project "Level" parse_junit -f "./test-results/processed-junit-report.xml" --title "Playwright Automated Test Run" --comment "Automated test execution steps attached. See details below."
// npm run pro
let ENTORNO = entornoData.pre.url; 

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
  await page.waitForTimeout(5000);

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
  // await page.waitForTimeout(5000);
  await page.getByRole('button', { name: 'Continue' }).click();
}

// Function to fill passenger data
async function fillPassengerInformation(page,type, data, variable, i) {
  try {
    await fillPassengerFor(page, type, data, variable, i);
  } catch (error) {
    console.error('Error while filling passenger data:', error);
  }
 
}

// Function to pay with a credit card
async function payWithCardInformation(page, payCardData) {
  await payWithCard(page, payCardData);
  await page.waitForTimeout(10000); // Wait for 10 seconds
}

async function global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType)
{
  await chooseLengMoney(page); 

  await chooseCity(page, Origin, Destination);

  await page.getByRole('button', { name: 'One way' }).click(); // en ingles esta 

  await toggleCityButton(page);

  await chooseDate(page, apiData, Origin, Destination, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType,  DataADT, DataCHD, DataINL, true);

  await choosePassengers(page, DataADT, DataCHD, DataINL);

  await chooseFlights(page, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType, true);

}



// Test Suite
test.describe('1 Adt EcoLight - sin assitence', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
  let payCardData = paymentCards[0];

  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.LIGHT;

  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.LIGHT;

    test.beforeAll(async ({ browser }) => {
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }
    const context = await browser.newContext();
    page = await context.newPage();
    await openWebsiteAndAcceptCookies(page);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Booking', async () => {
    try {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    } catch (error) {
      await page.screenshot({ path: 'test-results/screenshots/booking-error.png' });
      throw error; // Rethrow para marcar el test como fallido
    }
  });

  for (let i = 0; i < DataADT.length; i++) {
    test(`fillPassengerAdult ${i + 1}`, async () => {
      try {
        await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
      } catch (error) {
        await page.screenshot({ path: `test-results/screenshots/adult-${i + 1}-error.png` });
        throw error;
      }
    });
  }

   for (let i = 0; i < DataCHD.length; i++) {
    test(`fillPassengerChild ${i + 1}`, async () => {
      try {
        await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
      } catch (error) {
        await page.screenshot({ path: `test-results/screenshots/child-${i + 1}-error.png` });
        throw error;
      }
    });
  }

    
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            try {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
          } catch (error) {
            await page.screenshot({ path: `test-results/screenshots/infant-${i + 1}-error.png` });
            throw error;
          }
          }
        });
      }

  test('fillcontact', async () => {
    try {
      await page.locator('#contact').click();
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000);
    } catch (error) {
      await page.screenshot({ path: 'test-results/screenshots/fillcontact-error.png' });
      throw error;
    }
  });

  test('payWithCard', async () => {
    try {
      await payWithCardInformation(page, payCardData);
    } catch (error) {
      await page.screenshot({ path: 'test-results/screenshots/payWithCard-error.png' });
      throw error;
    }
  });
});


