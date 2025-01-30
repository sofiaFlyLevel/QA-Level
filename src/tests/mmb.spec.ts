import { test, type Page } from '@playwright/test';
import { MoneyChosee, LenguageChoose } from '../fixtures/userData';
import { entornoData } from '../fixtures/environmentData';
import * as XLSX from 'xlsx';

let ENTORNO = entornoData.pre.url; 
const isProdEnvironment = ENTORNO === entornoData.prod.url;


async function readLastBookingCode() {
  try {
    const fileName = 'booking_codes.xlsx';
    const workbook = XLSX.readFile(fileName);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Get the range of data
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    // Get the last row's booking code (column A)
    const lastRowIndex = range.e.r;
    const bookingCodeCell = XLSX.utils.encode_cell({ r: lastRowIndex, c: 0 });
    const lastBookingCode = worksheet[bookingCodeCell]?.v;
    
    if (!lastBookingCode) {
      throw new Error('No booking code found in Excel file');
    }
    
    return lastBookingCode;
  } catch (error) {
    console.error('Error reading from Excel:', error);
    throw error;
  }
}

async function openWebsiteAndAcceptCookies(page) {
  await page.goto(ENTORNO);
  await page.getByRole('button', { name: 'Accept all cookies' }).click();
}

async function chooseMMB(page, bookingCode) {
  await page.getByText('My Booking').click();
  await page.getByPlaceholder('AY8E7D').click();
  await page.getByPlaceholder('AY8E7D').fill(bookingCode);
  await page.getByPlaceholder('email@xxx.com').click();
  await page.getByPlaceholder('email@xxx.com').fill('sofiainkoova@gmail.com');
  await page.getByRole('button', { name: 'Continue' }).click();
}

async function chooseLengMoney(page) {
  await page.getByRole('button', { name: ' EN' }).click();
  await page.click(`div[aria-labelledby="collapsible-nav-dropdown"] .dropdown-item:text("${LenguageChoose}")`);
  await page.waitForTimeout(1000);

  if(MoneyChosee != 'USD'){
    await page.getByRole('button', { name: 'USD ($)' }).click();
    await page.getByRole('button', { name: MoneyChosee }).click();
  }
}

async function global(page) {
  try {
    const bookingCode = await readLastBookingCode();
    await chooseLengMoney(page); 
    await chooseMMB(page, bookingCode);
    await page.waitForTimeout(10000);
  } catch (error) {
    console.error('Error in global function:', error);
    throw error;
  }
}

const runWithRetries = async (fn, screenshotPath, testName, page, TEST_RETRIES) => {
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

const executeTests = async (browser, context, page, TEST_RETRIES) => {
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

test.describe('Comporbar MMB', () => {
  let page;
  let context;

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