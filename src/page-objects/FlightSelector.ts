import { Page } from '@playwright/test';
import { selectRoundTripDates, adjustPassengerCount } from './searchPage';
import { selectFlights } from './FlightPage';

export class FlightSelector {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async selectOriginDestination(origin: string, destination: string) {
    await this.page.locator('div.searcher-input.station-selector.origin').click();
    await this.page.locator('div.iata', { hasText: origin }).nth(0).click();
    await this.page.locator('div.iata').filter({ hasText: destination }).nth(1).click();
  }

  async selectDates(flightData: FlightSelectionData) {
        await selectRoundTripDates(
          this.page,
          flightData.apiData,
          flightData.origin,
          flightData.destination,
          flightData.cabinClass.outbound,
          flightData.cabinType.outbound,
          flightData.cabinClass.return,
          flightData.cabinType.return,
          flightData.passengers.adults,
          flightData.passengers.children,
          flightData.passengers.infants,
          false
        );
      }

      async selectPassengers(flightData: FlightSelectionData) {
        await adjustPassengerCount(
          this.page,
          flightData.passengers.adults,
          flightData.passengers.children, 
          flightData.passengers.infants
        );
        await this.page.locator('#searcher_submit_button').click();
       }
       
       async selectCabinClass(flightData: FlightSelectionData) {
        await selectFlights(
          this.page,
          flightData.cabinClass.outbound,
          flightData.cabinType.outbound,
          flightData.cabinClass.return,
          flightData.cabinType.return,
          false
        );
        await this.page.getByRole('button', { name: 'Continue' }).click();
       }
}