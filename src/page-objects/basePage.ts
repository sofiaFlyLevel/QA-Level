// basePage.ts
import fs from 'fs';
const path = require('path'); // Add path module to manage file paths

// Función para obtener el sufijo ordinal (st, nd, rd, th)
function getOrdinalSuffix(day: number): string {
    const j = day % 10;
    const k = day % 100;
    if (j === 1 && k !== 11) {
      return day + "st";
    }
    if (j === 2 && k !== 12) {
      return day + "nd";
    }
    if (j === 3 && k !== 13) {
      return day + "rd";
    }
    return day + "th";
  }
  
  // Función que convierte el objeto de fecha a "Friday, December 6th"
  export function formatDateWithOrdinal(dateObj: { year: string, month: string, index: number, value: number }): string {
    // Crear una fecha a partir de la información del objeto
    const date = new Date(dateObj.year, dateObj.month - 1, dateObj.value ); // El mes es 0-indexado en JavaScript, así que restamos 1 a 'month'
  
    // Crear la fecha en el formato deseado
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
  
    // Obtener el día con el sufijo ordinal
    const dayWithSuffix = getOrdinalSuffix(date.getDate());
  
    // Combinar el resultado final
    return formattedDate.replace(date.getDate().toString(), dayWithSuffix);
  }
  
  // Función auxiliar para convertir fechas al formato MM/DD/YYYY
export const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

export function extractPhoneWithoutPrefix(phone) {
  // Divide la cadena del teléfono por espacios y toma la segunda parte
  return phone.split(' ').slice(1).join(' ');
}


// export async function handleErrorWithScreenshot(page, error, testName) {
//   console.error(`Error in ${testName}:`, error);

//   // Check if the page is closed
//   if (page.isClosed()) {
//     console.error('Page is already closed, cannot take screenshot.');
//     return;
//   }

//   // Ensure the screenshots directory exists
//   const screenshotsDir = path.join(__dirname, 'screenshots');
//   if (!fs.existsSync(screenshotsDir)) {
//     fs.mkdirSync(screenshotsDir);
//   }

//   // Define the screenshot path
//   const screenshotPath = path.join(screenshotsDir, `${testName}_error_${Date.now()}.png`);
//   console.log(`Saving screenshot to: ${screenshotPath}`);

//   try {
//     // Take a screenshot
//     await page.screenshot({ path: screenshotPath });
//   } catch (screenshotError) {
//     console.error('Error taking screenshot:', screenshotError);
//   }
// }

