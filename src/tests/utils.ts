/**
 * Utilidades adicionales para pruebas
 * 
 * Este archivo contiene funciones auxiliares que pueden ser útiles
 * para casos específicos o para facilitar la depuración.
 */

import { Page } from '@playwright/test';
import { Logger } from '../utils/Logger';

/**
 * Ejecuta una acción con reintentos
 * Esta es una versión simplificada que se puede usar fuera del framework principal
 */
export async function retryAction<T>(
  action: () => Promise<T>,
  options: {
    name?: string,
    retries?: number,
    delay?: number,
    logger?: Logger
  } = {}
): Promise<T> {
  const {
    name = 'action',
    retries = 3,
    delay = 1000,
    logger = new Logger()
  } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`Intentando ${name} (${attempt}/${retries})`);
      return await action();
    } catch (error) {
      logger.warn(`Error en ${name} (intento ${attempt}/${retries}):`, error);
      
      if (attempt === retries) {
        logger.error(`Falló ${name} después de ${retries} intentos`);
        throw error;
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Esta línea nunca debería alcanzarse, pero TypeScript lo requiere
  throw new Error(`Falló ${name} después de ${retries} intentos`);
}

/**
 * Toma una captura de pantalla con un nombre significativo
 */
export async function takeScreenshot(page: Page, name: string, logger?: Logger) {
  const log = logger || new Logger();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `test-results/screenshots/${name}-${timestamp}.png`;
  
  try {
    await page.screenshot({ path: fileName });
    log.info(`Captura de pantalla guardada: ${fileName}`);
    return fileName;
  } catch (error) {
    log.error(`Error al tomar captura de pantalla ${name}:`, error);
    return null;
  }
}

/**
 * Registra información detallada del contexto actual de la página
 * Útil para depuración de problemas
 */
export async function logPageContext(page: Page, logger?: Logger) {
  const log = logger || new Logger();
  
  try {
    const url = page.url();
    log.info(`URL actual: ${url}`);
    
    const title = await page.title();
    log.info(`Título de página: ${title}`);
    
    // Contar elementos importantes
    const buttonCount = await page.locator('button').count();
    const inputCount = await page.locator('input').count();
    const selectCount = await page.locator('select').count();
    
    log.info(`Elementos en página: ${buttonCount} botones, ${inputCount} inputs, ${selectCount} selects`);
    
    // Verificar si hay diálogos o mensajes de error visibles
    const errorTexts = await page.locator('.error, .alert, [role="alert"]').allTextContents();
    if (errorTexts.length > 0) {
      log.warn('Mensajes de error encontrados en la página:', errorTexts);
    }
    
    return {
      url,
      title,
      elements: {
        buttons: buttonCount,
        inputs: inputCount,
        selects: selectCount
      },
      errors: errorTexts
    };
  } catch (error) {
    log.error('Error al obtener contexto de página:', error);
    return null;
  }
}

/**
 * Espera a que la página esté en un estado estable (sin cargas ni animaciones)
 */
export async function waitForPageStability(page: Page, options: {
  timeout?: number,
  stabilityDelay?: number,
  logger?: Logger
} = {}) {
  const {
    timeout = 30000,
    stabilityDelay = 1000,
    logger = new Logger()
  } = options;
  
  logger.info('Esperando estabilidad de página...');
  
  try {
    // Esperar a que no haya peticiones de red en vuelo
    await page.waitForLoadState('networkidle', { timeout });
    
    // Esperar a que el DOM esté completamente cargado
    await page.waitForLoadState('domcontentloaded', { timeout });
    
    // Esperar a que no haya animaciones o loaders visibles
    const loaderSelector = '.loader, .loading, .spinner, [role="progressbar"]';
    if (await page.locator(loaderSelector).count() > 0) {
      await page.waitForSelector(`${loaderSelector}:not(:visible)`, { timeout });
    }
    
    // Esperar un tiempo adicional para asegurar estabilidad
    await page.waitForTimeout(stabilityDelay);
    
    logger.info('Página estable');
    return true;
  } catch (error) {
    logger.warn('Tiempo de espera agotado para estabilidad de página:', error);
    return false;
  }
}