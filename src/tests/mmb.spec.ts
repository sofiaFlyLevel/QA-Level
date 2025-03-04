// Implementación del test principal

  /**
   * Test para verificación de reservas en My Booking
   */
  
  // Configuración
  const ENTORNO = entornoData.pre.url;
  const IS_PROD = ENTORNO === entornoData.prod.url;
  const FIXED_EMAIL = 'sofiainkoova@gmail.com';
  const EXCEL_FILE_NAME = 'booking_codes.xlsx';
  const MAX_RETRIES = 5;
  const STEP_RETRIES = 3;
  const TEST_TIMEOUT = 240000;
  
  // Interfaces para tipar los datos
  interface BookingCodeInfo {
    code: string;
    rowIndex: number;
    date?: string;
  }
  
  // Clase principal para gestionar My Booking
  class MyBookingManager {
    private page: Page;
    private logger: Logger;
  
    constructor(page: Page) {
      this.page = page;
      this.logger = new Logger();
    }
  
    /**
     * Lee los códigos de reserva desde el archivo Excel
     */
    async readBookingCodes(): Promise<BookingCodeInfo[]> {
      try {
        const workbook = XLSX.readFile(EXCEL_FILE_NAME);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        const bookingCodes: BookingCodeInfo[] = [];
        
        // Leer todos los códigos de reserva de la columna A y almacenar sus índices de fila
        for (let rowIndex = 1; rowIndex <= range.e.r; rowIndex++) {
          const bookingCodeCell = worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })];
          const dateCell = worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 1 })];
          
          if (bookingCodeCell?.v) {
            bookingCodes.push({
              code: bookingCodeCell.v.toString(),
              rowIndex: rowIndex,
              date: dateCell?.v ? dateCell.v.toString() : undefined
            });
          }
        }
        
        if (bookingCodes.length === 0) {
          this.logger.warn('No se encontraron códigos de reserva en el archivo Excel');
          return [];
        }
        
        this.logger.info(`Se encontraron ${bookingCodes.length} códigos de reserva`);
        return bookingCodes;
      } catch (error) {
        this.logger.error('Error al leer el archivo Excel:', error);
        throw error;
      }
    }
  
    /**
     * Elimina un código de reserva del archivo Excel
     */
    async deleteBookingCodeFromExcel(rowIndex: number): Promise<void> {
      try {
        const workbook = XLSX.readFile(EXCEL_FILE_NAME);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convertir hoja de trabajo a matriz
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Eliminar la fila en el índice especificado
        data.splice(rowIndex, 1);
        
        // Convertir de nuevo a hoja de trabajo
        const newWorksheet = XLSX.utils.aoa_to_sheet(data);
        
        // Reemplazar hoja de trabajo en el libro
        workbook.Sheets[workbook.SheetNames[0]] = newWorksheet;
        
        // Escribir de nuevo en el archivo
        XLSX.writeFile(workbook, EXCEL_FILE_NAME);
        
        this.logger.info(`Código de reserva eliminado correctamente (fila ${rowIndex})`);
      } catch (error) {
        this.logger.error('Error al eliminar del archivo Excel:', error);
        throw error;
      }
    }
  
    /**
     * Inicia sesión en My Booking con el código proporcionado
     */
    async accessMyBooking(bookingCode: string) {
      try {
        this.logger.info(`Accediendo a My Booking con código: ${bookingCode}`);
        
        await this.executeWithRetry(
          async () => {
            await this.page.getByText('My Booking').click();
            await this.page.getByPlaceholder('AY8E7D').click();
            await this.page.getByPlaceholder('AY8E7D').fill(bookingCode);
            await this.page.getByPlaceholder('email@xxx.com').click();
            await this.page.getByPlaceholder('email@xxx.com').fill(FIXED_EMAIL);
            await this.page.getByRole('button', { name: 'Continue' }).click();
          },
          'accessMyBooking'
        );
      } catch (error) {
        this.logger.error(`Error al acceder a My Booking con código ${bookingCode}:`, error);
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
     * Verifica que la reserva existe y coincide con el código
     */
    async verifyBooking(bookingCode: string): Promise<boolean> {
      try {
        this.logger.info(`Verificando reserva con código: ${bookingCode}`);
        
        // Esperar a que la navegación se complete y verificar URL
        await this.page.waitForURL((url) => url.pathname.includes('/nwe/mmb/'));
        
        // Verificar que el código de reserva coincide
        const displayedCodeElement = await this.page.locator('div.booking-code__code');
        const displayedCode = await displayedCodeElement.textContent();
        
        if (!displayedCode) {
          this.logger.error('No se pudo obtener el código de reserva mostrado');
          return false;
        }
        
        if (displayedCode !== bookingCode) {
          this.logger.error(`El código de reserva no coincide: esperado ${bookingCode}, obtenido ${displayedCode}`);
          return false;
        }
        
        this.logger.info(`Reserva verificada correctamente: ${bookingCode}`);
        return true;
      } catch (error) {
        this.logger.error(`Error al verificar reserva ${bookingCode}:`, error);
        return false;
      }
    }
  
    /**
     * Procesa un código de reserva completo (acceso, verificación, eliminación)
     */
    async processBookingCode(bookingInfo: BookingCodeInfo): Promise<boolean> {
      try {
        this.logger.info(`Procesando código de reserva: ${bookingInfo.code}`);
        
        await this.accessMyBooking(bookingInfo.code);
        
        const isValid = await this.verifyBooking(bookingInfo.code);
        
        if (isValid) {
          // Si la verificación es exitosa, eliminar la fila del Excel
          await this.deleteBookingCodeFromExcel(bookingInfo.rowIndex);
          
          // Volver al estado inicial para la siguiente reserva
          await this.page.goto(ENTORNO);
          return true;
        }
        
        return false;
      } catch (error) {
        this.logger.error(`Error procesando código de reserva ${bookingInfo.code}:`, error);
        return false;
      }
    }
  
    /**
     * Ejecuta todos los códigos de reserva disponibles
     */
    async processAllBookingCodes(): Promise<boolean> {
      try {
        const bookingCodes = await this.readBookingCodes();
        if (bookingCodes.length === 0) {
          this.logger.info('No hay códigos de reserva para procesar');
          return true;
        }
        
        this.logger.info(`Procesando ${bookingCodes.length} códigos de reserva`);
        
        let allSuccessful = true;
        
        for (const bookingInfo of bookingCodes) {
          const success = await this.processBookingCode(bookingInfo);
          if (!success) {
            allSuccessful = false;
            this.logger.warn(`No se pudo procesar el código de reserva: ${bookingInfo.code}`);
          }
        }
        
        return allSuccessful;
      } catch (error) {
        this.logger.error('Error al procesar todos los códigos de reserva:', error);
        return false;
      }
    }
    
    /**
     * Ejecuta una acción con reintentos automáticos
     */
    private async executeWithRetry<T>(
      action: () => Promise<T>,
      actionName: string,
      maxRetries: number = STEP_RETRIES
    ): Promise<T> {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          this.logger.info(`Ejecutando ${actionName} (intento ${attempt}/${maxRetries})`);
          return await action();
        } catch (error) {
          if (attempt === maxRetries) {
            await this.takeErrorScreenshot(actionName);
            throw error;
          }
          this.logger.warn(`Error en ${actionName}, reintentando...`, error);
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
  }
test.describe('Comprobar reservas en My Booking', () => {
    let manager: MyBookingManager;
  
    test('Verificar todos los códigos de reserva', async ({ page, browser }) => {
      let executionAttempt = 0;
      let success = false;
      const logger = new Logger();
      
      // Reintentar la ejecución completa hasta el límite configurado
      while (executionAttempt < MAX_RETRIES && !success) {
        executionAttempt++;
        logger.info(`Ejecución completa, intento ${executionAttempt}/${MAX_RETRIES}`);
        
        // Inicializar la página y el gestor
        await page.goto(ENTORNO);
        manager = new MyBookingManager(page);
        
        try {
          // Aceptar cookies
          await page.getByRole('button', { name: 'Accept all cookies' }).click();
          
          // Configurar idioma y moneda
          await manager.setLanguageAndCurrency();
          
          // Procesar todos los códigos de reserva
          success = await manager.processAllBookingCodes();
          
          if (success) {
            logger.info('Todos los códigos de reserva procesados correctamente');
            break;
          } else {
            logger.error(`No se pudieron procesar todos los códigos en el intento ${executionAttempt}`);
          }
        } catch (error) {
          logger.error(`Error crítico en el intento ${executionAttempt}:`, error);
        }
      }
      
      // Verificar el resultado final
      if (!success) {
        throw new Error(`No se pudieron verificar todas las reservas después de ${MAX_RETRIES} intentos completos`);
      }
      
      expect(success).toBeTruthy();
    }, TEST_TIMEOUT);
  });
  import { test, expect, type Page } from '@playwright/test';
  import { MoneyChosee, LenguageChoose } from '../fixtures/userData';
  import { entornoData } from '../fixtures/environmentData';
  import { Logger } from '../utils/Logger';
  import * as XLSX from 'xlsx';
  
