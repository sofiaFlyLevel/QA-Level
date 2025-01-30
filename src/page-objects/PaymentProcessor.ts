import { Page } from '@playwright/test';
import { payWithCard } from './paymentPage';
import { validationConfirmPage } from './confirmation';

export class PaymentProcessor {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async processPayment(paymentData: any) {
    await payWithCard(this.page, paymentData);
    await this.page.waitForTimeout(1000);
  }

  async verifyConfirmation() {
    await validationConfirmPage(this.page);
    await this.page.waitForTimeout(1000);
  }
}