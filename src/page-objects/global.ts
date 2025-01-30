import { type Page, type BrowserContext } from '@playwright/test';
import { 
  userDataADT, CabinClass, CabinType, 
  paymentCards, MoneyChosee, LenguageChoose 
} from '../fixtures/userData';
import { entornoData } from '../fixtures/environmentData';
import { ruteData } from '../fixtures/ruteData';
import { PassengerManager } from './PassengerManager';
import { FlightSelector } from './FlightSelector';
import { PaymentProcessor } from './PaymentProcessor';
import { Logger } from '../utils/Logger';

interface FlightSelectionData {
  origin: string;
  destination: string;
  dates?: {
    departure: string;
    return: string;
  };
  passengers: {
    adults: any[];
    children: any[];
    infants: any[];
  };
  cabinClass: {
    outbound: CabinClass;
    return: CabinClass;
  };
}

interface PassengerData {
  name: string;
  surname: string;
  nationality: string;
  phone: string;
  email: string;
}

interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  name: string;
}

export class BookingTest {
  private page: Page;
  private context: BrowserContext;
  private passengerManager: PassengerManager;
  private flightSelector: FlightSelector;
  private paymentProcessor: PaymentProcessor;
  private logger: Logger;

  constructor(page: Page, context: BrowserContext) {
    this.page = page;
    this.context = context;
    this.passengerManager = new PassengerManager(page);
    this.flightSelector = new FlightSelector(page);
    this.paymentProcessor = new PaymentProcessor(page);
    this.logger = new Logger();
  }

  async initializeTest() {
    await this.page.goto(entornoData.pre.url);
    await this.acceptCookies();
    await this.setLanguageAndCurrency();
  }

  private async acceptCookies() {
    try {
      await this.page.getByRole('button', { name: 'Accept all cookies' }).click();
    } catch (error) {
      this.logger.error('Failed to accept cookies:', error);
      throw error;
    }
  }

  private async setLanguageAndCurrency() {
    try {
      await this.page.getByRole('button', { name: ' EN' }).click();
      await this.page.click(`div[aria-labelledby="collapsible-nav-dropdown"] .dropdown-item:text("${LenguageChoose}")`);
      
      if (MoneyChosee !== 'USD') {
        await this.page.getByRole('button', { name: 'USD ($)' }).click();
        await this.page.getByRole('button', { name: MoneyChosee }).click();
      }
    } catch (error) {
      this.logger.error('Failed to set language and currency:', error);
      throw error;
    }
  }

  async selectFlight(flightData: FlightSelectionData) {
    await this.flightSelector.selectOriginDestination(flightData.origin, flightData.destination);
    await this.flightSelector.selectDates(flightData);
    await this.flightSelector.selectPassengers(flightData);
    await this.flightSelector.selectCabinClass(flightData);
  }

  async fillPassengerDetails(flightData: FlightSelectionData) {
    // Adults     
    for (let i = 0; i < flightData.passengers.adults.length; i++) {
        await this.executeWithRetry(
            async () => {
                await this.passengerManager.fillPassengerInformation(
                    'Adult', 
                    flightData.passengers.adults[i],
                    'adults',
                    i,
                    flightData.language,
                    flightData.dayOffset
                );
            },
            `fillPassengerAdult-${i + 1}`
        );
    }
    
    // Children     
    for (let i = 0; i < flightData.passengers.children.length; i++) {
        await this.executeWithRetry(
            async () => {
                await this.passengerManager.fillPassengerInformation(
                    'Child',
                    flightData.passengers.children[i],
                    'children', 
                    i,
                    flightData.language,
                    flightData.dayOffset
                );
            },
            `fillPassengerChild-${i + 1}`
        );
    }
    
    // Infants
    for (let i = 0; i < flightData.passengers.infants.length; i++) {
        await this.executeWithRetry(
            async () => {
                await this.passengerManager.fillPassengerInformation(
                    'Infant',
                    flightData.passengers.infants[i],
                    'infants',
                    i,
                    flightData.language,
                    flightData.dayOffset
                );
            },
            `fillPassengerInfant-${i + 1}`
        );
    }

}

async fillContactDetails(testData: FlightSelectionData, action: 'purchase' | 'customize') {

    await this.page.locator('#contact').click();
    await this.page.locator('input[name="contactDetails\\.name"]').fill(testData.passengers.adults[0].name);
    await this.page.locator('input[name="contactDetails\\.surname"]').fill(testData.passengers.adults[0].surname);
    await this.page.getByPlaceholder('Prefix').click();
    await this.page.getByLabel('Åland Islands (+358)').click();
    await this.page.locator('input[name="contactDetails.phone"]').fill(testData.passengers.adults[0].phone);
    await this.page.locator('input[name="contactDetails.email"]').fill(testData.passengers.adults[0].email);
    
    if (action === 'purchase') {
        await this.page.getByRole('button', { name: 'Complete your purchase' }).click();
    } else {
        await this.page.getByRole('button', { name: 'Customize your flight' }).click();
    }
    
    await this.page.waitForTimeout(1000);
       
}

  async processPayment(paymentDetails: PaymentData) {
    if (!entornoData.pre.url.includes('prod')) {
      await this.paymentProcessor.processPayment(paymentDetails);
      await this.paymentProcessor.verifyConfirmation();
    }
  }

  async executeWithRetry<T>(
    action: () => Promise<T>,
    actionName: string,
    maxRetries: number = 3
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.info(`Attempting ${actionName} (${attempt}/${maxRetries})`);
        return await action();
      } catch (error) {
        if (attempt === maxRetries) {
          await this.takeErrorScreenshot(actionName);
          throw error;
        }
        this.logger.warn(`${actionName} failed, retrying...`, error);
      }
    }
    throw new Error(`Failed to execute ${actionName} after ${maxRetries} attempts`);
  }

  private async takeErrorScreenshot(actionName: string) {
    const screenshotPath = `test-results/screenshots/${actionName}-error.png`;
    await this.page.screenshot({ path: screenshotPath });
    this.logger.info(`Screenshot saved at: ${screenshotPath}`);
  }
}

// Test configuration
export const testConfig = {
  timeout: 240000,
  retries: 5,
  testData: {
    origin: ruteData.origin,
    destination: ruteData.destination,
    passengers: {
      adults: [userDataADT[0]],
      children: [],
      infants: []
    },
    cabinClass: {
      outbound: CabinClass.ECONOMY,
      return: CabinClass.ECONOMY
    },
    cabinType: {
      outbound: CabinType.LIGHT,
      return: CabinType.LIGHT
    }
  }
};
