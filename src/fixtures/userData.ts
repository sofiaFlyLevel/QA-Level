export enum CabinType {
  LIGHT = 'Light',
  COMFORT = 'Comfort',
  EXTRA = 'Extra',
}

export enum CabinClass {
  ECONOMY = 'Economy',
  PREMIUM = 'Premium',
}

// usuarios Adult 
export const userDataADT = [
  { //[0]
    name: 'Juan',
    surname: 'Perez',
    dateOfBirth: '1990-05-15',
    language: 'Afghanistan',
    nationality: 'Afghanistan',
    phone: '+93 791234567', // Prefijo de Afganistán
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    assistance: []
  },
  { //[1]
    name: 'Prueba',
    surname: 'Hola',
    dateOfBirth: '1990-05-15',
    language: 'Afghanistan',
    nationality: 'Afghanistan',
    phone: '+93 791234567', // Prefijo de Afganistán
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    assistance: []
  },
  { //[2]
    name: 'Sofía',
    surname: 'Pérez',
    dateOfBirth: '1990-05-15',
    language: 'Afghanistan',
    nationality: 'Afghanistan',
    phone: '+93 791234567', // Prefijo de Afganistán
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    assistance: [] // Sin opciones de asistencia
  },
  { //[3]
    name: 'Juana',
    surname: 'Gonzalez',
    dateOfBirth: '1985-08-22',
    language: 'Algeria',
    nationality: 'Algeria',
    phone: '+213 65234567', // Prefijo de Argelia
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    assistance: [
      'I need assistance at all times'
    ]
  },
  { //[4]
    name: 'Carlos',
    surname: 'López',
    dateOfBirth: '1992-01-10',
    language: 'Spain',
    nationality: 'Spain',
    phone: '+34 912345678', // Prefijo de España
    email: 'sofiainkoova@gmail.com',
    gender: 'Male',
    assistance: [
      'Hearing difficulty',
      'I need assistance at all times'
    ]
  },
  { //[5]
    name: 'Ana',
    surname: 'Martínez',
    dateOfBirth: '1988-04-17',
    language: 'Spain',
    nationality: 'Spain',
    phone: '+34 678901234', // Prefijo de España
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    assistance: [
      'Hearing difficulty',
      'Visual difficulty',
      'Intellectual disability',
      'Help with climbing and descending stairs. I can move around the plane without difficulty',
      'I can climb and descend stairs, and move around the plane with some difficulty',
      'I need assistance at all times'
    ] 
  },
  { //[6]
    name: 'Luis',
    surname: 'Hernández',
    dateOfBirth: '1995-09-30',
    language: 'Andorra',
    nationality: 'Andorra',
    phone: '+376 355555', // Prefijo de Andorra
    email: 'sofiainkoova@gmail.com',
    gender: 'Male',
    assistance: [
      'Visual difficulty'
    ]
  },
  { //[7]
    name: 'Elena',
    surname: 'Torres',
    dateOfBirth: '1993-06-12',
    language: 'Belarus',
    nationality: 'Belarus',
    phone: '+375 292345678', // Prefijo de Bielorrusia
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    assistance: [
      'I can climb and descend stairs, and move around the plane with some difficulty',
      'I need assistance at all times'
    ]
  },
  { //[8]
    name: 'Pablo',
    surname: 'Ramírez',
    dateOfBirth: '1989-02-28',
    language: 'French Guiana',
    nationality: 'French Guiana',
    phone: '+594 69420678', // Prefijo de Guayana Francesa
    email: 'sofiainkoova@gmail.com',
    gender: 'Male',
    assistance: [
      'Intellectual disability',
      'Help with climbing and descending stairs. I can move around the plane without difficulty'
    ]
  },
  { //[9]
    name: 'Sofía M.',
    surname: 'Morales',
    dateOfBirth: '1996-07-25',
    language: 'Belarus',
    nationality: 'Belarus',
    phone: '+375 447890123', // Prefijo de Bielorrusia
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    assistance: [
      'Help with climbing and descending stairs. I can move around the plane without difficulty'
    ]
  },
  { //[10]
    name: 'Javier',
    surname: 'Cruz',
    dateOfBirth: '1994-11-15',
    language: 'Spain',
    nationality: 'Spain',
    phone: '+34 620123456', // Prefijo de España
    email: 'sofiainkoova@gmail.com',
    gender: 'Male',
    assistance: [
      'Visual difficulty',
      'Help with climbing and descending stairs. I can move around the plane without difficulty'
    ]
  },
  { //[11]
    name: 'Clara',
    surname: 'Navarro',
    dateOfBirth: '1987-03-09',
    language: 'Spain',
    nationality: 'Spain',
    phone: '+34 917654321', // Prefijo de España
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    assistance: [
      'Intellectual disability',
      'I can climb and descend stairs, and move around the plane with some difficulty'
    ]
  },
  { //[12]
    name: 'Raúl',
    surname: 'Vega',
    dateOfBirth: '1991-12-05',
    language: 'Spain',
    nationality: 'Spain',
    phone: '+34 611234567', // Prefijo de España
    email: 'sofiainkoova@gmail.com',
    gender: 'Male',
    assistance: [
      'Hearing difficulty',
      'Visual difficulty',
      'I need assistance at all times'
    ]
  },
];


// usuarios infantil
export const userDataINL = [
  { //[0]
    name: 'Sofia',
    surname: 'Gomez',
    dateOfBirth: '2023-11-28', // 7 days old
    language: 'Argentina',
    nationality: 'Argentina',
    phone: '+54 9123456789', // Argentina prefix
    email: 'sofiagomez@gmail.com',
    gender: 'Female'
  },
  { //[1]
    name: 'Mateó',
    surname: 'Rodríguez',
    dateOfBirth: '2022-12-05', // 12 months old
    language: 'Chile',
    nationality: 'Chile',
    phone: '+56 912345678', // Chile prefix
    email: 'mateorodriguez@gmail.com',
    gender: 'Male'
    
  },
  {
    name: 'Valentina',
    surname: 'Fernández',
    dateOfBirth: '2023-07-14', // 5 months old
    language: 'Mexico',
    nationality: 'Mexico',
    phone: '+52 9987654321', // Mexico prefix
    email: 'valentina.fernandez@gmail.com',
    gender: 'Female'
  },
  {
    name: 'Emilio',
    surname: 'Cruz',
    dateOfBirth: '2022-05-15', // 19 months old
    language: 'Spain',
    nationality: 'Spain',
    phone: '+34 912345678', // Spain prefix
    email: 'emiliocruz@gmail.com',
    gender: 'Male'
  },
  {
    name: 'Lucía',
    surname: 'Pérez',
    dateOfBirth: '2023-01-20', // 11 months old
    language: 'Peru',
    nationality: 'Peru',
    phone: '+51 912345678', // Peru prefix
    email: 'luciaperez@gmail.com',
    gender: 'Female'
  },
  {
    name: 'Martín',
    surname: 'López',
    dateOfBirth: '2022-03-05', // 21 months old
    language: 'Colombia',
    nationality: 'Colombia',
    phone: '+57 3001234567', // Colombia prefix
    email: 'martin.lopez@gmail.com',
    gender: 'Male'
  },
  {
    name: 'Camila',
    surname: 'Sánchez',
    dateOfBirth: '2022-10-01', // 14 months old
    language: 'Guatemala',
    nationality: 'Guatemala',
    phone: '+502 91234567', // Guatemala prefix
    email: 'camila.sanchez@gmail.com',
    gender: 'Female'
  },
  {
    name: 'Andrés',
    surname: 'Morales',
    dateOfBirth: '2023-08-25', // 3 months old
    language: 'Venezuela',
    nationality: 'Venezuela',
    phone: '+58 4123456789', // Venezuela prefix
    email: 'andres.morales@gmail.com',
    gender: 'Male'
  },
  {
    name: 'Julieta',
    surname: 'Navarro',
    dateOfBirth: '2022-11-12', // 13 months old
    language: 'Uruguay',
    nationality: 'Uruguay',
    phone: '+598 91234567', // Uruguay prefix
    email: 'julietanavarro@gmail.com',
    gender: 'Female'
  },
  {
    name: 'Diego',
    surname: 'Martínez',
    dateOfBirth: '2023-06-01', // 6 months old
    language: 'Ecuador',
    nationality: 'Ecuador',
    phone: '+593 912345678', // Ecuador prefix
    email: 'diego.martinez@gmail.com',
    gender: 'Male'
  }
];


//usuarios niños
export const userDataCHD = [
  { //[0]
    name: 'Lucas',
    surname: 'Fernandez',
    dateOfBirth: '2015-03-22', // 9 years old
    language: 'Spain',
    nationality: 'Spain',
    phone: '+34 612345678', // Spain prefix
    email: 'lucasfernandez@gmail.com',
    gender: 'Male',
    assistance: [
      // 'Hearing difficulty',
      // 'I can climb and descend stairs, and move around the plane with some difficulty'
    ]
  },
  { //[1]
    name: 'Valería M.',
    surname: 'García',
    dateOfBirth: '2018-07-15', // 6 years old
    language: 'Mexico',
    nationality: 'Mexico',
    phone: '+52 123456789', // Mexico prefix
    email: 'valeriagarcia@gmail.com',
    gender: 'Female',
    assistance: [] // No assistance
  },
  { //[2]
    name: 'Mateo',
    surname: 'Ramírez',
    dateOfBirth: '2013-11-05', // 11 years old
    language: 'Argentina',
    nationality: 'Argentina',
    phone: '+54 91123456789', // Argentina prefix
    email: 'mateoramirez@gmail.com',
    gender: 'Male',
    assistance: [
      'Visual difficulty'
    ]
  },
  {//[3]
    name: 'Daniel',
    surname: 'Cruz',
    dateOfBirth: '2021-06-14', // 3 years old
    language: 'Peru',
    nationality: 'Peru',
    phone: '+51 986543210', // Peru prefix
    email: 'danielcruz@gmail.com',
    gender: 'Male',
    assistance: [
      'Help with climbing and descending stairs. I can move around the plane without difficulty'
    ]
  },
  { 
    name: 'Isabella',
    surname: 'Sánchez',
    dateOfBirth: '2016-02-18', // 8 years old
    language: 'Colombia',
    nationality: 'Colombia',
    phone: '+57 3001234567', // Colombia prefix
    email: 'isabellasanchez@gmail.com',
    gender: 'Female',
    assistance: [] // No assistance
  },
  {
    name: 'Diego',
    surname: 'Martínez',
    dateOfBirth: '2019-09-12', // 5 years old
    language: 'Chile',
    nationality: 'Chile',
    phone: '+56 932345678', // Chile prefix
    email: 'diego.martinez@gmail.com',
    gender: 'Male',
    assistance: [] // No assistance
  },
  {
    name: 'Emma',
    surname: 'López',
    dateOfBirth: '2020-04-27', // 4 years old
    language: 'Spain',
    nationality: 'Spain',
    phone: '+34 678901234', // Spain prefix
    email: 'emmalopez@gmail.com',
    gender: 'Female',
    assistance: [
      'I can climb and descend stairs, and move around the plane with some difficulty'
    ]
  },
  
  {
    name: 'Mía',
    surname: 'Morales',
    dateOfBirth: '2017-10-08', // 7 years old
    language: 'Uruguay',
    nationality: 'Uruguay',
    phone: '+598 91234567', // Uruguay prefix
    email: 'miamorales@gmail.com',
    gender: 'Female',
    assistance: [] // No assistance
  },
  {
    name: 'Hugo',
    surname: 'Torres',
    dateOfBirth: '2022-01-05', // 2 years old
    language: 'Guatemala',
    nationality: 'Guatemala',
    phone: '+502 12345678', // Guatemala prefix
    email: 'hugotorres@gmail.com',
    gender: 'Male',
    assistance: [] // No assistance
  },
  {
    name: 'Olivia',
    surname: 'Navarro',
    dateOfBirth: '2023-08-19', // 1 year old
    language: 'Venezuela',
    nationality: 'Venezuela',
    phone: '+58 4241234567', // Venezuela prefix
    email: 'olivianavarro@gmail.com',
    gender: 'Female',
    assistance: [] // No assistance
  }
];




export const promocodeData = {
  code: "FLYDAYSLEVEL24"
}
  
  


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
    cvc: '737',
    nameOnCard: "Juan Pablo Antonio Maximiliano Alejandro Fernández de Córdoba Sánchez"
  },
  {
    cardNumber: '5577 0000 5577 0004',
    expiryDate: '03/30',
    cvc: '737',
    nameOnCard: "Sofia Martínez"
  }
];