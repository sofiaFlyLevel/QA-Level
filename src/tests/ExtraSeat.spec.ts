import { test } from '@playwright/test';
import { runSingleTest, runTestSuite, TestConfig } from '../utils/test-framework';
import { ExtraSeatTestConfigs } from '../config/test-configs';

/**
 * Suite de pruebas para reservas de vuelo con selección de asiento
 */

// Configuración común para todos los tests
const TEST_TIMEOUT = TestConfig.timeouts.test;

// Test 1: 1 adulto, Economy Light con asiento
test('1. Compra 1 adulto - Economy Light - con asiento - sin extras', async ({ browser }) => {
  await runSingleTest(browser, ExtraSeatTestConfigs[0]);
}, TEST_TIMEOUT);

// Test 2: 2 adultos diferentes, Economy Light con asiento
test('2. Compra 2 adultos (Diferentes) - Economy Light - Economy Light - sin asistencia - con asiento - sin extras', async ({ browser }) => {
  await runSingleTest(browser, ExtraSeatTestConfigs[1]);
}, TEST_TIMEOUT);

// Test 3: 2 adultos con asistencia completa con asiento
test('3. Compra 2 adultos (Diferentes) - Economy Light - Economy Light - Con asistencia TODAS - con asiento - sin extras', async ({ browser }) => {
  await runSingleTest(browser, ExtraSeatTestConfigs[2]);
}, TEST_TIMEOUT);

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
    
    await runSingleTest(browser, customConfig);
  }, TEST_TIMEOUT);
});

// Ejecutar múltiples pruebas de asiento juntas
test.describe('Grupos de pruebas con asiento', () => {
  test.skip('Todas las pruebas básicas con asiento', async ({ browser }) => {
    // Ejecutar las tres primeras pruebas en secuencia
    await runTestSuite(browser, ExtraSeatTestConfigs.slice(0, 3));
  }, TEST_TIMEOUT * 3);
});

// Importación necesaria para las pruebas personalizadas
import { CabinType } from '../fixtures/userData';