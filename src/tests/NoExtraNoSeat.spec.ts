import { test } from '@playwright/test';
import { runSingleTest, runTestSuite, TestConfig } from '../utils/test-framework';
import { NoExtraNoSeatTestConfigs } from '../config/test-configs';

/**
 * Suite de pruebas para reservas de vuelo sin asientos ni extras
 * Con dos variantes: One-Way (solo ida) y Round-Trip (ida y vuelta)
 */

// Configuración común para todos los tests
const TEST_TIMEOUT = TestConfig.timeouts.test;

// Crear copias de las configuraciones con isOneWay true y false
const createOneWayConfig = (config) => {
  const newConfig = { ...config };
  newConfig.name = `ONE-WAY: ${config.name}`;
  newConfig.flightConfig = { ...config.flightConfig, isOneWay: true };
  return newConfig;
};

const createRoundTripConfig = (config) => {
  const newConfig = { ...config };
  newConfig.name = `ROUND-TRIP: ${config.name}`;
  newConfig.flightConfig = { ...config.flightConfig, isOneWay: false };
  return newConfig;
};

// Crear los arrays de configuraciones
const oneWayConfigs = NoExtraNoSeatTestConfigs.map(createOneWayConfig);
const roundTripConfigs = NoExtraNoSeatTestConfigs.map(createRoundTripConfig);

// Test suite para vuelos de solo ida (One-Way)
test.describe('Pruebas de vuelos de solo ida (One-Way)', () => {
  // Test 1: 1 adulto, Economy Light
  test('1. Compra 1 adulto - Economy Light - sin asistencia - sin asiento - sin extras (One-Way)', async ({ browser }) => {
    await runSingleTest(browser, oneWayConfigs[0]);
  }, TEST_TIMEOUT);

  // Test 2: 2 adultos diferentes, Economy Light
  test('2. Compra 2 adultos (Diferentes) - Economy Light - sin asistencia - sin asiento - sin extras (One-Way)', async ({ browser }) => {
    await runSingleTest(browser, oneWayConfigs[1]);
  }, TEST_TIMEOUT);

  // Test 3: 2 adultos con asistencia completa
  test('3. Compra 2 adultos (Diferentes) - Economy Light - Con asistencia TODAS - sin asiento - sin extras (One-Way)', async ({ browser }) => {
    await runSingleTest(browser, oneWayConfigs[2]);
  }, TEST_TIMEOUT);

  // Test 4: 1 adulto + 1 niño
  test('4. Compra 1 adulto - 1 niño - Economy Light - sin asistencia - sin asiento - sin extras (One-Way)', async ({ browser }) => {
    await runSingleTest(browser, oneWayConfigs[3]);
  }, TEST_TIMEOUT);

  // Test 5: 1 adulto + 1 niño con asistencia
  test('5. Compra 1 adulto - 1 niño - Economy Light - con asistencia - sin asiento - sin extras (One-Way)', async ({ browser }) => {
    await runSingleTest(browser, oneWayConfigs[4]);
  }, TEST_TIMEOUT);

  // Test 6: 1 adulto + 3 niños
  test('6. Compra 1 adulto - 3 niños - Economy Light - con asistencia - sin asiento - sin extras (One-Way)', async ({ browser }) => {
    await runSingleTest(browser, oneWayConfigs[5]);
  }, TEST_TIMEOUT);

  // Test 7: 1 adulto + 1 infante
  test('7. Compra 1 adulto - 1 infante - Economy Light - sin asiento - sin extras (One-Way)', async ({ browser }) => {
    await runSingleTest(browser, oneWayConfigs[6]);
  }, TEST_TIMEOUT);

  test.describe('Pruebas de cabinas Economy (One-Way)', () => {
    test('8. Compra 1 adulto - Economy Light - sin asistencia - sin asiento - sin extras (One-Way)', async ({ browser }) => {
      await runSingleTest(browser, oneWayConfigs[7]);
    }, TEST_TIMEOUT);

    test('9. Compra 1 adulto - Economy Comfort - sin asistencia - sin asiento - sin extras (One-Way)', async ({ browser }) => {
      await runSingleTest(browser, oneWayConfigs[8]);
    }, TEST_TIMEOUT);

    test('10. Compra 1 adulto - Economy Extra - sin asistencia - sin asiento - sin extras (One-Way)', async ({ browser }) => {
      await runSingleTest(browser, oneWayConfigs[9]);
    }, TEST_TIMEOUT);
  });

  test.describe('Pruebas de cabinas Premium (One-Way)', () => {
    test('11. Compra 1 adulto - Premium Light - sin asistencia - sin asiento - sin extras (One-Way)', async ({ browser }) => {
      await runSingleTest(browser, oneWayConfigs[10]);
    }, TEST_TIMEOUT);

    test('12. Compra 1 adulto - Premium Light - Economy Comfort - sin asistencia - sin asiento - sin extras (One-Way)', async ({ browser }) => {
      await runSingleTest(browser, oneWayConfigs[11]);
    }, TEST_TIMEOUT);

    test('13. Compra 1 adulto - Premium Comfort - Economy Extra - sin asistencia - sin asiento - sin extras (One-Way)', async ({ browser }) => {
      await runSingleTest(browser, oneWayConfigs[12]);
    }, TEST_TIMEOUT);

    test('14. Compra 1 adulto - Premium Extra - sin asistencia - sin asiento - sin extras (One-Way)', async ({ browser }) => {
      await runSingleTest(browser, oneWayConfigs[13]);
    }, TEST_TIMEOUT);
  });

  // Esta prueba está deshabilitada por defecto (skip) porque puede tomar mucho tiempo
  // test.skip('Todas las pruebas de One-Way', async ({ browser }) => {
  //   await runTestSuite(browser, oneWayConfigs);
  // }, TEST_TIMEOUT * oneWayConfigs.length);
});

// Test suite para vuelos de ida y vuelta (Round-Trip)
test.describe('Pruebas de vuelos de ida y vuelta (Round-Trip)', () => {
  // Test 1: 1 adulto, Economy Light
  test('1. Compra 1 adulto - Economy Light - sin asistencia - sin asiento - sin extras (Round-Trip)', async ({ browser }) => {
    await runSingleTest(browser, roundTripConfigs[0]);
  }, TEST_TIMEOUT);

  // Test 2: 2 adultos diferentes, Economy Light
  test('2. Compra 2 adultos (Diferentes) - Economy Light - sin asistencia - sin asiento - sin extras (Round-Trip)', async ({ browser }) => {
    await runSingleTest(browser, roundTripConfigs[1]);
  }, TEST_TIMEOUT);

  // Test 3: 2 adultos con asistencia completa
  test('3. Compra 2 adultos (Diferentes) - Economy Light - Con asistencia TODAS - sin asiento - sin extras (Round-Trip)', async ({ browser }) => {
    await runSingleTest(browser, roundTripConfigs[2]);
  }, TEST_TIMEOUT);

  // Test 4: 1 adulto + 1 niño
  test('4. Compra 1 adulto - 1 niño - Economy Light - sin asistencia - sin asiento - sin extras (Round-Trip)', async ({ browser }) => {
    await runSingleTest(browser, roundTripConfigs[3]);
  }, TEST_TIMEOUT);

  // Test 5: 1 adulto + 1 niño con asistencia
  test('5. Compra 1 adulto - 1 niño - Economy Light - con asistencia - sin asiento - sin extras (Round-Trip)', async ({ browser }) => {
    await runSingleTest(browser, roundTripConfigs[4]);
  }, TEST_TIMEOUT);

  // Test 6: 1 adulto + 3 niños
  test('6. Compra 1 adulto - 3 niños - Economy Light - con asistencia - sin asiento - sin extras (Round-Trip)', async ({ browser }) => {
    await runSingleTest(browser, roundTripConfigs[5]);
  }, TEST_TIMEOUT);

  // Test 7: 1 adulto + 1 infante
  test('7. Compra 1 adulto - 1 infante - Economy Light - sin asiento - sin extras (Round-Trip)', async ({ browser }) => {
    await runSingleTest(browser, roundTripConfigs[6]);
  }, TEST_TIMEOUT);

  test.describe('Pruebas de cabinas Economy (Round-Trip)', () => {
    test('8. Compra 1 adulto - Economy Light - sin asistencia - sin asiento - sin extras (Round-Trip)', async ({ browser }) => {
      await runSingleTest(browser, roundTripConfigs[7]);
    }, TEST_TIMEOUT);

    test('9. Compra 1 adulto - Economy Comfort - sin asistencia - sin asiento - sin extras (Round-Trip)', async ({ browser }) => {
      await runSingleTest(browser, roundTripConfigs[8]);
    }, TEST_TIMEOUT);

    test('10. Compra 1 adulto - Economy Extra - sin asistencia - sin asiento - sin extras (Round-Trip)', async ({ browser }) => {
      await runSingleTest(browser, roundTripConfigs[9]);
    }, TEST_TIMEOUT);
  });

  test.describe('Pruebas de cabinas Premium (Round-Trip)', () => {
    test('11. Compra 1 adulto - Premium Light - sin asistencia - sin asiento - sin extras (Round-Trip)', async ({ browser }) => {
      await runSingleTest(browser, roundTripConfigs[10]);
    }, TEST_TIMEOUT);

    test('12. Compra 1 adulto - Premium Light - Economy Comfort - sin asistencia - sin asiento - sin extras (Round-Trip)', async ({ browser }) => {
      await runSingleTest(browser, roundTripConfigs[11]);
    }, TEST_TIMEOUT);

    test('13. Compra 1 adulto - Premium Comfort - Economy Extra - sin asistencia - sin asiento - sin extras (Round-Trip)', async ({ browser }) => {
      await runSingleTest(browser, roundTripConfigs[12]);
    }, TEST_TIMEOUT);

    test('14. Compra 1 adulto - Premium Extra - sin asistencia - sin asiento - sin extras (Round-Trip)', async ({ browser }) => {
      await runSingleTest(browser, roundTripConfigs[13]);
    }, TEST_TIMEOUT);
  });

  // Esta prueba está deshabilitada por defecto (skip) porque puede tomar mucho tiempo
  // test.skip('Todas las pruebas de Round-Trip', async ({ browser }) => {
  //   await runTestSuite(browser, roundTripConfigs);
  // }, TEST_TIMEOUT * roundTripConfigs.length);
});

// Run all tests (both One-Way and Round-Trip)
// test.describe('Ejecutar todas las pruebas', () => {
//   // Esta prueba está deshabilitada por defecto (skip) porque puede tomar mucho tiempo
//   test.skip('Todas las pruebas (One-Way y Round-Trip)', async ({ browser }) => {
//     // Podemos seleccionar un subconjunto de pruebas para ejecutar en lote
//     await runTestSuite(browser, [...oneWayConfigs, ...roundTripConfigs]);
//   }, TEST_TIMEOUT * (oneWayConfigs.length + roundTripConfigs.length));
// });