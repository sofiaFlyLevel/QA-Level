# LEVEL Flight Booking Test Automation Framework

This project is an automated testing framework for LEVEL Airlines flight booking system. It uses Playwright to simulate user interactions and test various booking scenarios including different cabin classes, passenger combinations, and booking options.

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Test Cases](#test-cases)
- [Data Collection](#data-collection)
- [Extending the Framework](#extending-the-framework)
- [Troubleshooting](#troubleshooting)

## Features

- Automated end-to-end testing of the entire flight booking process
- Support for different passenger combinations (adults, children, infants)
- Testing various cabin classes and types (Economy/Premium, Light/Comfort/Extra)
- Testing with and without seat selection
- Support for different languages and currencies
- Comprehensive logging and reporting
- Automatic retry mechanisms for flaky tests
- Data collection in Excel for analysis and reporting

## Project Structure

```
/level-test-project
  /fixtures
    - userData.ts       # User data for testing (passengers, payment info)
    - environmentData.ts# Environment URLs and API endpoints
    - ruteData.ts       # Flight route data
  /page-objects
    - basePage.ts       # Base page functionality and utilities
    - PassengerPage.ts  # Functions for the passenger information page
    - searchPage.ts     # Functions for flight search
    - FlightPage.ts     # Functions for flight selection
    - paymentPage.ts    # Functions for payment processing
    - confirmation.ts   # Functions for booking confirmation
  /utils
    - Logger.ts         # Logging functionality
    - apiHelper.ts      # Helper functions for API calls
    - test-framework.ts # Core testing framework
  /config
    - test-configs.ts   # Test case configurations
  /tests
    - NoExtraNoSeat.spec.ts # Tests for flights without extras/seats
    - ExtraSeat.spec.ts     # Tests for flights with seat selection
    - mmb.spec.ts           # Tests for My Booking functionality
    - utils.ts              # Additional test utilities
  /playwright.config.ts
  /package.json
  /README.txt
```

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/sofiaFlyLevel/QA-Level.git
   cd level-test-project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

### Visual Studio Code Extension

To run and debug tests in Visual Studio Code, install the Playwright extension:

1. Open VS Code
2. Go to Extensions (or press `Ctrl+Shift+X`)
3. Search for "Playwright Test for VSCode"
4. Click Install

The extension provides:
- Test explorer view
- One-click test execution
- Debugging capabilities
- Test reporting

## Configuration

### Environment Configuration

Configure the test environment in `fixtures/environmentData.ts`:

```typescript
export const entornoData = {
    prod: {
        url: 'https://www.flylevel.com/en/?currencyCode=USD'
    },
    dev: {
      url: "https://lv-uihomeweb-webapp-dev.azurewebsites.net/?searchFlightBkn=APS"
    },
    pre: {
        url: 'https://lv-fndoor-ecommerce-sbx-ghdubdbgdtcsane6.a01.azurefd.net/?searchFlightBkn=APS'
    },
};
```

### Route Configuration

Configure flight routes in `fixtures/ruteData.ts`:

```typescript
export const ruteData = {
    origin: "SCL", 
    destination: "BCN"
};
```

### User Data Configuration

Configure test users, passengers, and payment information in `fixtures/userData.ts`.

### Test Configuration

Modify test cases in `config/test-configs.ts` to add new test scenarios.

## Running Tests

### Running All Tests

```bash
npx playwright test
```

### Running Specific Test Files

```bash
npx playwright test NoExtraNoSeat.spec.ts
```

### Running in UI Mode

```bash
npx playwright test --ui
```

### Running with VS Code Extension

1. Open the Testing panel in VS Code
2. Expand the Playwright Tests section
3. Click the play button next to the test or test file you want to run

## Test Cases

The framework includes several test case categories:

### No Extra No Seat Tests

Basic flight bookings without seat selection or extras:

- Different passenger combinations
- Various cabin classes
- One-way and round-trip scenarios

### Extra Seat Tests

Tests with seat selection:

- Different passenger combinations
- Various cabin classes

### MMB (My Booking) Tests

Tests for the My Booking functionality:

- Verifying existing bookings
- Validating booking details

## Data Collection

All test execution data is collected in an Excel file (`booking_codes.xlsx`) for analysis. This includes:

- Booking reference (PNR)
- Flight details (origin, destination, dates, times)
- Passenger information
- Booking configuration (cabin class, trip type)
- Language and currency
- Payment details
- Test timestamp

## Key Files and Their Functions

### Page Objects

- **basePage.ts**: Contains utility functions like date formatting and helper methods used across multiple pages.

- **searchPage.ts**: Handles flight search functionality, including:
  - `selectCountryAndDate`: Selects origin, destination, and flight dates
  - `selectRoundTripDates`: Handles date selection for round trips
  - `adjustPassengerCount`: Modifies the number of passengers for a booking

- **FlightPage.ts**: Manages flight selection with:
  - `selectFlights`: Selects flights based on specified cabin class and type

- **PassengerPage.ts**: Handles passenger information entry:
  - `fillPassengerFor`: Fills passenger details for each passenger type

- **paymentPage.ts**: Handles payment process:
  - `payWithCard`: Processes credit card payment

- **confirmation.ts**: Manages booking confirmation:
  - `validationConfirmPage`: Validates the booking was successful
  - `saveBookingCodeToExcel`: Saves booking details to Excel file

### Utility Files

- **apiHelper.ts**: Contains API interaction functions:
  - `getApiResponse`: Gets data from API endpoints
  - `postApiResponse`: Posts data to API endpoints
  - `transformApiResponse`: Transforms API response data

- **Logger.ts**: Provides logging functionality for better debugging and reporting.

- **test-framework.ts**: Core testing framework containing:
  - `LevelTestRunner`: Main class that orchestrates the test execution
  - `TestCaseGenerator`: Generates test cases with different configurations
  - `runSingleTest`: Runs a single test case
  - `runTestSuite`: Runs multiple test cases

### Test Configuration

- **test-configs.ts**: Contains predefined test configurations:
  - `NoExtraNoSeatTestConfigs`: Tests without extras or seat selection
  - `ExtraSeatTestConfigs`: Tests with seat selection
  - `OneWayTripTestConfigs`: Tests for one-way trips
  - `generateAllCabinConfigurations`: Creates tests for all cabin combinations

## Extending the Framework

### Adding New Test Cases

To add new test cases:

1. Define new test configuration objects in `config/test-configs.ts`
2. Add new test functions in the appropriate spec file

Example:

```typescript
// In test-configs.ts
export const CustomTestConfigs: TestCase[] = [
  {
    name: "Custom Test Case",
    description: "Description of the test case",
    flightConfig: {
      origin: ruteData.origin,
      destination: ruteData.destination,
      outboundFlightClass: CabinClass.ECONOMY,
      outboundFlightType: CabinType.LIGHT,
      returnFlightClass: CabinClass.ECONOMY,
      returnFlightType: CabinType.LIGHT,
      isOneWay: false
    },
    passengerConfig: {
      adults: [userDataADT[0]],
      children: [],
      infants: [],
      language: Language.EN,
      dayOffset: -1
    },
    paymentInfo: paymentCards[0]
  }
];

// In your spec file
test('Custom test case', async ({ browser }) => {
  await runSingleTest(browser, CustomTestConfigs[0]);
}, TEST_TIMEOUT);
```

### Adding New Page Objects

To add functionality for new pages:

1. Create a new file in the `page-objects` directory
2. Implement the necessary functions
3. Import and use these functions in the test-framework.ts file

## Troubleshooting

### Common Issues

1. **Timeouts**: Increase timeouts in TestConfig object in test-framework.ts

2. **Selector failures**: Update selectors in page objects if website UI changes

3. **API errors**: Check API endpoints and authentication in apiHelper.ts

4. **Data issues**: Update test data in userData.ts if required

### Logging

The framework uses a custom Logger class for detailed logging. Check the console output for diagnostic information.

### Retry Mechanism

The framework includes automatic retry mechanisms for both:
- Individual steps within a test (via `executeWithRetry` method)
- Entire test cases (via `maxExecutionRetries` setting)

Adjust retry counts in TestConfig object if needed.

## License

[Include license information here]
