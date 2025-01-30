// import { test } from '@playwright/test';
// import { BookingTest } from '../page-objects/global';
// import { 
//   userDataADT, CabinClass, CabinType, 
//   paymentCards, Language, MoneyChosee, LenguageChoose 
// } from '../fixtures/userData';
// import { ruteData } from '../fixtures/ruteData';
// import { entornoData, apiData } from '../fixtures/environmentData';

// test.describe('Flight Booking Tests', () => {
//   const ENTORNO = entornoData.pre.url;
//   const isProdEnvironment = ENTORNO === entornoData.prod.url;
  
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
//     payment: paymentCards[0],
//     lenguageChoose: LenguageChoose,
//     moneyChoose: MoneyChosee
//   };

//   const MAX_EXECUTION_RETRIES = 5;
//   const MAX_TEST_RETRIES = 3;
//   const RETRY_DELAY = 5000;

//   test('Complete booking flow with seat selection', async ({ browser }) => {
//     let executionAttempt = 0;
//     let success = false;
//     let lastError = null;

//     while (executionAttempt < MAX_EXECUTION_RETRIES && !success) {
//       executionAttempt++;
//       console.log(`Complete execution attempt ${executionAttempt} of ${MAX_EXECUTION_RETRIES}`);

//       let context = null;
//       let page = null;

//       try {
//         // Create new context and page for each attempt
//         context = await browser.newContext({
//           storageState: undefined
//         });
//         page = await context.newPage();

//         // Navigate to the website
//         await page.goto(ENTORNO);
        
//         // Accept cookies
//         await page.getByRole('button', { name: 'Accept all cookies' }).click();

//         const bookingTest = new BookingTest(page, context);

//         // Execute the test steps with retries
//         await bookingTest.executeWithRetries(async () => {
//           // Set language and currency
//           await bookingTest.setLanguageAndCurrency(testData.lenguageChoose, testData.moneyChoose);
          
//           // Select flight parameters
//           await bookingTest.selectFlightParameters(testData);
          
//           // Fill passenger details
//           await bookingTest.fillAllPassengerDetails(testData.passengers);
          
//           // Fill contact details
//           await bookingTest.fillContactDetails(testData.passengers.adults[0]);
          
//           // Select seats
//           await bookingTest.selectSeats();
          
//           // Handle baggage
//           await bookingTest.handleBaggage();
          
//           // Process payment if not in production
//           if (!isProdEnvironment) {
//             await bookingTest.processPayment(testData.payment);
//             await bookingTest.validateConfirmation();
//           }
//         }, MAX_TEST_RETRIES);

//         success = true;

//       } catch (error) {
//         lastError = error;
//         console.error(`Execution attempt ${executionAttempt} failed:`, error);
        
//         if (error.fatal || error.name === 'ValidationError') {
//           if (page) await page.screenshot({ path: `test-results/error-${executionAttempt}.png` });
//           throw error;
//         }
        
//         if (executionAttempt < MAX_EXECUTION_RETRIES) {
//           console.log(`Retrying complete execution in ${RETRY_DELAY/1000} seconds...`);
//           await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
//         }
//       } finally {
//         // Always close the page and context, even if there's an error
//         if (page) await page.close();
//         if (context) await context.close();
//       }
//     }

//     if (!success) {
//       throw new Error(`Test failed after ${MAX_EXECUTION_RETRIES} complete execution attempts. Last error: ${lastError}`);
//     }
//   }, 240000);
// });