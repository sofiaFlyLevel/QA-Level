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
  ]
};

module.exports = browserStackConfig;