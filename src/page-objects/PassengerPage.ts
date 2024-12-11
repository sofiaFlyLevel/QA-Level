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
        await page.getByRole('radio', { name: DataADT[i].gender }).check();
  
        
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