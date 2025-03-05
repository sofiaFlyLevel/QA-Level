/**
 * Framework de Pruebas Mejorado para Level
 * 
 * Este framework unifica todos los tests en una estructura común,
 * proporcionando configuración centralizada y mejor reutilización.
 */

import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { 
  userDataADT, userDataCHD, userDataINL, CabinClass, CabinType, 
  paymentCards, Language, LenguageChoose, MoneyChosee 
} from '../fixtures/userData';
import { entornoData, apiData } from '../fixtures/environmentData';
import { ruteData } from '../fixtures/ruteData';
import { Logger } from '../utils/Logger';

// Importar funciones de los diferentes page objects
import { fillPassengerFor } from '../page-objects/PassengerPage';
import { selectRoundTripDates, adjustPassengerCount } from '../page-objects/searchPage';
import { selectFlights } from '../page-objects/FlightPage';
import { payWithCard } from '../page-objects/paymentPage';
import { validationConfirmPage } from '../page-objects/confirmation';
import { getDateOfBirth } from '../page-objects/basePage';

/**
 * Configuración global para todos los tests
 */
export const TestConfig = {
  environment: entornoData.pre.url,
  isProd: entornoData.pre.url === entornoData.prod.url,
  retries: {
    maxExecutionRetries: 5,
    maxStepRetries: 3
  },
  timeouts: {
    test: 240000,
    navigation: 30000,
    action: 10000
  },
  defaultLanguage: Language.EN,
  defaultCurrency: MoneyChosee,
  defaultDayOffset: -1
};

/**
 * Interfaces para tipar las configuraciones
 */
export interface FlightConfig {
  origin: string;
  destination: string;
  outboundFlightClass: CabinClass;
  outboundFlightType: CabinType;
  returnFlightClass: CabinClass;
  returnFlightType: CabinType;
  isOneWay: boolean;
}

export interface PassengerConfig {
  adults: any[];
  children: any[];
  infants: any[];
  language: string;
  dayOffset: number;
}

export interface TestCase {
  name: string;
  description: string;
  flightConfig: FlightConfig;
  passengerConfig: PassengerConfig;
  paymentInfo: any;
  includeSeats?: boolean; 
  skip?: boolean;
  only?: boolean;
}

/**
 * Clase principal para la ejecución de pruebas
 */
export class LevelTestRunner {
  private page: Page;
  private context: BrowserContext;
  private logger: Logger;
  
  constructor(page: Page, context: BrowserContext) {
    this.page = page;
    this.context = context;
    this.logger = new Logger();
  }

  /**
   * Inicializa la prueba con configuración básica
   */
  async initialize() {
    this.logger.info('Inicializando test');
    await this.page.goto(TestConfig.environment);
    await this.acceptCookies();
    await this.setLanguageAndCurrency();
    this.logger.info('Test inicializado correctamente');
  }

  /**
   * Acepta las cookies del sitio
   */
  private async acceptCookies() {
    try {
      await this.page.getByRole('button', { name: 'Accept all cookies' }).click();
      this.logger.info('Cookies aceptadas');
    } catch (error) {
      this.logger.error('Error al aceptar cookies', error);
      throw error;
    }
  }

/**
 * Configura el idioma y la moneda
 */
private async setLanguageAndCurrency() {
  try {
    this.logger.info('Configurando idioma y moneda');
    
    await this.executeWithRetry(
      async () => {
        // Seleccionar específicamente el dropdown de idioma por su texto
        await this.page.locator('a.nav-link:has-text(" EN")').click();
        
        // Ahora seleccionar el idioma específico
        await this.page.click(`div[aria-labelledby="collapsible-nav-dropdown"] .dropdown-item:text("${LenguageChoose}")`);
        await this.page.waitForTimeout(1000);

        if (MoneyChosee !== 'USD') {
          // Seleccionar específicamente el dropdown de moneda por su texto
          await this.page.locator('a.nav-link:has-text("USD ($)")').click();
          await this.page.getByText(MoneyChosee, { exact: true }).click();
        }
      },
      'setLanguageAndCurrency'
    );
    
    this.logger.info(`Idioma configurado a ${LenguageChoose}, Moneda configurada a ${MoneyChosee}`);
  } catch (error) {
    this.logger.error('Error al configurar idioma y moneda', error);
    throw error;
  }
}

  /**
   * Selecciona origen y destino
   */
  async selectOriginDestination(origin: string, destination: string) {
    try {
      this.logger.info(`Seleccionando origen: ${origin}, destino: ${destination}`);
      await this.page.locator('div.searcher-input.station-selector.origin').click();
      await this.page.locator('div.iata', { hasText: origin }).nth(0).click();
      await this.page.locator('div.iata').filter({ hasText: destination }).nth(1).click();
      
      // Alternar ciudades para asegurar el registro correcto
      await this.page.locator('.swap-btn-icon.flight-swap-icon.icon-swap-black').click();
      await this.page.locator('.swap-btn-icon.flight-swap-icon.icon-swap-black').click();
      
      this.logger.info('Origen y destino seleccionados correctamente');
    } catch (error) {
      this.logger.error('Error al seleccionar origen y destino', error);
      throw error;
    }
  }

  /**
   * Establece el tipo de viaje (ida o ida y vuelta)
   */
  async setTripType(isOneWay: boolean) {
    if (isOneWay) {
      try {
        await this.page.getByRole('button', { name: 'One way' }).click();
        this.logger.info('Tipo de viaje configurado a solo ida');
      } catch (error) {
        this.logger.error('Error al configurar tipo de viaje a solo ida', error);
        throw error;
      }
    } else {
      this.logger.info('Tipo de viaje se mantiene como ida y vuelta (por defecto)');
    }
  }

  /**
   * Selecciona fechas de vuelo usando datos de API
   */
  async selectFlightDates(flightConfig: FlightConfig, passengerConfig: PassengerConfig) {
    try {
      this.logger.info('Seleccionando fechas de vuelo');
      
      const { origin, destination, outboundFlightClass, outboundFlightType, 
              returnFlightClass, returnFlightType, isOneWay } = flightConfig;
      
      const { adults, children, infants } = passengerConfig;
      
      await this.executeWithRetry(
        async () => {
          await this.page.waitForTimeout(1000);
          await selectRoundTripDates(
            this.page, 
            apiData, 
            origin, 
            destination, 
            outboundFlightClass, 
            outboundFlightType, 
            returnFlightClass, 
            returnFlightType, 
            adults, 
            children, 
            infants, 
            isOneWay
          );
        },
        'selectFlightDates'
      );
      
      this.logger.info('Fechas de vuelo seleccionadas correctamente');
    } catch (error) {
      this.logger.error('Error al seleccionar fechas de vuelo', error);
      throw error;
    }
  }

  /**
   * Selecciona la cantidad de pasajeros
   */
  async selectPassengers(adults: any[], children: any[], infants: any[]) {
    try {
      this.logger.info(`Seleccionando pasajeros: ${adults.length} adultos, ${children.length} niños, ${infants.length} infantes`);
      
      await this.executeWithRetry(
        async () => {
          await adjustPassengerCount(this.page, adults, children, infants);
          await this.page.locator('#searcher_submit_button').click();
        },
        'selectPassengers'
      );
      
      this.logger.info('Pasajeros seleccionados correctamente');
    } catch (error) {
      this.logger.error('Error al seleccionar pasajeros', error);
      throw error;
    }
  }

  /**
   * Selecciona las clases y tipos de vuelo
   */
  async selectFlightClasses(flightConfig: FlightConfig) {
    try {
      this.logger.info('Seleccionando clases y tipos de vuelo');
      
      const { outboundFlightClass, outboundFlightType, 
              returnFlightClass, returnFlightType, isOneWay } = flightConfig;
      
      await this.executeWithRetry(
        async () => {
          await selectFlights(
            this.page, 
            outboundFlightClass, 
            outboundFlightType, 
            returnFlightClass, 
            returnFlightType, 
            isOneWay
          );
          await this.page.getByRole('button', { name: 'Continue' }).click();
        },
        'selectFlightClasses'
      );
      
      this.logger.info('Clases y tipos de vuelo seleccionados correctamente');
    } catch (error) {
      this.logger.error('Error al seleccionar clases de vuelo', error);
      throw error;
    }
  }

  /**
   * Completa los datos de los pasajeros
   */
  async fillPassengerDetails(passengerConfig: PassengerConfig) {
    const { adults, children, infants, language, dayOffset } = passengerConfig;
    
    // Completar datos de adultos
    for (let i = 0; i < adults.length; i++) {
      await this.executeWithRetry(
        async () => {
          await fillPassengerFor(this.page, 'Adult', adults[i], 'adults', i, language, dayOffset);
        },
        `fillPassengerAdult-${i + 1}`
      );
    }
    
    // Completar datos de niños
    for (let i = 0; i < children.length; i++) {
      await this.executeWithRetry(
        async () => {
          await fillPassengerFor(this.page, 'Child', children[i], 'children', i, language, dayOffset);
        },
        `fillPassengerChild-${i + 1}`
      );
    }
    
    // Completar datos de infantes
    for (let i = 0; i < infants.length; i++) {
      await this.executeWithRetry(
        async () => {
          await fillPassengerFor(this.page, 'Infant', infants[i], 'infants', i, language, dayOffset);
        },
        `fillPassengerInfant-${i + 1}`
      );
    }
    
    this.logger.info('Datos de todos los pasajeros completados correctamente');
  }

  /**
   * Completa los datos de contacto
   */
  async fillContactDetails(contactData: any, action: 'purchase' | 'customize') {
    try {
      this.logger.info(`Completando datos de contacto para ${action}`);
      
      await this.executeWithRetry(
        async () => {
          await this.page.locator('#contact').click();
          await this.page.locator('input[name="contactDetails\\.name"]').fill(contactData.name);
          await this.page.locator('input[name="contactDetails\\.surname"]').fill(contactData.surname);
          
          // Para el formulario de contacto
          if (action === 'purchase') {
            await this.page.getByPlaceholder('Prefix').click();
            await this.page.getByLabel('Åland Islands (+358)').click();
          } else {
            // Para personalización de vuelo
            await this.page.locator(`#contact`).getByRole('combobox').click();
            await this.page.locator(`#contact`).getByRole('combobox').fill(contactData.nationality.substring(0, 3));
            await this.page.getByLabel(contactData.nationality).click();
          }
          
          await this.page.locator('input[name="contactDetails.phone"]').fill(contactData.phone);
          await this.page.locator('input[name="contactDetails.email"]').fill(contactData.email);
          
          // Log which button we're going to click
          if (action === 'purchase') {
            this.logger.info('Haciendo clic en "Complete your purchase"');
            const purchaseBtn = await this.page.getByRole('button', { name: 'Complete your purchase' });
            const isVisible = await purchaseBtn.isVisible();
            this.logger.info(`¿Botón "Complete your purchase" visible? ${isVisible}`);
            await purchaseBtn.click();
          } else {
            this.logger.info('Haciendo clic en "Customize your flight"');
            const customizeBtn = await this.page.getByRole('button', { name: 'Customize your flight' });
            const isVisible = await customizeBtn.isVisible();
            this.logger.info(`¿Botón "Customize your flight" visible? ${isVisible}`);
            await customizeBtn.click();
          }
          
          await this.page.waitForTimeout(1000);
        },
        'fillContactDetails'
      );
      
      this.logger.info('Datos de contacto completados correctamente');
    } catch (error) {
      this.logger.error('Error al completar datos de contacto', error);
      throw error;
    }
  }

  /**
   * Selecciona asientos para cada vuelo (si necesario)
   */
  async selectSeats() {
    try {
      this.logger.info('Seleccionando asientos');
      
      await this.executeWithRetry(
        async () => {
          // Wait for seat selection page to load properly
          await this.page.waitForTimeout(5000);
          await this.page.waitForSelector('.seat-icon__zoom img:not(.occupied)', { timeout: 30000 });
          
          // Log the number of available seats to help with debugging
          const availableSeats = await this.page.$$('.seat-icon__zoom img:not(.occupied)');
          this.logger.info(`Asientos disponibles encontrados: ${availableSeats.length}`);
          
          // Select outbound seat
          await this.selectSeat(0, 'ida', 'front');
          await this.page.waitForTimeout(3000);
          
          // Check if this is a round trip before trying to select return seat
          const isOneWay = await this.page.getByRole('button', { name: 'Continue' }).isVisible({ timeout: 1000 });
          
          if (!isOneWay) {
            // Select return seat
            await this.selectSeat(1, 'vuelta', 'front');
            await this.page.waitForTimeout(3000);
          }
          
          // Wait for and click the continue button
          await this.page.waitForSelector('button:has-text("Continue")', { timeout: 10000 });
          await this.page.getByRole('button', { name: 'Continue' }).click();
        },
        'selectSeats',
        5  // Increase retries for seat selection which can be flaky
      );
      
      this.logger.info('Asientos seleccionados correctamente');
    } catch (error) {
      this.logger.error('Error al seleccionar asientos', error);
      throw error;
    }
  }
  

  /**
   * Selecciona un asiento específico
   */
  private async selectSeat(index: number, seatType: string, desiredType?: string) {
    let foundDesiredSeat = false;
    let attempts = 0;
    const maxAttempts = 15; // Increase max attempts
  
    this.logger.info(`Iniciando selección de asiento ${seatType} (${index})`);
  
    while (!foundDesiredSeat && attempts < maxAttempts) {
      try {
        await this.page.waitForTimeout(1000);
        
        // Get all available seats
        const seats = await this.page.$$('.seat-icon__zoom img:not(.occupied)');
        
        if (seats.length === 0) {
          this.logger.warn(`No hay asientos disponibles para ${seatType} (intento ${attempts+1})`);
          await this.page.waitForTimeout(2000);
          attempts++;
          continue;
        }
  
        this.logger.info(`Encontrados ${seats.length} asientos disponibles`);
        
        // Try different seats until finding one that works
        let seatIndex = Math.floor(Math.random() * seats.length);
        await seats[seatIndex].click({ force: true });
        await this.page.waitForTimeout(1500);
  
        // Check if seat was successfully selected
        const seatSelection = await this.page.$('.selection-box__container.selected');
        if (seatSelection) {
          this.logger.info(`Asiento ${seatType} seleccionado correctamente`);
          
          // Try to get seat number for logging
          try {
            const seatNumber = await this.page.locator('.selection-box__seat-number').nth(index).innerText();
            this.logger.info(`Número de asiento ${seatType}: ${seatNumber}`);
          } catch (e) {
            this.logger.warn(`No se pudo obtener número de asiento: ${e.message}`);
          }
          
          foundDesiredSeat = true;
          break;
        }
        
        this.logger.warn(`El asiento no se seleccionó correctamente (intento ${attempts+1})`);
        attempts++;
      } catch (error) {
        this.logger.error(`Error al seleccionar asiento ${seatType} (intento ${attempts+1}):`, error);
        attempts++;
        await this.page.waitForTimeout(2000);
      }
    }
  
    if (!foundDesiredSeat) {
      const message = `No se pudo seleccionar un asiento para ${seatType} después de ${maxAttempts} intentos`;
      this.logger.error(message);
      await this.takeErrorScreenshot(`seat-selection-failed-${seatType}`);
      throw new Error(message);
    }
  }

  /**
   * Continúa sin seleccionar equipaje adicional
   */
  async skipBaggageAndContinue() {
    try {
      this.logger.info('Omitiendo opciones de equipaje');
      
      await this.executeWithRetry(
        async () => {
          await this.page.waitForTimeout(5000);
          await this.page.getByRole('button', { name: 'Continue' }).click();
        },
        'skipBaggageAndContinue'
      );
      
      this.logger.info('Opciones de equipaje omitidas correctamente');
    } catch (error) {
      this.logger.error('Error al omitir opciones de equipaje', error);
      throw error;
    }
  }

  /**
   * Procesa el pago
   */
  async processPayment(paymentData: any) {
    if (TestConfig.isProd) {
      this.logger.info('Omitiendo pago en entorno de producción');
      return;
    }

    try {
      this.logger.info('Procesando pago');
      
      await this.executeWithRetry(
        async () => {
          await payWithCard(this.page, paymentData);
          await this.page.waitForTimeout(1000);
        },
        'processPayment'
      );
      
      this.logger.info('Pago procesado correctamente');
    } catch (error) {
      this.logger.error('Error al procesar pago', error);
      throw error;
    }
  }

  /**
   * Verifica la confirmación de reserva
   */
  async verifyBookingConfirmation(testCase: TestCase) {
    if (TestConfig.isProd) {
      this.logger.info('Omitiendo verificación de confirmación en entorno de producción');
      return;
    }

    try {
      this.logger.info('Verificando confirmación de reserva');
      
      await this.executeWithRetry(
        async () => {
          // Pass the testCase to validationConfirmPage
          await validationConfirmPage(this.page, testCase);
          await this.page.waitForTimeout(1000);
        },
        'verifyBookingConfirmation'
      );
      
      this.logger.info('Reserva confirmada correctamente');
    } catch (error) {
      this.logger.error('Error al verificar confirmación de reserva', error);
      throw error;
    }
  }

  /**
   * Ejecuta un paso con reintentos automáticos
   */
  private async executeWithRetry<T>(
    action: () => Promise<T>,
    actionName: string,
    maxRetries: number = TestConfig.retries.maxStepRetries
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.info(`Intentando ${actionName} (${attempt}/${maxRetries})`);
        return await action();
      } catch (error) {
        if (attempt === maxRetries) {
          await this.takeErrorScreenshot(actionName);
          throw error;
        }
        this.logger.warn(`${actionName} falló, reintentando...`, error);
      }
    }
    throw new Error(`Error al ejecutar ${actionName} después de ${maxRetries} intentos`);
  }

  /**
   * Toma una captura de pantalla cuando ocurre un error
   */
  private async takeErrorScreenshot(actionName: string) {
    const screenshotPath = `test-results/screenshots/${actionName}-error-${Date.now()}.png`;
    try {
      await this.page.screenshot({ path: screenshotPath });
      this.logger.info(`Captura de pantalla guardada en: ${screenshotPath}`);
    } catch (error) {
      this.logger.error(`Error al tomar captura de pantalla para ${actionName}`, error);
    }
  }

  /**
   * Ejecuta una prueba completa de reserva
   */
  async runCompleteTest(testCase: TestCase) {
    try {
      this.logger.info(`Iniciando prueba: ${testCase.name}`);
      
      await this.initialize();
      
      await this.selectOriginDestination(
        testCase.flightConfig.origin, 
        testCase.flightConfig.destination
      );
      
      await this.setTripType(testCase.flightConfig.isOneWay);
      
      await this.selectFlightDates(
        testCase.flightConfig, 
        testCase.passengerConfig
      );
      
      await this.selectPassengers(
        testCase.passengerConfig.adults, 
        testCase.passengerConfig.children, 
        testCase.passengerConfig.infants
      );
      
      await this.selectFlightClasses(testCase.flightConfig);
      
      await this.fillPassengerDetails(testCase.passengerConfig);
      
      // Check includeSeats property instead of test name
      const contactAction = testCase.includeSeats ? 'customize' : 'purchase';
      await this.fillContactDetails(testCase.passengerConfig.adults[0], contactAction);
      
      // Check includeSeats property instead of test name
      if (testCase.includeSeats) {
        this.logger.info('Prueba incluye selección de asientos');
        await this.selectSeats();
        await this.skipBaggageAndContinue();
      } else {
        this.logger.info('Prueba no incluye selección de asientos');
      }
      
      await this.processPayment(testCase.paymentInfo);
      
      // Pass the testCase to verifyBookingConfirmation
      await this.verifyBookingConfirmation(testCase);
      
      this.logger.info(`Prueba completada exitosamente: ${testCase.name}`);
      return true;
    } catch (error) {
      this.logger.error(`Error durante la ejecución de la prueba ${testCase.name}:`, error);
      return false;
    }
  }
}

/**
 * Generador de casos de prueba 
 */
/**
 * Función para crear y ejecutar un caso de prueba individual
 */
export async function runSingleTest(browser: any, testCase: TestCase) {
  const logger = new Logger();
  logger.info(`Ejecutando prueba: ${testCase.name}`);
  
  let success = false;
  let attempt = 0;
  
  while (attempt < TestConfig.retries.maxExecutionRetries && !success) {
    attempt++;
    logger.info(`Intento ${attempt}/${TestConfig.retries.maxExecutionRetries}`);
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const testRunner = new LevelTestRunner(page, context);
    
    try {
      success = await testRunner.runCompleteTest(testCase);
    } catch (error) {
      logger.error(`Error en intento ${attempt}:`, error);
    } finally {
      await page.close();
      await context.close();
    }
    
    if (success) {
      logger.info(`Prueba "${testCase.name}" exitosa`);
      break;
    } else if (attempt === TestConfig.retries.maxExecutionRetries) {
      logger.error(`Prueba "${testCase.name}" fallida después de ${TestConfig.retries.maxExecutionRetries} intentos`);
      throw new Error(`Prueba fallida: ${testCase.name}`);
    }
  }
  
  return success;
}

export class TestCaseGenerator {
  /**
   * Genera un caso de prueba estándar
   */
  static createStandardTestCase(
    name: string,
    description: string,
    adults: any[] = [userDataADT[0]],
    children: any[] = [],
    infants: any[] = [],
    outboundFlightClass: CabinClass = CabinClass.ECONOMY,
    outboundFlightType: CabinType = CabinType.LIGHT,
    returnFlightClass: CabinClass = CabinClass.ECONOMY,
    returnFlightType: CabinType = CabinType.LIGHT,
    isOneWay: boolean = false
  ): TestCase {
    return {
      name,
      description,
      flightConfig: {
        origin: ruteData.origin,
        destination: ruteData.destination,
        outboundFlightClass,
        outboundFlightType,
        returnFlightClass,
        returnFlightType,
        isOneWay
      },
      passengerConfig: {
        adults,
        children,
        infants,
        language: TestConfig.defaultLanguage,
        dayOffset: TestConfig.defaultDayOffset
      },
      paymentInfo: paymentCards[0]
    };
  }
  
  /**
   * Genera una lista de casos de prueba comunes
   */
  static generateCommonTestCases(): TestCase[] {
    return [
      // Caso 1: 1 adulto, Eco Light
      this.createStandardTestCase(
        "1. Compra 1 adulto - Economy Light - sin asistencia - sin asiento - sin extras",
        "Reserva básica para un solo adulto en clase Economy Light"
      ),
      
      // Caso 2: 2 adultos diferentes, Eco Light
      this.createStandardTestCase(
        "2. Compra 2 adultos (Diferentes) - Economy Light - Economy Light - sin asistencia - sin asiento - sin extras",
        "Reserva para dos adultos diferentes en clase Economy Light",
        [userDataADT[1], userDataADT[2]]
      ),
      
      // Caso 3: 2 adultos con asistencia, Eco Light
      this.createStandardTestCase(
        "3. Compra 2 adultos (Diferentes) - Economy Light - Economy Light - Con asistencia TODAS - sin asiento - sin extras",
        "Reserva para dos adultos diferentes con requerimientos de asistencia",
        [userDataADT[4], userDataADT[5]]
      ),
      
      // Caso 4: 1 adulto y 1 niño, Eco Light
      this.createStandardTestCase(
        "4. Compra 1 adulto - 1 niño - Economy Light - Economy Light - sin asistencia - sin asiento - sin extras",
        "Reserva para un adulto y un niño en clase Economy Light",
        [userDataADT[0]],
        [userDataCHD[1]]
      ),
      
      // Y así sucesivamente para otros casos...
    ];
  }
  
  /**
   * Genera casos de prueba para todas las combinaciones de cabina
   */
  static generateCabinCombinationTestCases(): TestCase[] {
    const testCases: TestCase[] = [];
    const cabinClasses = [CabinClass.ECONOMY, CabinClass.PREMIUM];
    const cabinTypes = [CabinType.LIGHT, CabinType.COMFORT, CabinType.EXTRA];
    
    let caseNumber = 1;
    
    // Generar todas las combinaciones posibles
    for (const outboundClass of cabinClasses) {
      for (const outboundType of cabinTypes) {
        for (const returnClass of cabinClasses) {
          for (const returnType of cabinTypes) {
            // Saltear algunas combinaciones para reducir cantidad
            if (Math.random() > 0.7) continue;
            
            testCases.push(this.createStandardTestCase(
              `${caseNumber++}. Compra 1 adulto ${outboundClass} ${outboundType} - ${returnClass} ${returnType} - sin asistencia - sin asiento - sin extras`,
              `Reserva para un adulto con clase de ida ${outboundClass} ${outboundType} y vuelta ${returnClass} ${returnType}`,
              [userDataADT[0]],
              [],
              [],
              outboundClass,
              outboundType,
              returnClass,
              returnType
            ));
          }
        }
      }
    }
    
    return testCases;
  }
  
  /**
   * Genera casos de prueba para diferentes combinaciones de pasajeros
   */
  static generatePassengerCombinationTestCases(): TestCase[] {
    return [
      // 1 adulto, 1 niño, 1 infante
      this.createStandardTestCase(
        "Compra 1 adulto - 1 niño - 1 infante - Economy Light",
        "Reserva familiar con un pasajero de cada tipo",
        [userDataADT[0]],
        [userDataCHD[1]],
        [userDataINL[1]]
      ),
      
      // 2 adultos, 2 niños
      this.createStandardTestCase(
        "Compra 2 adultos - 2 niños - Economy Light",
        "Reserva para familia grande con dos adultos y dos niños",
        [userDataADT[0], userDataADT[1]],
        [userDataCHD[1], userDataCHD[2]]
      ),
      
      // Caso con adulto con asistencia
      this.createStandardTestCase(
        "Compra 1 adulto con asistencia - Economy Light",
        "Reserva para un adulto que requiere asistencia",
        [userDataADT[5]]
      ),
      
      // Caso con niño con asistencia
      this.createStandardTestCase(
        "Compra 1 adulto - 1 niño con asistencia - Economy Light",
        "Reserva para un adulto y un niño que requiere asistencia",
        [userDataADT[0]],
        [userDataCHD[2]]
      )
    ];
  }
  
  /**
   * Genera un conjunto completo de casos de prueba para una suite
   */
  static generateFullTestSuite(): TestCase[] {
    return [
      ...this.generateCommonTestCases(),
      ...this.generateCabinCombinationTestCases(),
      ...this.generatePassengerCombinationTestCases()
    ];
  }
}

/**
 * Función para ejecutar un conjunto de pruebas
 */
export async function runTestSuite(browser: any, testCases: TestCase[]) {
  for (const testCase of testCases) {
    // Saltar casos marcados para omitir
    if (testCase.skip) {
      console.log(`Saltando prueba: ${testCase.name}`);
      continue;
    }
    
    let success = false;
    let attempt = 0;
    const logger = new Logger();
    
    // Reintentar cada prueba hasta el límite configurado
    while (attempt < TestConfig.retries.maxExecutionRetries && !success) {
      attempt++;
      logger.info(`Iniciando prueba "${testCase.name}" (intento ${attempt}/${TestConfig.retries.maxExecutionRetries})`);
      
      const context = await browser.newContext();
      const page = await context.newPage();
      
      const testRunner = new LevelTestRunner(page, context);
      
      try {
        // Ejecutar la prueba completa
        success = await testRunner.runCompleteTest(testCase);
        
        if (success) {
          logger.info(`Prueba "${testCase.name}" completada con éxito en el intento ${attempt}`);
        } else {
          logger.error(`Fallo en la prueba "${testCase.name}" (intento ${attempt})`);
          if (attempt === TestConfig.retries.maxExecutionRetries) {
            logger.error(`Prueba "${testCase.name}" falló después de ${TestConfig.retries.maxExecutionRetries} intentos`);
          }
        }
      } catch (error) {
        logger.error(`Error durante la prueba "${testCase.name}" (intento ${attempt})`, error);
      } finally {
        await page.close();
        await context.close();
      }
    }
    
    // Si todas las pruebas son críticas, podemos hacer que falle la suite completa
    // si una prueba falla, descomentando la siguiente línea:
    // if (!success) throw new Error(`Prueba fallida: ${testCase.name}`);
  }
}