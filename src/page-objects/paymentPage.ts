export async function payWithCard(page, payCardData) {
    try {
        // Increase timeout to wait for iframe
        await page.waitForSelector('iframe[title="Iframe for expiry date"]', { timeout: 60000 }); // 60 seconds timeout
    
    // Verifica y espera a que el iframe esté presente
    // await page.waitForSelector('iframe[title="Iframe for expiry date"]');
  
    // Localiza el iframe y su contenido
    const iframe = page.frame({ url: /securedFields/ }); // Buscar iframe por URL parcial
    if (iframe) {
        console.log("Iframe encontrado.");
        await iframe.locator('input[data-fieldtype="encryptedCardNumber"]').fill(payCardData.cardNumber);
    } else {
        console.log("Iframe no encontrado.");
    }
  
    await page.locator('iframe[title="Iframe for expiry date"]').contentFrame().getByLabel('Expiry date').fill(payCardData.expiryDate);
    await page.locator('iframe[title="Iframe for security code"]').contentFrame().getByLabel('Security code').fill(payCardData.cvc);
  
    await page.getByLabel('Name on card').click();
    await page.getByLabel('Name on card').fill(payCardData.nameOnCard);
      
  
    await page.getByRole('checkbox').check();
  
    await page.getByRole('button', { name: 'Pay $' }).click();
} catch (error) {
    console.error('Error while handling iframe payment:', error);
    throw error; // Rethrow or handle accordingly
  }
}