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
    exponentialBackoff?: boolean,
    logger?: any,
    onRetry?: (error: Error, attempt: number) => Promise<void> | void
  } = {}
): Promise<T> {
  const {
    name = 'action',
    retries = 3,
    delay = 1000,
    exponentialBackoff = true,
    logger = console,
    onRetry = null
  } = options;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`Intentando ${name} (${attempt}/${retries})`);
      return await action();
    } catch (error) {
      const isLastAttempt = attempt === retries;
      
      if (isLastAttempt) {
        logger.error(`Falló ${name} después de ${retries} intentos: ${error.message}`);
        throw error;
      }
      
      logger.warn(`Error en ${name} (intento ${attempt}/${retries}): ${error.message}`);
      
      // Ejecutar función de callback si está definida
      if (onRetry) {
        try {
          await onRetry(error, attempt);
        } catch (retryError) {
          logger.warn(`Error en onRetry para ${name}: ${retryError.message}`);
        }
      }
      
      // Calcular tiempo de espera (con backoff exponencial si está habilitado)
      const waitTime = exponentialBackoff ? delay * Math.pow(2, attempt - 1) : delay;
      logger.info(`Esperando ${waitTime}ms antes del siguiente intento...`);
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, waitTime));
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
 * Espera a que la página esté en un estado estable
 * @param page - Instancia de Page de Playwright
 * @param options - Opciones de configuración
 */
export async function waitForPageStability(page, options = {}) {
  const {
    timeout = 30000,
    stabilityDelay = 1000,
    checkNetworkIdle = true,
    checkDomContentLoaded = true,
    checkNoAnimation = true,
    logger = console
  } = options;
  
  logger.info('Esperando estabilidad de página...');
  
  try {
    // Esperar a que la navegación básica se complete
    await page.waitForLoadState('load', { timeout });
    
    // Esperar a que no haya peticiones de red en vuelo
    if (checkNetworkIdle) {
      await page.waitForLoadState('networkidle', { timeout });
    }
    
    // Esperar a que el DOM esté completamente cargado
    if (checkDomContentLoaded) {
      await page.waitForLoadState('domcontentloaded', { timeout });
    }
    
    // Esperar a que no haya animaciones o loaders visibles
    if (checkNoAnimation) {
      const loaderSelector = '.loader, .loading, .spinner, [role="progressbar"]';
      const loaderCount = await page.locator(loaderSelector).count();
      
      if (loaderCount > 0) {
        logger.info(`Encontrados ${loaderCount} elementos de carga, esperando a que desaparezcan...`);
        await page.waitForSelector(`${loaderSelector}:not(:visible)`, { timeout });
      }
    }
    
    // Esperar un tiempo adicional para asegurar estabilidad
    await page.waitForTimeout(stabilityDelay);
    
    logger.info('Página estable');
    return true;
  } catch (error) {
    logger.warn(`Tiempo de espera agotado para estabilidad de página: ${error.message}`);
    return false;
  }
}

/**
 * Verifica si un elemento está verdaderamente clickeable
 * (visible, habilitado y no obscurecido por otros elementos)
 */
export async function isElementClickable(page, selector, timeout = 5000) {
  try {
    const element = page.locator(selector);
    
    // Comprobar si el elemento existe y es visible
    await element.waitFor({ state: 'visible', timeout });
    
    // Comprobar si está habilitado
    const isDisabled = await element.evaluate(el => {
      return el.disabled || el.getAttribute('aria-disabled') === 'true' || 
             getComputedStyle(el).pointerEvents === 'none';
    }).catch(() => true);
    
    if (isDisabled) {
      return false;
    }
    
    // Verificar si está cubierto por algún otro elemento
    const isCovered = await element.evaluate(el => {
      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const elementAtPoint = document.elementFromPoint(x, y);
      return !el.contains(elementAtPoint) && elementAtPoint !== el;
    }).catch(() => true);
    
    return !isCovered;
  } catch (error) {
    return false;
  }
}

/**
 * Intenta hacer click en un elemento con estrategias avanzadas
 */
export async function safeClick(page, selector, options = {}) {
  const { 
    timeout = 5000, 
    retries = 3, 
    delay = 1000,
    logger = console,
    force = false
  } = options;
  
  return retryAction(
    async () => {
      // Esperar a que el elemento sea clickeable
      const clickable = await isElementClickable(page, selector, timeout);
      
      if (clickable || force) {
        await page.click(selector, { timeout, force });
      } else {
        // Si no es clickeable, intentar estrategias alternativas
        logger.info(`Elemento ${selector} no es clickeable naturalmente, probando alternativas`);
        
        // Estrategia 1: JavaScript click
        try {
          await page.evaluate((sel) => {
            const element = document.querySelector(sel);
            if (element) element.click();
          }, selector);
          logger.info(`Click vía JavaScript en ${selector}`);
          return;
        } catch (e) {
          logger.warn(`Error en JavaScript click: ${e.message}`);
        }
        
        // Estrategia 2: Click forzado como último recurso
        await page.click(selector, { force: true });
        logger.info(`Click forzado en ${selector}`);
      }
    },
    {
      name: `click en ${selector}`,
      retries,
      delay,
      logger
    }
  );
}