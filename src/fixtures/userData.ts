enum CabinType {
  LIGHT = 'Light',
  COMFORT = 'Comfort',
  EXTRA = 'Extra',
}

enum CabinClass {
  ECONOMY = 'Economy',
  PREMIUM = 'Premium',
}

// userData.ts
export const userDataADT = [
  {
    name: 'Juan',
    surname: 'Perez',
    dateOfBirth: '1990-05-15',
    language: 'Afghanistan',
    nationality : 'Algeria',
    phone: '+93 791234567', // Prefijo de Afganistán
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    cabinData: {
      outboundClassFlight: CabinClass.ECONOMY,
      outboundTypeFlight: CabinType.LIGHT,
      returnClassFlight: CabinClass.ECONOMY,
      returnTypeFlight: CabinType.LIGHT,
    }
  },
  {
    name: 'Prueba',
    surname: 'Hola',
    dateOfBirth: '1990-05-15',
    language: 'Afghanistan',
    nationality : 'Spain',
    phone: '+93 791234567', // Prefijo de Afganistán
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    cabinData: {
      outboundClassFlight: CabinClass.ECONOMY,
      outboundTypeFlight: CabinType.LIGHT,
      returnClassFlight: CabinClass.ECONOMY,
      returnTypeFlight: CabinType.LIGHT,
    }
  },
  {
    name: 'Juan',
    surname: 'Pérez',
    dateOfBirth: '1990-05-15',
    language: 'Afghanistan',
    phone: '+93 791234567', // Prefijo de Afganistán
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    cabinData: {
      outboundClassFlight: CabinClass.ECONOMY,
      outboundTypeFlight: CabinType.LIGHT,
      returnClassFlight: CabinClass.ECONOMY,
      returnTypeFlight: CabinType.LIGHT,
    }
  },
  {
    name: 'Juana',
    surname: 'González',
    dateOfBirth: '1985-08-22',
    language: 'Algeria',
    phone: '+213 65234567', // Prefijo de Argelia
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    cabinData: {
      outboundClassFlight: CabinClass.ECONOMY,
      outboundTypeFlight: CabinType.LIGHT,
      returnClassFlight: CabinClass.ECONOMY,
      returnTypeFlight: CabinType.LIGHT,
    }
  },
  {
    name: 'Carlos',
    surname: 'López',
    dateOfBirth: '1992-01-10',
    language: 'Spain',
    phone: '+34 912345678', // Prefijo de España
    email: 'sofiainkoova@gmail.com',
    gender: 'Male',
    cabinData: {
      outboundClassFlight: CabinClass.ECONOMY,
      outboundTypeFlight: CabinType.LIGHT,
      returnClassFlight: CabinClass.ECONOMY,
      returnTypeFlight: CabinType.LIGHT,
    }
  },
  {
    name: 'Ana',
    surname: 'Martínez',
    dateOfBirth: '1988-04-17',
    language: 'Spain',
    phone: '+34 678901234', // Prefijo de España
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    cabinData: {
      outboundClassFlight: CabinClass.ECONOMY,
      outboundTypeFlight: CabinType.LIGHT,
      returnClassFlight: CabinClass.ECONOMY,
      returnTypeFlight: CabinType.LIGHT,
    }
  },
  {
    name: 'Luis',
    surname: 'Hernández',
    dateOfBirth: '1995-09-30',
    language: 'Andorra',
    phone: '+376 355555', // Prefijo de Andorra
    email: 'sofiainkoova@gmail.com',
    gender: 'Male',
    cabinData: {
      outboundClassFlight: CabinClass.ECONOMY,
      outboundTypeFlight: CabinType.LIGHT,
      returnClassFlight: CabinClass.ECONOMY,
      returnTypeFlight: CabinType.LIGHT,
    }
  },
  {
    name: 'Elena',
    surname: 'Torres',
    dateOfBirth: '1993-06-12',
    language: 'Belarus',
    phone: '+375 292345678', // Prefijo de Bielorrusia
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    cabinData: {
      outboundClassFlight: CabinClass.ECONOMY,
      outboundTypeFlight: CabinType.LIGHT,
      returnClassFlight: CabinClass.ECONOMY,
      returnTypeFlight: CabinType.LIGHT,
    }
  },
  {
    name: 'Pablo',
    surname: 'Ramírez',
    dateOfBirth: '1989-02-28',
    language: 'French Guiana',
    phone: '+594 69420678', // Prefijo de Guayana Francesa
    email: 'sofiainkoova@gmail.com',
    gender: 'Male',
    cabinData: {
      outboundClassFlight: CabinClass.ECONOMY,
      outboundTypeFlight: CabinType.LIGHT,
      returnClassFlight: CabinClass.ECONOMY,
      returnTypeFlight: CabinType.LIGHT,
    }
  },
  {
    name: 'Sofía M.',
    surname: 'Morales',
    dateOfBirth: '1996-07-25',
    language: 'Belarus',
    phone: '+375 447890123', // Prefijo de Bielorrusia
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    cabinData: {
      outboundClassFlight: CabinClass.ECONOMY,
      outboundTypeFlight: CabinType.LIGHT,
      returnClassFlight: CabinClass.ECONOMY,
      returnTypeFlight: CabinType.LIGHT,
    }
  },
  {
    name: 'Javier',
    surname: 'Cruz',
    dateOfBirth: '1994-11-15',
    language: 'Spain',
    phone: '+34 620123456', // Prefijo de España
    email: 'sofiainkoova@gmail.com',
    gender: 'Male',
    cabinData: {
      outboundClassFlight: CabinClass.ECONOMY,
      outboundTypeFlight: CabinType.LIGHT,
      returnClassFlight: CabinClass.ECONOMY,
      returnTypeFlight: CabinType.LIGHT,
    }
  },
  {
    name: 'Clara',
    surname: 'Navarro',
    dateOfBirth: '1987-03-09',
    language: 'Spain',
    phone: '+34 917654321', // Prefijo de España
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    cabinData: {
      outboundClassFlight: CabinClass.ECONOMY,
      outboundTypeFlight: CabinType.LIGHT,
      returnClassFlight: CabinClass.ECONOMY,
      returnTypeFlight: CabinType.LIGHT,
    }
  },
  {
    name: 'Raúl',
    surname: 'Vega',
    dateOfBirth: '1991-12-05',
    language: 'Spain',
    phone: '+34 611234567', // Prefijo de España
    email: 'sofiainkoova@gmail.com',
    gender: 'Male',
    cabinData: {
      outboundClassFlight: CabinClass.ECONOMY,
      outboundTypeFlight: CabinType.LIGHT,
      returnClassFlight: CabinClass.ECONOMY,
      returnTypeFlight: CabinType.LIGHT,
    }
  },
];


export const userDataINL = [
  {
    nombre: 'Sofía',
    apellido: 'Gómez',
    fecha_nacimiento: '2023-11-28', // 7 días de edad
    idioma: 'Argentina',
  },
  {
    nombre: 'Mateo',
    apellido: 'Rodríguez',
    fecha_nacimiento: '2022-12-05', // 12 meses (1 año de edad)
    idioma: 'Chile',
  },
  {
    nombre: 'Valentina',
    apellido: 'Fernández',
    fecha_nacimiento: '2023-07-14', // 5 meses
    idioma: 'México',
  },
  {
    nombre: 'Emilio',
    apellido: 'Cruz',
    fecha_nacimiento: '2022-05-15', // 19 meses
    idioma: 'España',
  },
  {
    nombre: 'Lucía',
    apellido: 'Pérez',
    fecha_nacimiento: '2023-01-20', // 11 meses
    idioma: 'Perú',
  },
  {
    nombre: 'Martín',
    apellido: 'López',
    fecha_nacimiento: '2022-03-05', // 21 meses
    idioma: 'Colombia',
  },
  {
    nombre: 'Camila',
    apellido: 'Sánchez',
    fecha_nacimiento: '2022-10-01', // 14 meses
    idioma: 'Guatemala',
  },
  {
    nombre: 'Andrés',
    apellido: 'Morales',
    fecha_nacimiento: '2023-08-25', // 3 meses
    idioma: 'Venezuela',
  },
  {
    nombre: 'Julieta',
    apellido: 'Navarro',
    fecha_nacimiento: '2022-11-12', // 13 meses
    idioma: 'Uruguay',
  },
  {
    nombre: 'Diego',
    apellido: 'Martínez',
    fecha_nacimiento: '2023-06-01', // 6 meses
    idioma: 'Ecuador',
  },
];

//añadir la informacion adicional 
export const userDataCHD = [
  {
    nombre: 'Lucas',
    apellido: 'Fernandez',
    fecha_nacimiento: '2015-03-22', // Tiene 9 años
    idioma: 'España',
  },
  {
    nombre: 'Valeria',
    apellido: 'García',
    fecha_nacimiento: '2018-07-15', // Tiene 6 años
    idioma: 'México',
  },
  {
    nombre: 'Mateo',
    apellido: 'Ramírez',
    fecha_nacimiento: '2013-11-05', // Tiene 11 años
    idioma: 'Argentina',
  },
  {
    nombre: 'Isabella',
    apellido: 'Sánchez',
    fecha_nacimiento: '2016-02-18', // Tiene 8 años
    idioma: 'Colombia',
  },
  {
    nombre: 'Diego',
    apellido: 'Martínez',
    fecha_nacimiento: '2019-09-12', // Tiene 5 años
    idioma: 'Chile',
  },
  {
    nombre: 'Emma',
    apellido: 'López',
    fecha_nacimiento: '2020-04-27', // Tiene 4 años
    idioma: 'España',
  },
  {
    nombre: 'Daniel',
    apellido: 'Cruz',
    fecha_nacimiento: '2021-06-14', // Tiene 3 años
    idioma: 'Perú',
  },
  {
    nombre: 'Mía',
    apellido: 'Morales',
    fecha_nacimiento: '2017-10-08', // Tiene 7 años
    idioma: 'Uruguay',
  },
  {
    nombre: 'Hugo',
    apellido: 'Torres',
    fecha_nacimiento: '2022-01-05', // Tiene 2 años
    idioma: 'Guatemala',
  },
  {
    nombre: 'Olivia',
    apellido: 'Navarro',
    fecha_nacimiento: '2023-08-19', // Tiene 1 año
    idioma: 'Venezuela',
  },
];



export const promocodeData = {
  code: "FLYDAYSLEVEL24"
}
  
  
export const ticketData = {
  ADT: 2, 
  CHD: 1, 
  INL: 1, 
}; 

export const Lenguage = {
  CA: true,
  ES: true,
  EN: true
}
export const Money = {
  USD: true, 
  EUR: true
}

export const paymentCards = [
  {
    cardNumber: '2222 4000 7000 0005',
    expiryDate: '03/30',
    cvc: '737'
  },
  {
    cardNumber: '5577 0000 5577 0004',
    expiryDate: '03/30',
    cvc: '737'
  }
];