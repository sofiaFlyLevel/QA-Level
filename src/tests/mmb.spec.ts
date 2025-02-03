import { test, type Page } from '@playwright/test';
import { MoneyChosee, LenguageChoose } from '../fixtures/userData';
import { entornoData } from '../fixtures/environmentData';
import * as XLSX from 'xlsx';

let ENTORNO = entornoData.pre.url;
const isProdEnvironment = ENTORNO === entornoData.prod.url;
const FIXED_EMAIL = 'sofiainkoova@gmail.com';

async function readBookingCodes(): Promise<string[]> {
  try {
    const fileName = 'booking_codes.xlsx';
    const workbook = XLSX.readFile(fileName);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Get the range of data
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const bookingCodes: string[] = [];
    
    // Read all booking codes from column A
    for (let rowIndex = 1; rowIndex <= range.e.r; rowIndex++) { // Start from 1 to skip header
      const bookingCodeCell = worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })];
      
      if (bookingCodeCell?.v) {
        bookingCodes.push(bookingCodeCell.v.toString());
      }
    }
    
    if (bookingCodes.length === 0) {
      throw new Error('No booking codes found in Excel file');
    }
    
    return bookingCodes;
  } catch (error) {
    console.error('Error reading from Excel:', error);
    throw error;
  }
}

async function openWebsiteAndAcceptCookies(page: Page) {
  await page.goto(ENTORNO);
  await page.getByRole('button', { name: 'Accept all cookies' }).click();
}

async function chooseMMB(page: Page, bookingCode: string) {
  await page.getByText('My Booking').click();
  await page.getByPlaceholder('AY8E7D').click();
  await page.getByPlaceholder('AY8E7D').fill(bookingCode);
  await page.getByPlaceholder('email@xxx.com').click();
  await page.getByPlaceholder('email@xxx.com').fill(FIXED_EMAIL);
  await page.getByRole('button', { name: 'Continue' }).click();
}

async function chooseLengMoney(page: Page) {
  await page.getByRole('button', { name: ' EN' }).click();
  await page.click(`div[aria-labelledby="collapsible-nav-dropdown"] .dropdown-item:text("${LenguageChoose}")`);
  await page.waitForTimeout(1000);

  if(MoneyChosee != 'USD'){
    await page.getByRole('button', { name: 'USD ($)' }).click();
    await page.getByRole('button', { name: MoneyChosee }).click();
  }
}

async function processBookingCode(page: Page, bookingCode: string) {
  try {
    await chooseMMB(page, bookingCode);
    
    // Wait for navigation and verify URL
    await page.waitForURL((url) => url.pathname.includes('/nwe/mmb/'));
    
    // Verify booking code matches
    const displayedCode = await page.locator('div.booking-code__code').textContent();
    if (displayedCode !== bookingCode) {
      throw new Error(`Booking code mismatch: expected ${bookingCode}, got ${displayedCode}`);
    }
    
    // Return to initial state for next booking
    await page.goto(ENTORNO);
  } catch (error) {
    console.error(`Error processing booking code ${bookingCode}:`, error);
    throw error;
  }
}

async function global(page: Page) {
  try {
    const bookingCodes = await readBookingCodes();
    console.log(`Found ${bookingCodes.length} booking codes to process`);
    
    for (const bookingCode of bookingCodes) {
      console.log(`Processing booking code: ${bookingCode}`);
      await processBookingCode(page, bookingCode);
    }
  } catch (error) {
    console.error('Error in global function:', error);
    throw error;
  }
}

const runWithRetries = async (fn: () => Promise<void>, screenshotPath: string, testName: string, page: Page, TEST_RETRIES: number) => {
  for (let attempt = 1; attempt <= TEST_RETRIES; attempt++) {
    try {
      console.log(`Ejecutando ${testName}, intento ${attempt}`);
      await fn();
      return true;
    } catch (error) {
      console.error(`Intento ${attempt} fallido en ${testName}:`, error);
      if (attempt === TEST_RETRIES) {
        await page.screenshot({ path: screenshotPath });
        console.error(`Prueba ${testName} fallida después de ${TEST_RETRIES} intentos.`);
        return false;
      }
    }
  }
};

const executeTests = async (browser: any, context: any, page: Page, TEST_RETRIES: number) => {
  let shouldContinueTests = true;
  try {
    context = await browser.newContext();
    page = await context.newPage();
    await openWebsiteAndAcceptCookies(page);

    shouldContinueTests = await runWithRetries(
      () => global(page),
      'test-results/screenshots/booking-error.png',
      'Booking',
      page, 
      TEST_RETRIES
    );

    if (!shouldContinueTests) return shouldContinueTests;

  } catch (error) {
    console.error('Error crítico durante la ejecución:', error);
    shouldContinueTests = false;
  } finally {
    if (page) await page.close();
    if (context) await context.close();
  }

  return shouldContinueTests;
};

test.describe('Comprobar MMB', () => {
  let page: Page;
  let context: any;

  test('Ejecución completa con reintentos', async ({ browser }) => {
    let executionAttempt = 0;
    const MAX_RETRIES = 5;
    const TEST_RETRIES = 3;
    let shouldContinueTests = false;
  
    while (executionAttempt < MAX_RETRIES && !shouldContinueTests) {
      executionAttempt++;
      console.log(`Ejecución completa, intento ${executionAttempt} de ${MAX_RETRIES}`);
      shouldContinueTests = await executeTests(browser, context, page, TEST_RETRIES);
  
      if (shouldContinueTests) break;
    }
  
    if (!shouldContinueTests) {
      throw new Error(`Pruebas fallidas después de ${MAX_RETRIES} intentos completos.`);
    }
  }, 240000);
});