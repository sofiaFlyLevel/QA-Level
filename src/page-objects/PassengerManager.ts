import { Page } from '@playwright/test';
import { fillPassengerFor } from './PassengerPage';

export class PassengerManager {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async fillPassengerInformation(type: string, data: any, variable: string, i: number, language: string, dayOffset: number) {
    await fillPassengerFor(this.page, type, data, variable, i, language, dayOffset);
  }

}