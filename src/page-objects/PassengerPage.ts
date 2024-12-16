import {formatDate} from './basePage'



export async function fillPassengerFor(page, type, data, variable, i) {

      await page.locator(`#${type}-${i}`).click();
      await page.waitForTimeout(5000); //lo tenemos asi por el combox que falta que se distinga para cada usuario 

      // Completar los datos del adulto correspondiente
      await page.locator(`#${type}-${i} [name="${variable}[${i}].name"]`).fill(data.name);
      await page.locator(`#${type}-${i} [name="${variable}[${i}].surname"]`).fill(data.surname);
      await page.locator(`#${type}-${i} [name="${variable}[${i}].dateOfBirth"]`).fill(formatDate(data.dateOfBirth));

      // Seleccionar la nacionalidad (suponiendo que esto es lo que debe hacerse para cada adulto)
      await page.getByRole('combobox').click();
      await page.getByRole('combobox').fill(data.nationality.substring(0, 3));

      await page.getByLabel(data.nationality).click();

      // Seleccionar el género para el adulto correspondiente
      if(type == 'Adult'){
        const gender = data.gender.toLowerCase(); // 'male' o 'female'
        await page.locator(`input[name="${variable}[${i}].gender"][value="${gender}"]`).check();
      }


        // Comprobamos si hay asistencia
      if (data.assistance.length > 0 && type != 'Infant') {
        // Hacer clic en el elemento para expandir las opciones de asistencia
        await page.locator(`#${type}-${i} .assistant-label`).click();
    
        // Recorrer las opciones de asistencia y seleccionarlas
        for (let j = 0; j < data.assistance.length; j++) {
          const assistanceOption = data.assistance[j];
    
          // Buscar la opción de asistencia y marcarla si existe
          const checkboxLocator = page.locator(`#${type}-${i} .form-check-input + span:has-text("${assistanceOption}")`);
          if (await checkboxLocator.isVisible()) {
            await checkboxLocator.click();  // Marcar la casilla
          } else {
            console.log(`No se encontró la opción de asistencia: ${assistanceOption} para el pasajero ${i}`);
          }
        }
      }
  }


