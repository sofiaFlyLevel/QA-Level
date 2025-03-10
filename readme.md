# Framework de Pruebas Automatizadas para LEVEL

Este es un framework de pruebas end-to-end para el proceso de reserva de vuelos de la aerolínea LEVEL, desarrollado con Playwright. El framework permite automatizar diferentes escenarios de reserva, incluyendo distintas configuraciones de cabina, selección de asientos, tipos de pasajeros y más.

## Tabla de Contenidos

- [Web Informe](https://sofiaflylevel.github.io/QA-Level/#)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Descripción de Componentes](#descripción-de-componentes)
- [Configuración de Pruebas](#configuración-de-pruebas)
- [Ejecución de Pruebas](#ejecución-de-pruebas)
- [Recolección de Datos](#recolección-de-datos)
- [Manejo de Errores](#manejo-de-errores)
- [Extensión del Framework](#extensión-del-framework)
- [Solución de Problemas](#solución-de-problemas)

## Requisitos

- Node.js (v16 o superior)
- npm (v7 o superior)
- Visual Studio Code (para mejor experiencia de desarrollo)

## Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd nivel-booking-tests
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Instalar Playwright y navegadores**:
   ```bash
   npx playwright install
   ```

4. **Instalar extensión de Playwright para VS Code**:
   - Abrir VS Code
   - Ir a la pestaña de extensiones (Ctrl+Shift+X)
   - Buscar "Playwright Test for VS Code"
   - Instalar la extensión

## Estructura del Proyecto

```
/
├── config/
│   └── test-configs.ts        # Configuraciones de pruebas
├── fixtures/
│   ├── environmentData.ts     # Datos de entorno (URLs, APIs)
│   ├── ruteData.ts            # Datos de rutas de vuelo
│   └── userData.ts            # Datos de usuarios, tarjetas, etc.
├── page-objects/
│   ├── basePage.ts            # Funciones base para todas las páginas
│   ├── confirmation.ts        # Funciones para página de confirmación
│   ├── FlightPage.ts          # Funciones para selección de vuelos
│   ├── PassengerPage.ts       # Funciones para datos de pasajeros
│   ├── paymentPage.ts         # Funciones para proceso de pago
│   └── searchPage.ts          # Funciones para búsqueda de vuelos
├── tests/
│   ├── ExtraSeat.spec.ts      # Pruebas con selección de asiento
│   ├── mmb.spec.ts            # Pruebas de My Booking
│   └── NoExtraNoSeat.spec.ts  # Pruebas sin extras/asientos
├── utils/
│   ├── apiHelper.ts           # Funciones para llamadas a API
│   ├── Logger.ts              # Utilidad de logging
│   ├── test-framework.ts      # Framework central de pruebas
│   └── utils.ts               # Utilidades generales
├── playwright.config.ts       # Configuración de Playwright
└── package.json               # Dependencias y scripts
```

## Descripción de Componentes

### Archivos de Configuración

#### `config/test-configs.ts`
Contiene configuraciones predefinidas para diferentes escenarios de prueba:
- `NoExtraNoSeatTestConfigs`: Pruebas básicas sin selección de asiento ni extras
- `ExtraSeatTestConfigs`: Pruebas con selección de asiento
- `OneWayTripTestConfigs`: Pruebas de viajes de solo ida
- `generateAllCabinConfigurations()`: Genera pruebas para todas las combinaciones de cabina

#### `fixtures/userData.ts`
Define datos de prueba para:
- Adultos (`userDataADT`)
- Niños (`userDataCHD`)
- Infantes (`userDataINL`)
- Códigos de promoción
- Tarjetas de pago (`paymentCards`)
- Enums para tipos de cabina (`CabinClass`, `CabinType`)

#### `fixtures/environmentData.ts`
Contiene URLs para diferentes entornos:
- Producción
- Desarrollo
- Preproducción

#### `fixtures/ruteData.ts`
Define las rutas para las pruebas (origen y destino).

### Page Objects

#### `page-objects/basePage.ts`
Funciones base utilizadas en todas las páginas:
- Formateo de fechas
- Funciones de utilidad para manejo de datos
- Generación de fechas de nacimiento

#### `page-objects/searchPage.ts`
Gestiona la página de búsqueda de vuelos:
- `selectCountryAndDate()`: Selecciona país y fecha usando datos de la API
- `selectRoundTripDates()`: Gestiona selección de fechas para ida y vuelta
- `adjustPassengerCount()`: Ajusta número de pasajeros

#### `page-objects/FlightPage.ts`
Gestiona la selección de vuelos:
- `selectFlights()`: Selecciona vuelos basados en clase y tipo de cabina
- `extractFlightCardInfo()`: Extrae información detallada de las tarjetas de vuelo (aeropuertos, horarios, precios)

#### `page-objects/PassengerPage.ts`
Gestiona la página de información de pasajeros:
- `fillPassengerFor()`: Completa formularios de pasajeros
- Manejo de asistencia especial

#### `page-objects/paymentPage.ts`
Gestiona el proceso de pago:
- `payWithCard()`: Completa el formulario de pago con tarjeta

#### `page-objects/confirmation.ts`
Gestiona la página de confirmación:
- `validationConfirmPage()`: Valida que la reserva se haya completado
- `saveBookingCodeToExcel()`: Guarda toda la información de la reserva en Excel

### Framework Principal

#### `utils/test-framework.ts`
Núcleo del framework de pruebas:
- Clase `LevelTestRunner`: Orquesta el flujo completo de reserva
- `runSingleTest()`: Ejecuta un caso de prueba individual
- `runTestSuite()`: Ejecuta múltiples casos de prueba
- Funciones de retry y manejo de errores

#### `utils/apiHelper.ts`
Funciones para interactuar con APIs:
- `getApiResponse()`: Obtiene datos de disponibilidad
- `postApiResponse()`: Envía datos para cotización
- `transformApiResponse()`: Transforma respuestas de API

#### `utils/Logger.ts`
Sistema de logging para el framework:
- `info()`: Mensajes informativos
- `warn()`: Advertencias
- `error()`: Errores

### Archivos de Pruebas

#### `tests/NoExtraNoSeat.spec.ts`
Pruebas sin selección de asiento ni extras:
- Pruebas de ida y vuelta
- Pruebas de solo ida
- Diferentes combinaciones de cabina

#### `tests/ExtraSeat.spec.ts`
Pruebas con selección de asiento:
- Diferentes combinaciones de pasajeros
- Diferentes clases de cabina

#### `tests/mmb.spec.ts`
Pruebas del módulo My Booking:
- Verificación de reservas existentes
- Clase `MyBookingManager` para gestionar las pruebas

## Configuración de Pruebas

### Definir un Nuevo Caso de Prueba

```typescript
const miPrueba: TestCase = {
  name: "Mi prueba personalizada",
  description: "Descripción de la prueba",
  flightConfig: {
    origin: ruteData.origin,
    destination: ruteData.destination,
    outboundFlightClass: CabinClass.ECONOMY,
    outboundFlightType: CabinType.LIGHT,
    returnFlightClass: CabinClass.ECONOMY,
    returnFlightType: CabinType.LIGHT,
    isOneWay: false
  },
  passengerConfig: {
    adults: [userDataADT[0]],
    children: [],
    infants: [],
    language: Language.EN,
    dayOffset: -1
  },
  paymentInfo: paymentCards[0],
  includeSeats: false // true para incluir selección de asientos
};
```

### Personalizar Entorno

En `fixtures/environmentData.ts`, puedes cambiar el entorno modificando la URL:

```typescript
export const entornoData = {
    prod: {
        url: 'https://www.flylevel.com/en/?currencyCode=USD'
    },
    dev: {
        url: "https://lv-uihomeweb-webapp-dev.azurewebsites.net/?searchFlightBkn=APS"
    },
    pre: {
        url: 'https://lv-fndoor-ecommerce-sbx-ghdubdbgdtcsane6.a01.azurefd.net/?searchFlightBkn=APS'
    },
};
```

## Ejecución de Pruebas

### Ejecutar Todas las Pruebas

```bash
npx playwright test
```

### Ejecutar un Archivo Específico

```bash
npx playwright test NoExtraNoSeat.spec.ts
```

### Ejecutar una Prueba Específica en un Archivo Específico

```bash
npx browserstack-node-sdk playwright test --grep "10. Compra 1 adulto - Economy Extra - sin asiento - sin extras" src/tests/NoExtraNoSeat.spec.ts
```

### Ejecutar Tests con UI

```bash
npx playwright test --ui
```

### Ejecutar Tests en Modo Debug

```bash
npx playwright test --debug
```

### Ejecutar con Visual Studio Code

1. Abrir la pestaña de Testing en VS Code (icono de matraz)
2. Expandir "Playwright Tests"
3. Hacer clic en el botón de reproducción junto a la prueba deseada

## Recolección de Datos

Todas las reservas exitosas se almacenan en un archivo Excel (`booking_codes.xlsx`) con información detallada:

### Información Básica
- Código de reserva (PNR)
- Fecha y hora de creación

### Información de Vuelo
- Origen y destino
- Tipo de viaje (ida y vuelta o solo ida)
- Clases de cabina
- Fechas de vuelo
- Horarios de salida y llegada
- Códigos de aeropuerto
- Duración de los vuelos
- Aerolínea operadora
- Precios

### Información de Pasajeros
- Número de adultos, niños e infantes
- Nombres completos
- Nacionalidades
- Edades
- Género
- Asistencia especial

### Información de Pago
- Tarjeta utilizada
- Nombre en la tarjeta

## Manejo de Errores

El framework incluye varias estrategias para manejar errores:

### Reintentos Automáticos
- Nivel de paso: Cada acción individual puede reintentarse
- Nivel de prueba: Una prueba completa puede reintentarse

# Configuración y Uso de BrowserStack con Playwright

Este documento explica cómo configurar y utilizar BrowserStack Automate para ejecutar pruebas de Playwright en múltiples navegadores y dispositivos en la nube.

## Índice

- [Instalación](#instalación)
- [Configuración](#configuración)
- [Modificación de Archivos de Prueba](#modificación-de-archivos-de-prueba)
- [Ejecución de Pruebas](#ejecución-de-pruebas)
- [Visualización de Resultados](#visualización-de-resultados)
- [Configuración de Dispositivos](#configuración-de-dispositivos)
- [Solución de Problemas](#solución-de-problemas)
- [Buenas Prácticas](#buenas-prácticas)

## Instalación

1. Instala el SDK de BrowserStack para Node.js:

```bash
npm install -D browserstack-node-sdk
```

2. Actualiza los scripts en tu `package.json`:

```json
"scripts": {
  "test": "playwright test",
  "process-report": "python process_junit.py",
  "postinstall": "npm update browserstack-node-sdk",
  "test-browserstack": "browserstack-node-sdk playwright test"
}
```

## Configuración

### 1. Crear archivo browserstack.yml

Crea un archivo `browserstack.yml` en la raíz del proyecto:

```yaml
# Credenciales de BrowserStack
userName: tu_username
accessKey: tu_access_key

# Configuración del proyecto
projectName: "LEVEL Booking Automated Tests"
buildName: "LEVEL Booking Tests"
buildIdentifier: "#${BUILD_NUMBER}"

# Plataformas a probar (navegadores/dispositivos)
platforms:
  - os: Windows
    osVersion: 11
    browserName: chrome
    browserVersion: latest
  - os: OS X
    osVersion: Ventura
    browserName: safari
    browserVersion: latest
  - deviceName: Samsung Galaxy S23 Ultra
    browserName: chrome
    osVersion: 13.0
  - deviceName: iPhone 14 Pro
    browserName: safari
    osVersion: 16

# Paralelismo
parallelsPerPlatform: 1

# Configuración de BrowserStack Local (para sitios locales o privados)
browserstackLocal: true

# Características de depuración
debug: false
networkLogs: true
consoleLogs: info

# Observabilidad de prueba
testObservability: true
```

### 2. Crear archivo browserstack.config.js

Crea un archivo `browserstack.config.js` en la raíz del proyecto:

```javascript
const base = require('./playwright.config');

// Sobrescribe las opciones necesarias para BrowserStack
const browserStackConfig = {
  ...base,
  // Modificamos la configuración para BrowserStack
  use: {
    ...base.use,
    // No usar headless porque queremos ver las pruebas en BrowserStack
    headless: false,
    // No estamos usando trace en BrowserStack
    trace: 'off',
    // Capturas de pantalla en caso de fallos
    screenshot: 'only-on-failure'
  },
  // Solo usamos un proyecto para BrowserStack
  projects: [
    {
      name: 'browserstack',
      use: {
        ...base.use,
        // No es necesario especificar el dispositivo aquí, ya que BrowserStack lo hará
      },
    }
  ],
  // Aumentar timeouts para BrowserStack
  timeout: 120000,
};

module.exports = browserStackConfig;
```

## Modificación de Archivos de Prueba

Para que tus pruebas funcionen correctamente en BrowserStack, debes modificar tus archivos de prueba para incluir detección y configuración específica para BrowserStack.

### Pasos generales para modificar archivos:

1. Añadir detección de BrowserStack:

```typescript
// Al principio del archivo
const isBrowserStack = process.env.BROWSERSTACK_RUN_ON === 'true';
```

2. Ajustar timeouts para BrowserStack:

```typescript
const TEST_TIMEOUT = isBrowserStack ? TestConfig.timeouts.test * 2 : TestConfig.timeouts.test;
```

3. Añadir funciones de soporte para BrowserStack:

```typescript
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
```

4. Modificar cada test para usar las funciones de soporte:

```typescript
test('Nombre del test', async ({ browser }) => {
  try {
    await setupBrowserStackTest(browser, testName);
    // Código de la prueba
    await runSingleTest(browser, config);
  } catch (error) {
    handleBrowserStackError(error, testName);
  }
}, TEST_TIMEOUT);
```
## Abrir el programa de BrowserStackLocal y conectar con la web 

## Ejecución de Pruebas

### Ejecutar todas las pruebas en BrowserStack

```bash
npm run test-browserstack
```

### Ejecutar un archivo específico

```bash
npx browserstack-node-sdk playwright test src/tests/NoExtraNoSeat.spec.ts
```

### Ejecutar un test específico

```bash
npx browserstack-node-sdk playwright test -g "Compra 1 adulto - Economy Light" src/tests/NoExtraNoSeat.spec.ts
```

### Ejecutar en un navegador específico

Para ejecutar en un navegador específico, debes modificar el archivo `browserstack.yml`:

```yaml
platforms:
  - os: Windows
    osVersion: 11
    browserName: chrome
    browserVersion: latest
```

Y luego ejecutar:

```bash
npm run test-browserstack
```

## Visualización de Resultados

Para ver los resultados de tus pruebas en BrowserStack:

1. Inicia sesión en tu cuenta de BrowserStack (https://automate.browserstack.com/)
2. Ve a la sección "Builds" para ver tus ejecuciones recientes
3. Haz clic en la ejecución actual para ver detalles de las pruebas
4. Podrás ver:
   - Lista de pruebas ejecutadas
   - Estado de cada prueba (aprobada/fallida)
   - Videos de las ejecuciones
   - Capturas de pantalla
   - Registros de consola
   - Información de red

## Configuración de Dispositivos

BrowserStack te permite probar en una amplia variedad de combinaciones de dispositivos y navegadores.

### Navegadores de Escritorio

```yaml
platforms:
  - os: Windows
    osVersion: 11
    browserName: chrome
    browserVersion: latest
  - os: Windows
    osVersion: 11
    browserName: firefox
    browserVersion: latest
  - os: OS X
    osVersion: Ventura
    browserName: safari
    browserVersion: latest
  - os: OS X
    osVersion: Monterey
    browserName: chrome
    browserVersion: latest
```

### Dispositivos Móviles

```yaml
platforms:
  - deviceName: iPhone 14 Pro
    browserName: safari
    osVersion: 16
  - deviceName: iPhone 13
    browserName: safari
    osVersion: 15
  - deviceName: Samsung Galaxy S23 Ultra
    browserName: chrome
    osVersion: 13.0
  - deviceName: Google Pixel 7
    browserName: chrome
    osVersion: 13.0
```

### Sistemas Operativos Disponibles

**Windows:** 11, 10, 8.1, 8, 7
**macOS:** Ventura, Monterey, Big Sur, Catalina, Mojave
**iOS:** 16, 15, 14, 13
**Android:** 13.0, 12.0, 11.0, 10.0, 9.0

### Navegadores Disponibles

**Windows/macOS:** Chrome, Firefox, Edge, Safari (solo macOS)
**iOS:** Safari
**Android:** Chrome, Samsung Browser

## Solución de Problemas

### Problemas de autenticación

Si tienes problemas con las credenciales, prueba configurando variables de entorno:

```bash
export BROWSERSTACK_USERNAME='tu_username'
export BROWSERSTACK_ACCESS_KEY='tu_access_key'
npm run test-browserstack
```

### Timeouts

Si las pruebas fallan por timeouts en BrowserStack:

1. Aumenta los timeouts en browserstack.config.js:
```javascript
timeout: 180000, // 3 minutos
```

2. Configura timeouts específicos dentro de tus pruebas:
```typescript
if (isBrowserStack) {
  page.setDefaultNavigationTimeout(120000);
  page.setDefaultTimeout(60000);
}
```

### Selectores que no funcionan

Si algunos selectores funcionan localmente pero no en BrowserStack:

1. Usa selectores más robustos (IDs, atributos de datos)
2. Implementa múltiples estrategias de selección:

```typescript
async function clickElement(page, selectors) {
  for (const selector of selectors) {
    try {
      await page.click(selector, { timeout: 5000 });
      console.log(`Selector exitoso: ${selector}`);
      return;
    } catch (error) {
      console.log(`Selector falló: ${selector}`);
    }
  }
  throw new Error('Ningún selector funcionó');
}

// Uso:
await clickElement(page, [
  '#button-id',
  '.button-class',
  'text=Texto del botón'
]);
```

## Buenas Prácticas

1. **Marca claramente las pruebas en BrowserStack**
   - Usa nombres descriptivos en el buildName y projectName
   - Incluye información de la versión/commit

2. **Optimiza las pruebas para entornos en la nube**
   - Reduce la cantidad de acciones en cada prueba
   - Prioriza pruebas críticas sobre pruebas exhaustivas

3. **Maneja adecuadamente los recursos**
   - Cierra correctamente las sesiones del navegador
   - No ejecutes más pruebas paralelas de las necesarias

4. **Monitorea y optimiza los costos**
   - BrowserStack cobra por minuto de prueba paralela
   - Usa pruebas paralelas sabiamente

5. **Mejora continuamente la estabilidad**
   - Analiza patrones de falla en BrowserStack
   - Implementa esperas más inteligentes para diferentes entornos


### Capturas de Pantalla
Se generan capturas automáticas