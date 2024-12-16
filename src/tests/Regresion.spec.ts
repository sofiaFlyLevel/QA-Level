import { test, expect } from '@playwright/test';
import { userDataADT, userDataCHD, userDataINL, CabinClass, CabinType, paymentCards} from '../fixtures/userData';
import { entornoData, apiData } from '../fixtures/environmentData';
import { ruteData } from '../fixtures/ruteData';
import {fillPassengerData, fillPassengerFor} from '../page-objects/PassengerPage'
import {selectRoundTripDates, adjustPassengerCount} from '../page-objects/searchPage'
import {selectFlights} from '../page-objects/FlightPage'
import {payWithCard} from '../page-objects/paymentPage'
// import {handleErrorWithScreenshot} from '../page-objects/basePage'
import fs from 'fs';
// C:\Users\sofiamartínezlópez\AppData\Roaming\Python\Python312\Scripts\trcli -y -h "https://leveltestautomation.testrail.io" -u "sofiainkoova@gmail.com" -p "TestRail1!" --project "Level" parse_junit -f "./test-results/junit-report.xml" --title "Playwright Automated Test Run"
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

// Function to toggle cities (origin and destination)
async function toggleCityButton(page) {
  await page.locator('.swap-btn-icon.flight-swap-icon.icon-swap-black').click();
  await page.locator('.swap-btn-icon.flight-swap-icon.icon-swap-black').click();
}

// Function to select round trip dates
async function chooseDate(page, apiData, Origin, Destination) {
  await selectRoundTripDates(page, apiData, Origin, Destination);
}

// Function to adjust the number of passengers
async function choosePassengers(page, DataADT, DataCHD, DataINL) {
  await adjustPassengerCount(page, DataADT, DataCHD, DataINL);
  await page.locator('#searcher_submit_button').click();
}

// Function to select flights for outbound and return
async function chooseFlights(page, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType) {
  await selectFlights(page, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType);
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
  await chooseCity(page, Origin, Destination);

  await toggleCityButton(page);

  await chooseDate(page, apiData, Origin, Destination);

  await choosePassengers(page, DataADT, DataCHD, DataINL);

  await chooseFlights(page, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType);

}

// Test Suite
test.describe('Compra 1 Adulto Economy Light - Economy Light - Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
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

    // Initial configuration before running tests
    test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
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


   // Initial configuration before running tests
   test.beforeAll(async ({ browser }) => {
    // Create folder if it doesn't exist
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }
    const context = await browser.newContext();
    page = await context.newPage();

    // Open the page only once at the start
    await openWebsiteAndAcceptCookies(page);
  });

  // Close the context and page after all tests
  test.afterAll(async () => {
    await page.close();
  });

  test('Booking', async () => {
    await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
  });

    // Llenado de información para adultos (con un for para varios adultos)
  for (let i = 0; i < DataADT.length; i++) {
    test(`fillPassengerAdult ${i + 1}`, async () => {
      if (DataADT.length > 0) {
        await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
      }
    });
  }

  // Llenado de información para adultos (con un for para varios adultos)
  for (let i = 0; i < DataCHD.length; i++) {
    test(`fillPassengerChild ${i + 1}`, async () => {
      if (DataCHD.length > 0) {
        await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);

      }
    });
  }


    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
          await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
          await page.waitForTimeout(5000); // Espera 5 segundos  
        }
      });
    }


  test('fillcontact', async () => {

       
    await page.locator('#contact').click();
  
    await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
    await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
    
    await page.getByRole('button', { name: 'Complete your purchase' }).click();
    await page.waitForTimeout(5000); // Wait for 5 seconds
  }); 

  test('payWithCard', async () => {
   
    await payWithCardInformation(page, payCardData);
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


    // Initial configuration before running tests
    test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
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


    // Initial configuration before running tests
    test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
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


     // Initial configuration before running tests
     test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
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


     // Initial configuration before running tests
     test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
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


     // Initial configuration before running tests
     test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
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


    // Initial configuration before running tests
    test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
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


     // Initial configuration before running tests
     test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
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


    // Initial configuration before running tests
    test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
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


    // Initial configuration before running tests
    test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
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

   // Initial configuration before running tests
   test.beforeAll(async ({ browser }) => {
    // Create folder if it doesn't exist
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }
    const context = await browser.newContext();
    page = await context.newPage();

    // Open the page only once at the start
    await openWebsiteAndAcceptCookies(page);
  });

  // Close the context and page after all tests
  test.afterAll(async () => {
    await page.close();
  });

  test('Booking', async () => {
    await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
  });

    // Llenado de información para adultos (con un for para varios adultos)
  for (let i = 0; i < DataADT.length; i++) {
    test(`fillPassengerAdult ${i + 1}`, async () => {
      if (DataADT.length > 0) {
        await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
      }
    });
  }

  // Llenado de información para adultos (con un for para varios adultos)
  for (let i = 0; i < DataCHD.length; i++) {
    test(`fillPassengerChild ${i + 1}`, async () => {
      if (DataCHD.length > 0) {
        await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);

      }
    });
  }


    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
          await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
          await page.waitForTimeout(5000); // Espera 5 segundos  
        }
      });
    }


  test('fillcontact', async () => {

       
    await page.locator('#contact').click();
  
    await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
    await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
    
    await page.getByRole('button', { name: 'Complete your purchase' }).click();
    await page.waitForTimeout(5000); // Wait for 5 seconds
  }); 

  test('payWithCard', async () => {
   
    await payWithCardInformation(page, payCardData);
  });
});


//Cabinas 


// Ida: Economy - Light, Vuelta: Economy - Comfort
test.describe('Compra 1 Adulto Economy Light - Economy COMFORT- Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
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
  const returnFlightType = CabinType.COMFORT;


     // Initial configuration before running tests
     test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
    });
});


// Ida: Economy - Light, Vuelta: Economy - Extra
test.describe('Compra 1 Adulto Economy Light - Economy Extra- Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
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
  const returnFlightType = CabinType.EXTRA;


     // Initial configuration before running tests
     test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
    });
});

// Ida: Economy - Light, Vuelta: Premium - Light
test.describe('Compra 1 Adulto Economy Light -  Premium Light- Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
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
  const returnFlightClass = CabinClass.PREMIUM;
  const returnFlightType = CabinType.LIGHT;


     // Initial configuration before running tests
     test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
    });
});

// Ida: Economy - Light, Vuelta: Premium - Comfort
test.describe('Compra 1 Adulto Economy Light -  Premium Comfort- Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
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
  const returnFlightClass = CabinClass.PREMIUM;
  const returnFlightType = CabinType.COMFORT;


     // Initial configuration before running tests
     test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
    });

});

// Ida: Economy - Light, Vuelta: Premium - Extra
test.describe('Compra 1 Adulto Economy Light -  Premium Extra- Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
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
  const returnFlightClass = CabinClass.PREMIUM;
  const returnFlightType = CabinType.EXTRA;


     // Initial configuration before running tests
     test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
    });

});

// Ida: Economy - Comfort, Vuelta: Economy - Comfort

test.describe('Compra 1 Adulto Economy Comfort - Economy Comfort- Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
  let payCardData = paymentCards[0]; 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.COMFORT;

  // vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.COMFORT;

   // Initial configuration before running tests
   test.beforeAll(async ({ browser }) => {
    // Create folder if it doesn't exist
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }
    const context = await browser.newContext();
    page = await context.newPage();

    // Open the page only once at the start
    await openWebsiteAndAcceptCookies(page);
  });

  // Close the context and page after all tests
  test.afterAll(async () => {
    await page.close();
  });

  test('Booking', async () => {
    await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
  });

    // Llenado de información para adultos (con un for para varios adultos)
  for (let i = 0; i < DataADT.length; i++) {
    test(`fillPassengerAdult ${i + 1}`, async () => {
      if (DataADT.length > 0) {
        await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
      }
    });
  }

  // Llenado de información para adultos (con un for para varios adultos)
  for (let i = 0; i < DataCHD.length; i++) {
    test(`fillPassengerChild ${i + 1}`, async () => {
      if (DataCHD.length > 0) {
        await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);

      }
    });
  }


    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
          await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
          await page.waitForTimeout(5000); // Espera 5 segundos  
        }
      });
    }


  test('fillcontact', async () => {

       
    await page.locator('#contact').click();
  
    await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
    await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
    
    await page.getByRole('button', { name: 'Complete your purchase' }).click();
    await page.waitForTimeout(5000); // Wait for 5 seconds
  }); 

  test('payWithCard', async () => {
   
    await payWithCardInformation(page, payCardData);
  });
});

// Ida: Economy - Comfort, Vuelta: Economy - Extra

test.describe('Compra 1 Adulto Economy Comfort - Economy Extra- Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
  let payCardData = paymentCards[0]; 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.COMFORT;

  // vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.EXTRA;


     // Initial configuration before running tests
     test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
    });
});

// Ida: Economy - Comfort, Vuelta: Premium - Light
test.describe('Compra 1 Adulto Economy Comfort - Premium Light- Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
  let payCardData = paymentCards[0]; 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.COMFORT;

  // vuelta
  const returnFlightClass = CabinClass.PREMIUM;
  const returnFlightType = CabinType.LIGHT;


     // Initial configuration before running tests
     test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
    });
});

// Ida: Economy - Comfort, Vuelta: Premium - Comfort
test.describe('Compra 1 Adulto Economy Comfort - Premium Comfort- Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
  let payCardData = paymentCards[0]; 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.COMFORT;

  // vuelta
  const returnFlightClass = CabinClass.PREMIUM;
  const returnFlightType = CabinType.COMFORT;


    // Initial configuration before running tests
    test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
    });
});

// Ida: Economy - Comfort, Vuelta: Premium - Extra
test.describe('Compra 1 Adulto Economy Comfort - Premium Extra- Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
  let payCardData = paymentCards[0]; 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.COMFORT;

  // vuelta
  const returnFlightClass = CabinClass.PREMIUM;
  const returnFlightType = CabinType.EXTRA;


    // Initial configuration before running tests
    test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
    });
});

// Ida: Economy - Extra, Vuelta: Economy - Light
test.describe('Compra 1 Adulto Economy Extra - Economy Light- Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
  let payCardData = paymentCards[0]; 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.EXTRA;

  // vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.LIGHT;


    // Initial configuration before running tests
    test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
    });
});

// Ida: Economy - Extra, Vuelta: Economy - Comfort
test.describe('Compra 1 Adulto Economy Extra - Economy Comfort- Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
  let payCardData = paymentCards[0]; 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.EXTRA;

  // vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.COMFORT;


    // Initial configuration before running tests
    test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
    });
});

// Ida: Economy - Extra, Vuelta: Economy - Extra
test.describe('Compra 1 Adulto Economy Extra - Economy Extra- Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
  let payCardData = paymentCards[0]; 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.EXTRA;

  // vuelta
  const returnFlightClass = CabinClass.ECONOMY;
  const returnFlightType = CabinType.EXTRA;


     // Initial configuration before running tests
     test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
    });
});

// Ida: Economy - Extra, Vuelta: Premium - Light
test.describe('Compra 1 Adulto Economy Extra - Premium Light- Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
  let payCardData = paymentCards[0]; 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.EXTRA;

  // vuelta
  const returnFlightClass = CabinClass.PREMIUM;
  const returnFlightType = CabinType.LIGHT;


     // Initial configuration before running tests
     test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
    });
});

// Ida: Economy - Extra, Vuelta: Premium - Comfort

test.describe('Compra 1 Adulto Economy Extra - Premium Comfort- Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
  let payCardData = paymentCards[0]; 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.EXTRA;

  // vuelta
  const returnFlightClass = CabinClass.PREMIUM;
  const returnFlightType = CabinType.COMFORT;


    // Initial configuration before running tests
    test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
    });
});

// Ida: Economy - Extra, Vuelta: Premium - Extra

test.describe('Compra 1 Adulto Economy Extra - Premium Extra- Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
  let page;
  let Origin = ruteData.origin;
  let Destination = ruteData.destination;
  let DataADT = [userDataADT[0]]; 
  let DataCHD = []; 
  let DataINL = []; 
  let payCardData = paymentCards[0]; 

  //ida 
  const outboundFlightClass = CabinClass.ECONOMY;
  const outboundFlightType = CabinType.EXTRA;

  // vuelta
  const returnFlightClass = CabinClass.PREMIUM;
  const returnFlightType = CabinType.EXTRA;


     // Initial configuration before running tests
     test.beforeAll(async ({ browser }) => {
      // Create folder if it doesn't exist
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
      const context = await browser.newContext();
      page = await context.newPage();
  
      // Open the page only once at the start
      await openWebsiteAndAcceptCookies(page);
    });
  
    // Close the context and page after all tests
    test.afterAll(async () => {
      await page.close();
    });
  
    test('Booking', async () => {
      await global(page, Origin, Destination, DataADT, DataCHD, DataINL, outboundFlightClass, outboundFlightType, returnFlightClass, payCardData, returnFlightType);
    });
  
      // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataADT.length; i++) {
      test(`fillPassengerAdult ${i + 1}`, async () => {
        if (DataADT.length > 0) {
          await fillPassengerInformation(page, 'Adult', DataADT[i], 'adults', i);
        }
      });
    }
  
    // Llenado de información para adultos (con un for para varios adultos)
    for (let i = 0; i < DataCHD.length; i++) {
      test(`fillPassengerChild ${i + 1}`, async () => {
        if (DataCHD.length > 0) {
          await fillPassengerInformation(page, 'Child', DataCHD[i], 'children', i);
  
        }
      });
    }
  
  
      // Llenado de información para adultos (con un for para varios adultos)
      for (let i = 0; i < DataINL.length; i++) {
        test(`fillPassengerInfant ${i + 1}`, async () => {
          if (DataINL.length > 0) {
            await fillPassengerInformation(page, 'Infant', DataINL[i], 'infants', i);
            await page.waitForTimeout(5000); // Espera 5 segundos  
          }
        });
      }
  
  
    test('fillcontact', async () => {
  
         
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
      
      await page.getByRole('button', { name: 'Complete your purchase' }).click();
      await page.waitForTimeout(5000); // Wait for 5 seconds
    }); 
  
    test('payWithCard', async () => {
     
      await payWithCardInformation(page, payCardData);
    });
});

// Ida: Premium - Light, Vuelta: Economy - Light
// test.describe('Compra 1 Adulto Economy Extra - Premium Extra- Nombre sin caracteres especiales - sin assitence - sin asiento - sin extras', () => {
//   let page;
//   let Origin = ruteData.origin;
//   let Destination = ruteData.destination;
//   let DataADT = [userDataADT[0]]; 
//   let DataCHD = []; 
//   let DataINL = []; 
//   let payCardData = paymentCards[0]; 

//   //ida 
//   const outboundFlightClass = CabinClass.ECONOMY;
//   const outboundFlightType = CabinType.EXTRA;

//   // vuelta
//   const returnFlightClass = CabinClass.PREMIUM;
//   const returnFlightType = CabinType.EXTRA;


//   // Configuración inicial antes de ejecutar los tests
//   test.beforeAll(async ({ browser }) => {
//     // Crear la carpeta si no existe
//     if (!fs.existsSync('screenshots')) {
//       fs.mkdirSync('screenshots');
//     }
//     const context = await browser.newContext();
//     page = await context.newPage();

//     // Abre la página solo una vez al inicio
//     await page.goto(ENTORNO);

//     await page.getByRole('button', { name: 'Accept all cookies' }).click();
//   });

//   // Cierra el contexto y la página al finalizar todos los tests
//   test.afterAll(async () => {
//     await page.close();
//   });

//   test('chooseCity', async () => {
//     await page.locator('div.searcher-input.station-selector.origin').click();
//     await page.locator('div.iata', { hasText: Origin }).nth(0).click();
//     await page.locator('div.iata').filter({ hasText: Destination }).nth(1).click();
//   });

//   test('toggleCityButton', async () =>{
//     await page.locator('.swap-btn-icon.flight-swap-icon.icon-swap-black').click();
//     await page.locator('.swap-btn-icon.flight-swap-icon.icon-swap-black').click();

//     //comprobar que el destino es el correcto 
    
//   });

//   //mirar que sea el mes que estamos
//   //la vuelta es lo mismo pero intercambiando origen-destino 
//   // escoger la fecha de vuelta, más tarde de la de ida 
//   // guadar la informacion de las fechas selecionadas en un una variable 

//   test('chooseDate', async () => {
//     const tripDates = await selectRoundTripDates(page, apiData, Origin, Destination);

//     // Acceder a las fechas seleccionadas
//     const departureDate = tripDates.selectedDepartureDate;
//     const returnDate = tripDates.selectedReturnDate;

//     // Mostrar las fechas seleccionadas en la consola (opcional)
// // console.log('Fecha de salida:', departureDate);
// // console.log('Fecha de regreso:', returnDate);
//   });
  
 

//   test('choosePassage', async () => {
//     await adjustPassengerCount(page, DataADT, DataCHD, DataINL); 

//     await page.locator('#searcher_submit_button').click();

//   });

//   test('chosseFlights', async () => {

//   await selectFlights(page, outboundFlightClass, outboundFlightType, returnFlightClass, returnFlightType); 

//   await page.getByRole('button', { name: 'Continue' }).click();

//   }); 

//   test('fillPassengerData', async () => {
//     try {
//       await fillPassengerData(page, DataADT, DataCHD, DataINL);
//     } catch (error) {
//       // await handleErrorWithScreenshot(page, error, 'fillPassengerData');
//         console.error('Error al llenar datos de pasajeros:', error);
//     }

//     await page.getByRole('button', { name: 'Complete your purchase' }).click();
//     await page.waitForTimeout(5000); // Espera 5 segundos
     
//   });

//   test('payWithCard', async () => {

//     await payWithCard(page, payCardData); 
   
//     await page.waitForTimeout(10000); // Espera 10 segundos
//   }); 

  

// });

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