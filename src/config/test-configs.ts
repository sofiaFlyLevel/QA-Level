/**
 * Configuraciones para Tests de Reserva de Vuelos
 */

import { 
    userDataADT, 
    userDataCHD, 
    userDataINL, 
    CabinClass, 
    CabinType, 
    paymentCards,
    Language
  } from '../fixtures/userData';
  import { ruteData } from '../fixtures/ruteData';
  import { TestCase } from '../utils/test-framework';
  
  /**
   * Configuraciones para los tests de vuelo sin asiento y sin extras
   */
  export const NoExtraNoSeatTestConfigs: TestCase[] = [
    // Test 1: 1 adulto, Economy Light
    {
      name: "1. Compra 1 adulto - Economy Light - sin asistencia",
      description: "Reserva básica para un adulto en clase Economy Light",
      flightConfig: {
        origin: ruteData.origin,
        destination: ruteData.destination,
        outboundFlightClass: CabinClass.ECONOMY,
        outboundFlightType: CabinType.LIGHT,
        returnFlightClass: CabinClass.ECONOMY,
        returnFlightType: CabinType.LIGHT,
        isOneWay: true
      },
      passengerConfig: {
        adults: [userDataADT[0]],
        children: [],
        infants: [],
        language: Language.EN,
        dayOffset: -1
      },
      paymentInfo: paymentCards[0]
    },
    // Test 2: 2 adultos diferentes, Economy Light
    {
      name: "2. Compra 2 adultos (Diferentes) - Economy Light",
      description: "Reserva para dos adultos diferentes en clase Economy Light",
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
        adults: [userDataADT[1], userDataADT[2]],
        children: [],
        infants: [],
        language: Language.EN,
        dayOffset: -1
      },
      paymentInfo: paymentCards[0]
    },
    // Test 3: 2 adultos con asistencia completa
    {
      name: "3. Compra 2 adultos (Diferentes) - Economy Light - Con asistencia TODAS",
      description: "Reserva para dos adultos con todos los tipos de asistencia",
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
        adults: [userDataADT[4], userDataADT[5]],
        children: [],
        infants: [],
        language: Language.EN,
        dayOffset: -1
      },
      paymentInfo: paymentCards[0]
    },
    // Test 4: 1 adulto + 1 niño
    {
      name: "4. Compra 1 adulto - 1 niño - Economy Light - sin asistencia",
      description: "Reserva para un adulto y un niño sin asistencia",
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
        children: [userDataCHD[1]],
        infants: [],
        language: Language.EN,
        dayOffset: -1
      },
      paymentInfo: paymentCards[0]
    },
    // Test 5: 1 adulto + 1 niño con asistencia
    {
      name: "5. Compra 1 adulto - 1 niño - Economy Light - con asistencia",
      description: "Reserva para un adulto y un niño con asistencia",
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
        children: [userDataCHD[2]],
        infants: [],
        language: Language.EN,
        dayOffset: -1
      },
      paymentInfo: paymentCards[0]
    },
    // Test 6: 1 adulto + 3 niños
    {
      name: "6. Compra 1 adulto - 3 niños - Economy Light - con asistencia",
      description: "Reserva para un adulto y tres niños con asistencia",
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
        children: [userDataCHD[3], userDataCHD[4], userDataCHD[5]],
        infants: [],
        language: Language.EN,
        dayOffset: -1
      },
      paymentInfo: paymentCards[0]
    },
    // Test 7: 1 adulto + 1 infante
    {
      name: "7. Compra 1 adulto - 1 infante - Economy Light",
      description: "Reserva para un adulto y un infante",
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
        infants: [userDataINL[1]],
        language: Language.EN,
        dayOffset: -1
      },
      paymentInfo: paymentCards[0]
    },
    // Test 8: Economy Light
    {
      name: "8. Compra 1 adulto - Economy Light",
      description: "Reserva con clase Economy Light",
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
    },
    // Test 9: Economy Comfort
    {
      name: "9. Compra 1 adulto - Economy Comfort",
      description: "Reserva con clase Economy Comfort",
      flightConfig: {
        origin: ruteData.origin,
        destination: ruteData.destination,
        outboundFlightClass: CabinClass.ECONOMY,
        outboundFlightType: CabinType.COMFORT,
        returnFlightClass: CabinClass.ECONOMY,
        returnFlightType: CabinType.COMFORT,
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
    },
    // Test 10: Economy Extra
    {
      name: "10. Compra 1 adulto - Economy Extra",
      description: "Reserva con clase Economy Extra",
      flightConfig: {
        origin: ruteData.origin,
        destination: ruteData.destination,
        outboundFlightClass: CabinClass.ECONOMY,
        outboundFlightType: CabinType.EXTRA,
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
    },
    // Test 11: Premium Light
    {
      name: "11. Compra 1 adulto - Premium Light",
      description: "Reserva con clase Premium Light",
      flightConfig: {
        origin: ruteData.origin,
        destination: ruteData.destination,
        outboundFlightClass: CabinClass.PREMIUM,
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
    },
    // Test 12: Premium Light - Economy Comfort
    {
      name: "12. Compra 1 adulto - Premium Light - Economy Comfort",
      description: "Reserva con clase Premium Light ida y Economy Comfort vuelta",
      flightConfig: {
        origin: ruteData.origin,
        destination: ruteData.destination,
        outboundFlightClass: CabinClass.PREMIUM,
        outboundFlightType: CabinType.LIGHT,
        returnFlightClass: CabinClass.ECONOMY,
        returnFlightType: CabinType.COMFORT,
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
    },
    // Test 13: Premium Comfort - Economy Extra
    {
      name: "13. Compra 1 adulto - Premium Comfort - Economy Extra",
      description: "Reserva con clase Premium Comfort ida y Economy Extra vuelta",
      flightConfig: {
        origin: ruteData.origin,
        destination: ruteData.destination,
        outboundFlightClass: CabinClass.PREMIUM,
        outboundFlightType: CabinType.COMFORT,
        returnFlightClass: CabinClass.ECONOMY,
        returnFlightType: CabinType.EXTRA,
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
    },
    // Test 14: Premium Extra
    {
      name: "14. Compra 1 adulto - Premium Extra",
      description: "Reserva con clase Premium Extra",
      flightConfig: {
        origin: ruteData.origin,
        destination: ruteData.destination,
        outboundFlightClass: CabinClass.PREMIUM,
        outboundFlightType: CabinType.EXTRA,
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
  
  /**
   * Configuraciones para los tests de vuelo con asiento extra
   */
  export const ExtraSeatTestConfigs: TestCase[] = [
    // Test 1: 1 adulto, Economy Light con asiento
    {
      name: "1. Compra 1 adulto - Economy Light - con asiento - sin extras",
      description: "Reserva básica para un adulto en clase Economy Light con selección de asiento",
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
      paymentInfo: paymentCards[0],
      includeSeats: true
    },
    // Test 2: 2 adultos diferentes, Economy Light con asiento
    {
      name: "2. Compra 2 adultos (Diferentes) - Economy Light - sin asistencia - con asiento - sin extras",
      description: "Reserva para dos adultos diferentes en clase Economy Light con selección de asiento",
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
        adults: [userDataADT[1], userDataADT[2]],
        children: [],
        infants: [],
        language: Language.EN,
        dayOffset: -1
      },
      paymentInfo: paymentCards[0],
      includeSeats: true
    },
    // Test 3: 2 adultos con asistencia completa con asiento
    {
      name: "3. Compra 2 adultos (Diferentes) - Economy Light - Con asistencia TODAS - con asiento - sin extras",
      description: "Reserva para dos adultos con todos los tipos de asistencia y selección de asiento",
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
        adults: [userDataADT[4], userDataADT[5]],
        children: [],
        infants: [],
        language: Language.EN,
        dayOffset: -1
      },
      paymentInfo: paymentCards[0],
      includeSeats: true
    }
    // Puedes agregar más configuraciones según sea necesario
  ];
  
  /**
   * Configuraciones para los tests de viaje de solo ida
   */
  export const OneWayTripTestConfigs: TestCase[] = [
    // Test 1: 1 adulto, Economy Light solo ida
    {
      name: "1. 1 Adulto - Economy Light - solo ida - sin asistencia",
      description: "Reserva básica para un adulto en clase Economy Light, solo ida",
      flightConfig: {
        origin: ruteData.origin,
        destination: ruteData.destination,
        outboundFlightClass: CabinClass.ECONOMY,
        outboundFlightType: CabinType.LIGHT,
        returnFlightClass: CabinClass.ECONOMY,
        returnFlightType: CabinType.LIGHT,
        isOneWay: true
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
    // Puedes agregar más configuraciones según sea necesario
  ];
  
  /**
   * Función para generar todas las combinaciones de configuraciones de cabina
   * Esto se puede utilizar para crear pruebas exhaustivas de todas las combinaciones
   */
  export function generateAllCabinConfigurations(): TestCase[] {
    const configs: TestCase[] = [];
    const cabinClasses = [CabinClass.ECONOMY, CabinClass.PREMIUM];
    const cabinTypes = [CabinType.LIGHT, CabinType.COMFORT, CabinType.EXTRA];
    
    let index = 1;
    
    for (const outboundClass of cabinClasses) {
      for (const outboundType of cabinTypes) {
        for (const returnClass of cabinClasses) {
          for (const returnType of cabinTypes) {
            configs.push({
              name: `${index++}. 1 Adulto ${outboundClass} ${outboundType} - ${returnClass} ${returnType}`,
              description: `Reserva con cabina de ida ${outboundClass} ${outboundType} y vuelta ${returnClass} ${returnType}`,
              flightConfig: {
                origin: ruteData.origin,
                destination: ruteData.destination,
                outboundFlightClass: outboundClass,
                outboundFlightType: outboundType,
                returnFlightClass: returnClass,
                returnFlightType: returnType,
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
            });
          }
        }
      }
    }
    
    return configs;
  }