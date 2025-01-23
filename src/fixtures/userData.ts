export const Language = {
  ES: 'ES',
  CA: 'CA',
  EN: 'EN',
};

// Definir el enum de monedas
const Money = {
  USD: 'USD',
  EUR: 'EUR',
};

export const LenguageChoose = Language.EN; 
export const MoneyChosee = Money.USD; 

export const rangeStartMonthsExport = 4; 
export const rangeEndMonthsExport = 5

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
    dateOfBirth: '15',
    language: 'Afghanistan',
    nationality: 'Afghanistan',
    phone: '+93 791234567', // Prefijo de Afganistán
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    assistance: [],
    dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  { //[1]
    name: 'Prueba',
    surname: 'Hola',
    dateOfBirth: '25',
    language: 'Afghanistan',
    nationality: 'Afghanistan',
    phone: '+93 791234567', // Prefijo de Afganistán
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    assistance: [],
    dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  { //[2]
    name: 'Sofía',
    surname: 'Pérez',
    dateOfBirth: '34',
    language: 'Afghanistan',
    nationality: 'Afghanistan',
    phone: '+93 791234567', // Prefijo de Afganistán
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    assistance: [],
    dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  { //[3]
    name: 'Juana',
    surname: 'Gonzalez',
    dateOfBirth: '65',
    language: 'Algeria',
    nationality: 'Algeria',
    phone: '+213 65234567', // Prefijo de Argelia
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    assistance: ['I need assistance at all times'],
    dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  { //[4]
    name: 'Carlos',
    surname: 'López',
    dateOfBirth: '19',
    language: 'Spain',
    nationality: 'Spain',
    phone: '+34 912345678', // Prefijo de España
    email: 'sofiainkoova@gmail.com',
    gender: 'Male',
    assistance: ['Hearing difficulty', 'I need assistance at all times'],
    dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  { //[5]
    name: 'Ana',
    surname: 'Martínez',
    dateOfBirth: '48',
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
    ],
    dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  { //[6]
    name: 'Luis',
    surname: 'Hernández',
    dateOfBirth: '56',
    language: 'Andorra',
    nationality: 'Andorra',
    phone: '+376 355555', // Prefijo de Andorra
    email: 'sofiainkoova@gmail.com',
    gender: 'Male',
    assistance: ['Visual difficulty'],
    dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  { //[7]
    name: 'Elena',
    surname: 'Torres',
    dateOfBirth: '12',
    language: 'Belarus',
    nationality: 'Belarus',
    phone: '+375 292345678', // Prefijo de Bielorrusia
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    assistance: [
      'I can climb and descend stairs, and move around the plane with some difficulty',
      'I need assistance at all times'
    ],
    dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  { //[8]
    name: 'Pablo',
    surname: 'Ramírez',
    dateOfBirth: '13',
    language: 'French Guiana',
    nationality: 'French Guiana',
    phone: '+594 69420678', // Prefijo de Guayana Francesa
    email: 'sofiainkoova@gmail.com',
    gender: 'Male',
    assistance: [
      'Intellectual disability',
      'Help with climbing and descending stairs. I can move around the plane without difficulty'
    ],
    dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  { //[9]
    name: 'Sofía M.',
    surname: 'Morales',
    dateOfBirth: '400',
    language: 'Belarus',
    nationality: 'Belarus',
    phone: '+375 447890123', // Prefijo de Bielorrusia
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    assistance: [
      'Help with climbing and descending stairs. I can move around the plane without difficulty'
    ],
    dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  { //[10]
    name: 'Javier',
    surname: 'Cruz',
    dateOfBirth: '70',
    language: 'Spain',
    nationality: 'Spain',
    phone: '+34 620123456', // Prefijo de España
    email: 'sofiainkoova@gmail.com',
    gender: 'Male',
    assistance: [
      'Visual difficulty',
      'Help with climbing and descending stairs. I can move around the plane without difficulty'
    ],
    dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  { //[11]
    name: 'Clara',
    surname: 'Navarro',
    dateOfBirth: '87',
    language: 'Spain',
    nationality: 'Spain',
    phone: '+34 917654321', // Prefijo de España
    email: 'sofiainkoova@gmail.com',
    gender: 'Female',
    assistance: [
      'Intellectual disability',
      'I can climb and descend stairs, and move around the plane with some difficulty'
    ],
    dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  { //[12]
    name: 'Raúl',
    surname: 'Vega',
    dateOfBirth: '91',
    language: 'Spain',
    nationality: 'Spain',
    phone: '+34 611234567', // Prefijo de España
    email: 'sofiainkoova@gmail.com',
    gender: 'Male',
    assistance: [
      'Hearing difficulty',
      'Visual difficulty',
      'I need assistance at all times'
    ],
    dayOffset: (Math.floor(Math.random() * 731) - 365)
  }
];



// usuarios infantil
export const userDataINL = [
  { //[0]
    name: 'Sofia',
    surname: 'Gomez',
    dateOfBirth: '0', // 7 days old
    language: 'Argentina',
    nationality: 'Argentina',
    phone: '+54 9123456789', // Argentina prefix
    email: 'sofiagomez@gmail.com',
    gender: 'Female'
  },
  { //[1]
    name: 'Mateó',
    surname: 'Rodríguez',
    dateOfBirth: '0', // 12 months old
    language: 'Chile',
    nationality: 'Chile',
    phone: '+56 912345678', // Chile prefix
    email: 'mateorodriguez@gmail.com',
    gender: 'Male'
  },
  {
    name: 'Valentina',
    surname: 'Fernández',
    dateOfBirth: '1', // 5 months old
    language: 'Mexico',
    nationality: 'Mexico',
    phone: '+52 9987654321', // Mexico prefix
    email: 'valentina.fernandez@gmail.com',
    gender: 'Female'
  },
  {
    name: 'Emilio',
    surname: 'Cruz',
    dateOfBirth: '1', // 19 months old
    language: 'Spain',
    nationality: 'Spain',
    phone: '+34 912345678', // Spain prefix
    email: 'emiliocruz@gmail.com',
    gender: 'Male'
  },
  {
    name: 'Lucía',
    surname: 'Pérez',
    dateOfBirth: '1', // 11 months old
    language: 'Peru',
    nationality: 'Peru',
    phone: '+51 912345678', // Peru prefix
    email: 'luciaperez@gmail.com',
    gender: 'Female'
  },
  {
    name: 'Martín',
    surname: 'López',
    dateOfBirth: '2', // 21 months old
    language: 'Colombia',
    nationality: 'Colombia',
    phone: '+57 3001234567', // Colombia prefix
    email: 'martin.lopez@gmail.com',
    gender: 'Male'
  },
  {
    name: 'Camila',
    surname: 'Sánchez',
    dateOfBirth: '2', // 14 months old
    language: 'Guatemala',
    nationality: 'Guatemala',
    phone: '+502 91234567', // Guatemala prefix
    email: 'camila.sanchez@gmail.com',
    gender: 'Female'
  },
  {
    name: 'Andrés',
    surname: 'Morales',
    dateOfBirth: '0', // 3 months old
    language: 'Venezuela',
    nationality: 'Venezuela',
    phone: '+58 4123456789', // Venezuela prefix
    email: 'andres.morales@gmail.com',
    gender: 'Male'
  },
  {
    name: 'Julieta',
    surname: 'Navarro',
    dateOfBirth: '0', // 13 months old
    language: 'Uruguay',
    nationality: 'Uruguay',
    phone: '+598 91234567', // Uruguay prefix
    email: 'julietanavarro@gmail.com',
    gender: 'Female'
  },
  {
    name: 'Diego',
    surname: 'Martínez',
    dateOfBirth: '0', // 6 months old
    language: 'Ecuador',
    nationality: 'Ecuador',
    phone: '+593 912345678', // Ecuador prefix
    email: 'diego.martinez@gmail.com',
    gender: 'Male'
  }
];

// Asignación de dayOffset después de crear los objetos
userDataINL.forEach(user => {
  user.dayOffset = (user.dateOfBirth === '0') ? Math.floor(Math.random() * 731) : Math.floor(Math.random() * 731) - 365;
});




//usuarios niños
export const userDataCHD = [
  { //[0]
    name: 'Lucas',
    surname: 'Fernandez',
    dateOfBirth: '3', // 9 years old
    language: 'Spain',
    nationality: 'Spain',
    phone: '+34 612345678', // Spain prefix
    email: 'lucasfernandez@gmail.com',
    gender: 'Male',
    assistance: [
      // 'Hearing difficulty',
      // 'I can climb and descend stairs, and move around the plane with some difficulty'
    ],
   dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  { //[1]
    name: 'Valería M.',
    surname: 'García',
    dateOfBirth: '10', // 6 years old
    language: 'Mexico',
    nationality: 'Mexico',
    phone: '+52 123456789', // Mexico prefix
    email: 'valeriagarcia@gmail.com',
    gender: 'Female',
    assistance: [], // No assistance
   dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  { //[2]
    name: 'Mateo',
    surname: 'Ramírez',
    dateOfBirth: '11', // 11 years old
    language: 'Argentina',
    nationality: 'Argentina',
    phone: '+54 91123456789', // Argentina prefix
    email: 'mateoramirez@gmail.com',
    gender: 'Male',
    assistance: [
      'Visual difficulty'
    ],
   dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  { //[3]
    name: 'Daniel',
    surname: 'Cruz',
    dateOfBirth: '10', // 3 years old
    language: 'Peru',
    nationality: 'Peru',
    phone: '+51 986543210', // Peru prefix
    email: 'danielcruz@gmail.com',
    gender: 'Male',
    assistance: [
      'Help with climbing and descending stairs. I can move around the plane without difficulty'
    ],
   dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  { 
    name: 'Isabella',
    surname: 'Sánchez',
    dateOfBirth: '4', // 8 years old
    language: 'Colombia',
    nationality: 'Colombia',
    phone: '+57 3001234567', // Colombia prefix
    email: 'isabellasanchez@gmail.com',
    gender: 'Female',
    assistance: [], // No assistance
   dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  {
    name: 'Diego',
    surname: 'Martínez',
    dateOfBirth: '8', // 5 years old
    language: 'Chile',
    nationality: 'Chile',
    phone: '+56 932345678', // Chile prefix
    email: 'diego.martinez@gmail.com',
    gender: 'Male',
    assistance: [], // No assistance
   dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  {
    name: 'Emma',
    surname: 'López',
    dateOfBirth: '6', // 4 years old
    language: 'Spain',
    nationality: 'Spain',
    phone: '+34 678901234', // Spain prefix
    email: 'emmalopez@gmail.com',
    gender: 'Female',
    assistance: [
      'I can climb and descend stairs, and move around the plane with some difficulty'
    ],
   dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  {
    name: 'Mía',
    surname: 'Morales',
    dateOfBirth: '5', // 7 years old
    language: 'Uruguay',
    nationality: 'Uruguay',
    phone: '+598 91234567', // Uruguay prefix
    email: 'miamorales@gmail.com',
    gender: 'Female',
    assistance: [], // No assistance
   dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  {
    name: 'Hugo',
    surname: 'Torres',
    dateOfBirth: '3', // 2 years old
    language: 'Guatemala',
    nationality: 'Guatemala',
    phone: '+502 12345678', // Guatemala prefix
    email: 'hugotorres@gmail.com',
    gender: 'Male',
    assistance: [], // No assistance
   dayOffset: (Math.floor(Math.random() * 731) - 365)
  },
  {
    name: 'Olivia',
    surname: 'Navarro',
    dateOfBirth: '9', // 1 year old
    language: 'Venezuela',
    nationality: 'Venezuela',
    phone: '+58 4241234567', // Venezuela prefix
    email: 'olivianavarro@gmail.com',
    gender: 'Female',
    assistance: [], // No assistance
   dayOffset: (Math.floor(Math.random() * 731) - 365)
  }
];





export const promocodeData = {
  code: "FLYDAYSLEVEL24"
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