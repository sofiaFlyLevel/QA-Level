// apiHelper.ts
import { request } from '@playwright/test';


export async function postApiResponse(baseUrl: string, body: any) {
  // Construye la URL con las variables
  const url = `${baseUrl}/pricing/quote`;

  // Crea un contexto de solicitud para hacer la llamada a la API
  const context = await request.newContext();

  // Realiza la solicitud POST a la API con el encabezado Ocp-Apim-Subscription-Key y el cuerpo
  const response = await context.post(url, {
    headers: {
      'Authorization': 'Bearer tu_token',  // Si es necesario un token de autenticación
      'Ocp-Apim-Subscription-Key': '8053997ae5704182814a765c480da09a',  // Agrega la clave de suscripción
      'Content-Type': 'application/json'  // Especifica que el contenido es JSON
    },
    data: body  // Cuerpo de la solicitud
  });

  // Verifica que la respuesta fue exitosa y retorna los datos
  if (response.ok()) {
    const json = await response.json();  // Obtén el cuerpo de la respuesta como JSON
    return json;  // Retorna el JSON recibido
  } else {
    throw new Error(`Error en la solicitud: ${response.status()}`);
  }
}





export async function getApiResponse(baseUrl: string, origin: string, destination: string, definition: string) {
  // Construye la URL con las variables
  const url = `${baseUrl}/schedule/operability/${origin}-${destination}/calendar?Definition=${definition}`;

  // Crea un contexto de solicitud para hacer la llamada a la API
  const context = await request.newContext();

  // Realiza la solicitud GET a la API con el nuevo encabezado Ocp-Apim-Subscription-Key
  const response = await context.get(url, {
    headers: {
      'Authorization': 'Bearer tu_token',  // Si es necesario un token de autenticación
      'Ocp-Apim-Subscription-Key': '8053997ae5704182814a765c480da09a'  // Agrega la clave de suscripción
    }
  });

  // Verifica que la respuesta fue exitosa y retorna los datos
  if (response.ok()) {
    const json = await response.json();  // Obtén el cuerpo de la respuesta como JSON
    return json;  // Retorna el JSON recibido
  } else {
    throw new Error(`Error en la solicitud: ${response.status()}`);
  }
}

// Reusable function to transform API response into the desired array format
export const transformApiResponse = (apiResponse) => {
  const transformedArray = [];

  // Iterate over the years
  for (const year in apiResponse.dateYears) {
    // Iterate over the months within each year
    for (const month in apiResponse.dateYears[year]) {
      const monthArray = apiResponse.dateYears[year][month];

      // Add each item in the monthArray along with the corresponding year and month index
      monthArray.forEach((item, index) => {
        transformedArray.push({
          year: year,
          month: month,
          index: index,
          value: item
        });
      });
    }
  }

  return transformedArray;
};