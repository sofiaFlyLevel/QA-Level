// utils/browserstack-helper.ts
export const isBrowserStack = process.env.BROWSERSTACK_RUN_ON === 'true';

export function configureBrowserStackTest(testInfo: any) {
  if (isBrowserStack) {
    // Configurar nombres de prueba para que aparezcan correctamente en BrowserStack
    const testName = testInfo.title;
    console.log(`Running test on BrowserStack: ${testName}`);
    
    // Puedes ajustar timeouts u otras configuraciones específicas para BrowserStack
    testInfo.timeout = 180000; // 3 minutos para pruebas de BrowserStack
  }
}

export function handleBrowserStackError(error: Error, testName: string) {
  if (isBrowserStack) {
    // Log especial para BrowserStack
    console.log(`BrowserStack test failed: ${testName}`);
    console.error(error);
    
    // Puedes añadir código aquí para marcar el test como fallido en BrowserStack
    // usando su API si lo necesitas
  }
}