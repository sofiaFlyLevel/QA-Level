import {formatDate, getDateOfBirth} from './basePage'
import { retryAction } from '../tests/utils';
import { Logger } from '../utils/Logger';

export async function fillPassengerFor(page, type, data, variable, i, lenguageLocal, dayOffset, dateOfBirth = null) {
    // Crear instancia de logger
    const logger = new Logger();
    logger.info(`Empezando a completar datos para ${type} ${i + 1}: ${data.name} ${data.surname}`);

    // Hacer una pausa más larga al inicio para asegurar que la página esté completamente cargada
    await page.waitForTimeout(3000);

    // Esperar explícitamente a que el formulario esté visible y cargado
    try {
        await page.waitForSelector(`#${type}-${i}`, { timeout: 10000, state: 'visible' });
        logger.info(`Formulario para ${type}-${i} encontrado y visible`);
    } catch (error) {
        logger.error(`Error esperando al formulario ${type}-${i}: ${error.message}`);
        // Intentamos una recarga de la página si no encontramos el formulario
        const currentUrl = page.url();
        await page.reload();
        await page.waitForLoadState('networkidle');
        logger.info(`Página recargada, intentando de nuevo para ${type}-${i}`);
        await page.waitForSelector(`#${type}-${i}`, { timeout: 15000 });
    }

    // Esperar a que el contenido dentro del formulario esté listo
    await page.waitForSelector(`#${type}-${i} [name="${variable}[${i}].name"]`, { timeout: 10000 });

    // Función para completar un campo con reintento
    async function fillFieldWithRetry(selector, value, fieldName) {
        await retryAction(
            async () => {
                const field = page.locator(selector);
                await field.waitFor({ state: 'visible', timeout: 5000 });
                await field.click();
                await field.fill(''); // Limpiar el campo primero
                await field.fill(value);
                logger.info(`Campo ${fieldName} completado con: ${value}`);
            },
            {
                name: `completar ${fieldName}`,
                retries: 3,
                delay: 1000,
                logger
            }
        );
    }

    // Completar el nombre
    await fillFieldWithRetry(
        `#${type}-${i} [name="${variable}[${i}].name"]`,
        data.name,
        'nombre'
    );

    // Completar el apellido
    await fillFieldWithRetry(
        `#${type}-${i} [name="${variable}[${i}].surname"]`,
        data.surname,
        'apellido'
    );

    // Completar fecha de nacimiento
    const dateOfBirthValue = getDateOfBirth(data.dateOfBirth, lenguageLocal, dayOffset, dateOfBirth);
    await fillFieldWithRetry(
        `#${type}-${i} [name="${variable}[${i}].dateOfBirth"]`,
        dateOfBirthValue,
        'fecha de nacimiento'
    );

    // Mejorar la selección de nacionalidad para evitar problemas de scroll/selección
    await selectNationality(page, type, i, data.nationality);

    // Seleccionar el género para el adulto correspondiente
    if (type == 'Adult') {
        const gender = data.gender.toLowerCase(); // 'male' o 'female'
        await retryAction(
            async () => {
                const genderRadio = page.locator(`input[name="${variable}[${i}].gender"][value="${gender}"]`);
                await genderRadio.waitFor({ state: 'visible', timeout: 5000 });
                await genderRadio.check({ force: true });
                logger.info(`Género seleccionado: ${gender}`);
            },
            {
                name: 'seleccionar género',
                retries: 3,
                delay: 1000,
                logger
            }
        );
    }

    // Comprobamos si hay asistencia
    if (data.assistance && data.assistance.length > 0 && type != 'Infant') {
        logger.info(`Procesando ${data.assistance.length} opciones de asistencia`);
        
        // Hacer clic en el elemento para expandir las opciones de asistencia con retry
        await retryAction(
            async () => {
                const assistantLabel = page.locator(`#${type}-${i} .assistant-label`);
                await assistantLabel.waitFor({ state: 'visible', timeout: 5000 });
                await assistantLabel.click();
                // Verificar que las opciones se desplegaron
                await page.waitForSelector(`#${type}-${i} .form-check-input`, { timeout: 5000 });
            },
            {
                name: 'expandir opciones de asistencia',
                retries: 3,
                delay: 1000,
                logger
            }
        );
        
        // Recorrer las opciones de asistencia y seleccionarlas
        for (let j = 0; j < data.assistance.length; j++) {
            const assistanceOption = data.assistance[j];
            
            await retryAction(
                async () => {
                    // Buscar la opción de asistencia y marcarla si existe
                    const checkboxLocator = page.locator(`#${type}-${i} .form-check-input + span:has-text("${assistanceOption}")`);
                    const isVisible = await checkboxLocator.isVisible();
                    
                    if (isVisible) {
                        await checkboxLocator.click();
                        logger.info(`Opción de asistencia marcada: ${assistanceOption}`);
                    } else {
                        logger.warn(`No se encontró la opción de asistencia: ${assistanceOption}`);
                    }
                },
                {
                    name: `marcar asistencia ${assistanceOption}`,
                    retries: 2,
                    delay: 1000,
                    logger
                }
            );
        }
    }

    logger.info(`Completados todos los datos para ${type} ${i + 1}: ${data.name} ${data.surname}`);
}

/**
 * Función mejorada para seleccionar la nacionalidad con una estrategia más robusta
 */
async function selectNationality(page, type, i, nationality) {
    const logger = new Logger();
    
    await retryAction(
        async () => {
            // Esperar a que el combobox esté visible y habilitado
            const combobox = page.locator(`#${type}-${i}`).getByRole('combobox');
            await combobox.waitFor({ state: 'visible', timeout: 5000 });
            
            // Hacer clic en el combobox para abrir la lista
            await combobox.click();
            logger.info('Combobox de nacionalidad abierto');
            
            // Esperar a que la lista desplegable aparezca
            await page.waitForTimeout(1000);
            
            // Escribir las primeras letras del país para filtrar
            await combobox.fill(nationality.substring(0, 3));
            logger.info(`Filtrado países con: ${nationality.substring(0, 3)}`);
            
            // Esperar a que se filtre
            await page.waitForTimeout(1000);
            
            // Intentar encontrar la opción exacta
            const option = page.getByLabel(nationality);
            const isVisible = await option.isVisible({ timeout: 2000 }).catch(() => false);
            
            if (isVisible) {
                // Hacer clic con force: true para asegurar que se registre el clic
                await option.click({ force: true });
                logger.info(`País seleccionado: ${nationality}`);
            } else {
                // Plan B: intenta un enfoque alternativo
                logger.warn(`No se pudo encontrar el país: ${nationality} con método estándar, intentando alternativo`);
                
                // Borrar el filtro y escribir más caracteres
                await combobox.fill('');
                await page.waitForTimeout(500);
                await combobox.fill(nationality.substring(0, Math.min(nationality.length, 5)));
                await page.waitForTimeout(1000);
                
                // Buscar por texto visible en vez de por label
                const countryItems = page.locator('.dropdown-item').filter({ hasText: nationality });
                if (await countryItems.count() > 0) {
                    await countryItems.first().click({ force: true });
                    logger.info(`País seleccionado (método alternativo): ${nationality}`);
                } else {
                    // Plan C: usar tabulación para seleccionar la primera opción filtrada
                    await combobox.press('Tab');
                    logger.info(`Usando Tab para seleccionar primera opción filtrada para: ${nationality}`);
                }
            }
            
            // Verificar que se haya seleccionado algo (el combobox ya no debe estar vacío)
            const value = await combobox.inputValue();
            if (!value) {
                throw new Error(`No se pudo seleccionar el país: ${nationality}`);
            }
            
            logger.info(`Selección de país completada: ${value}`);
        },
        {
            name: `seleccionar país ${nationality}`,
            retries: 4,  // Más reintentos para este caso problemático
            delay: 1500,
            logger
        }
    );
}