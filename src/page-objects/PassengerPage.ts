import {formatDate} from './basePage'

export async function fillPassengerData(page, DataADT, DataCHD, DataINL) {

        
    // Suponiendo que ticketData.ADT es la cantidad de adultos
    for (let i = 0; i < DataADT.length; i++) {
        // Cambiar el '0' por 'i' para cada adulto
        await page.locator(`#Adult-${i}`).click();
        await page.waitForTimeout(5000); //lo tenemos asi por el combox que falta que se distinga para cada usuario 
  
        // Completar los datos del adulto correspondiente
        await page.locator(`[name="adults[${i}].name"]`).fill(DataADT[i].name);
        await page.locator(`[name="adults[${i}].surname"]`).fill(DataADT[i].surname);
        await page.locator(`[name="adults[${i}].dateOfBirth"]`).fill(formatDate(DataADT[i].dateOfBirth));
  
        // Seleccionar la nacionalidad (suponiendo que esto es lo que debe hacerse para cada adulto)
        await page.getByRole('combobox').click();
        await page.getByRole('combobox').fill(DataADT[i].nationality.substring(0, 3));
  
        await page.getByLabel(DataADT[i].nationality).click();
  
        // Seleccionar el género para el adulto correspondiente
        const gender = DataADT[i].gender.toLowerCase(); // 'male' o 'female'
        await page.locator(`input[name="adults[${i}].gender"][value="${gender}"]`).check();


          // Comprobamos si hay asistencia
        if (DataADT[i].assistance.length > 0) {
          // Hacer clic en el elemento para expandir las opciones de asistencia
          await page.locator(`#Adult-${i} .assistant-label`).click();
      
          // Recorrer las opciones de asistencia y seleccionarlas
          for (let j = 0; j < DataADT[i].assistance.length; j++) {
            const assistanceOption = DataADT[i].assistance[j];
      
            // Buscar la opción de asistencia y marcarla si existe
            const checkboxLocator = page.locator(`#Adult-${i} .form-check-input + span:has-text("${assistanceOption}")`);
            if (await checkboxLocator.isVisible()) {
              await checkboxLocator.click();  // Marcar la casilla
            } else {
              console.log(`No se encontró la opción de asistencia: ${assistanceOption} para el pasajero ${i}`);
            }
          }
        }
                
      }
  
      for (let i = 0; i < DataCHD.length; i++) {
        // Cambiar el '0' por 'i' para cada adulto
        await page.locator(`#Child-${i}`).click();
        await page.waitForTimeout(5000); //lo tenemos asi por el combox que falta que se distinga para cada usuario 
  
        // Completar los datos del adulto correspondiente
        await page.locator(`[name="children[${i}].name"]`).fill(DataCHD[i].name);
        await page.locator(`[name="children[${i}].surname"]`).fill(DataCHD[i].surname);
        await page.locator(`[name="children[${i}].dateOfBirth"]`).fill(formatDate(DataCHD[i].dateOfBirth));
  
        // Seleccionar la nacionalidad (suponiendo que esto es lo que debe hacerse para cada adulto)
        await page.getByRole('combobox').click();
        await page.getByRole('combobox').fill(DataCHD[i].nationality.substring(0, 3));
  
        await page.getByLabel(DataCHD[i].nationality).click();
  
         // Comprobamos si hay asistencia
         if (DataCHD[i].assistance.length > 0) {
          // Hacer clic en el elemento para expandir las opciones de asistencia
          await page.locator(`#Child-${i} .assistant-label`).click();
      
          // Recorrer las opciones de asistencia y seleccionarlas
          for (let j = 0; j < DataCHD[i].assistance.length; j++) {
            const assistanceOption = DataCHD[i].assistance[j];
      
            // Buscar la opción de asistencia y marcarla si existe
            const checkboxLocator = page.locator(`#Child-${i} .form-check-input + span:has-text("${assistanceOption}")`);
            if (await checkboxLocator.isVisible()) {
              await checkboxLocator.click();  // Marcar la casilla
            } else {
              console.log(`No se encontró la opción de asistencia: ${assistanceOption} para el pasajero ${i}`);
            }
          }
        }
      }
  
      for (let i = 0; i < DataINL.length; i++) {
        // Cambiar el '0' por 'i' para cada adulto
        await page.locator(`#Infant-${i}`).click();
        await page.waitForTimeout(5000); //lo tenemos asi por el combox que falta que se distinga para cada usuario 
  
        // Completar los datos del adulto correspondiente
        await page.locator(`[name="infants[${i}].name"]`).fill(DataINL[i].name);
        await page.locator(`[name="infants[${i}].surname"]`).fill(DataINL[i].surname);
        await page.locator(`[name="infants[${i}].dateOfBirth"]`).fill(formatDate(DataINL[i].dateOfBirth));
  
        // Seleccionar la nacionalidad (suponiendo que esto es lo que debe hacerse para cada adulto)
        await page.getByRole('combobox').click();
        await page.getByRole('combobox').fill(DataINL[i].nationality.substring(0, 3));
  
        await page.getByLabel(DataINL[i].nationality).click();
      }
  
      await page.waitForTimeout(5000); // Espera 5 segundos
    
      await page.locator('#contact').click();
    
      await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
      await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
         
}





//Adult0 no rellena bien 
// export async function fillPassengerData(page, DataADT, DataCHD, DataINL) {
//   const fillPassenger = async (type, data, variable) => {
      
//       for (let i = 0; i < data.length; i++) {
//           // Para adultos, asumimos que el primer adulto ya está desplegado
//           if (type === 'Adult' && i > 0) {
//               await page.locator(`#${type}-${i}`).click();
//           }

//           // Completar los datos del pasajero
//           await page.locator(`[name="${variable}[${i}].name"]`).fill(data[i].name);
//           await page.locator(`[name="${variable}[${i}].surname"]`).fill(data[i].surname);
//           await page.locator(`[name="${variable}[${i}].dateOfBirth"]`).fill(formatDate(data[i].dateOfBirth));

//           // Seleccionar la nacionalidad
//           await page.getByRole('combobox').click();
//           await page.getByRole('combobox').fill(data[i].nationality.substring(0, 3));
//           await page.getByLabel(data[i].nationality).click();

//           // Seleccionar el género
//           const gender = data[i].gender.toLowerCase();
//           await page.locator(`input[name="${variable}[${i}].gender"][value="${gender}"]`).check();

//           // Comprobar y seleccionar asistencia
//           if (data[i].assistance.length > 0) {
//               await page.locator(`#${type}-${i} .assistant-label`).click();
//               for (const assistanceOption of data[i].assistance) {
//                   const checkboxLocator = page.locator(`#${type}-${i} .form-check-input + span:has-text("${assistanceOption}")`);
//                   if (await checkboxLocator.isVisible()) {
//                       await checkboxLocator.click();
//                   } else {
//                       console.log(`No se encontró la opción de asistencia: ${assistanceOption} para el pasajero ${i}`);
//                   }
//               }
//           }
//       }
//   };

//   // Llenar datos de adultos, niños e infantes
//   await page.waitForTimeout(5000); // Espera 5 segundos
//   await fillPassenger('Adult', DataADT, 'adults');
//   await fillPassenger('Child', DataCHD, 'children');
//   await fillPassenger('Infant', DataINL, 'infants');

//   // Esperar a que el formulario de contacto esté visible
//   await page.waitForSelector('#contact');
//   await page.locator('#contact').click();
  
//   // Esperar hasta que el campo de teléfono esté habilitado
//   await page.waitForSelector('input[name="contactDetails.phone"]');
//   // Completar los detalles de contacto
//   await page.locator('input[name="contactDetails.phone"]').fill(DataADT[0].phone);
//   await page.locator('input[name="contactDetails.email"]').fill(DataADT[0].email);
// }


