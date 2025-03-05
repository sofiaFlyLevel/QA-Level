# Framework de Pruebas Automatizadas para LEVEL

Este es un framework de pruebas end-to-end para el proceso de reserva de vuelos de la aerolínea LEVEL, desarrollado con Playwright. El framework permite automatizar diferentes escenarios de reserva, incluyendo distintas configuraciones de cabina, selección de asientos, tipos de pasajeros y más.

## Tabla de Contenidos

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

### Ejecutar una Prueba Específica

```bash
npx playwright test -g "Compra 1 adulto - Economy Light"
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

### Capturas de Pantalla
Se generan capturas automáticas