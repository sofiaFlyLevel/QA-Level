import { test } from '@playwright/test';
import { runSingleTest, runTestSuite, TestConfig } from '../../utils/test-framework';
import { ExtraSeatTestConfigs } from '../../config/test-configs';

/**
 * Suite de pruebas para reservas de vuelo con selección de asiento
 */

// Detectar si estamos ejecutando en BrowserStack
const isBrowserStack = process.env.BROWSERSTACK_RUN_ON === 'true';

// Configuración común para todos los tests
// Aumentar timeout para BrowserStack si es necesario
const TEST_TIMEOUT = isBrowserStack ? TestConfig.timeouts.test * 2 : TestConfig.timeouts.test;

// Función auxiliar para configurar pruebas de BrowserStack
const setupBrowserStackTest = async (browser, testName) => {
  if (isBrowserStack) {
    console.log(`Ejecutando prueba en BrowserStack: ${testName}`);
    // Si necesitas hacer configuraciones adicionales específicas para BrowserStack
  }
};

// Función para manejar errores de BrowserStack
const handleBrowserStackError = (error, testName) => {
  if (isBrowserStack) {
    console.error(`Error en prueba BrowserStack: ${testName}`, error);
    // Aquí podrías añadir código para marcar la prueba en BrowserStack si es necesario
  }
  throw error; // Re-lanzar el error para que Playwright lo registre
};

// Test 1: 1 adulto, Economy Light con asiento
test('1. Compra 1 adulto - Economy Light - con asiento - sin extras', async ({ browser }) => {
  try {
    await setupBrowserStackTest(browser, ExtraSeatTestConfigs[0].name);
    await runSingleTest(browser, ExtraSeatTestConfigs[0]);
  } catch (error) {
    handleBrowserStackError(error, ExtraSeatTestConfigs[0].name);
  }
}, TEST_TIMEOUT);

// Test 2: 2 adultos diferentes, Economy Light con asiento
test('2. Compra 2 adultos (Diferentes) - Economy Light - Economy Light - sin asistencia - con asiento - sin extras', async ({ browser }) => {
  try {
    await setupBrowserStackTest(browser, ExtraSeatTestConfigs[1].name);
    await runSingleTest(browser, ExtraSeatTestConfigs[1]);
  } catch (error) {
    handleBrowserStackError(error, ExtraSeatTestConfigs[1].name);
  }
}, TEST_TIMEOUT);

// Test 3: 2 adultos con asistencia completa con asiento
test('3. Compra 2 adultos (Diferentes) - Economy Light - Economy Light - Con asistencia TODAS - con asiento - sin extras', async ({ browser }) => {
  try {
    await setupBrowserStackTest(browser, ExtraSeatTestConfigs[2].name);
    await runSingleTest(browser, ExtraSeatTestConfigs[2]);
  } catch (error) {
    handleBrowserStackError(error, ExtraSeatTestConfigs[2].name);
  }
}, TEST_TIMEOUT);

// Importación necesaria para las pruebas personalizadas
import { CabinType } from '../../fixtures/userData';

// Diferentes combinaciones de cabina con selección de asiento
test.describe('Pruebas de cabinas con selección de asiento', () => {
  // Si necesitas generar más configuraciones específicas para pruebas con asiento,
  // puedes hacerlo directamente aquí o mediante una función en test-configs.ts
  
  // Por ejemplo:
  test('Combinación Economy Comfort con asiento', async ({ browser }) => {
    // Crear una configuración personalizada basada en una existente pero modificándola
    const customConfig = {
      ...ExtraSeatTestConfigs[0], // Clonar la configuración básica
      name: "Prueba personalizada - Economy Comfort - con asiento",
      description: "Reserva con clase Economy Comfort y selección de asiento",
      flightConfig: {
        ...ExtraSeatTestConfigs[0].flightConfig,
        outboundFlightType: CabinType.COMFORT,
        returnFlightType: CabinType.COMFORT
      }
    };
    
    try {
      await setupBrowserStackTest(browser, customConfig.name);
      await runSingleTest(browser, customConfig);
    } catch (error) {
      handleBrowserStackError(error, customConfig.name);
    }
  }, TEST_TIMEOUT);
});

// Ejecutar múltiples pruebas de asiento juntas
test.describe('Grupos de pruebas con asiento', () => {
  test.skip('Todas las pruebas básicas con asiento', async ({ browser }) => {
    // Ejecutar las tres primeras pruebas en secuencia
    try {
      await setupBrowserStackTest(browser, "Todas las pruebas básicas con asiento");
      await runTestSuite(browser, ExtraSeatTestConfigs.slice(0, 3));
    } catch (error) {
      handleBrowserStackError(error, "Todas las pruebas básicas con asiento");
    }
  }, TEST_TIMEOUT * 3);
});

