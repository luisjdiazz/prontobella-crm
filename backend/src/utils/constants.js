const RETOUCH_INTERVALS = {
  color_highlights: { days: 42, label: '6 semanas' },
  keratina:         { days: 90, label: '3 meses' },
  acrilico:         { days: 18, label: '2-3 semanas' },
  pestanas:         { days: 21, label: '3 semanas' },
};

const TEMPLATES = {
  welcome: {
    text: 'hola {{name}}, bienvenida a prontobella. gracias por visitarnos, tu codigo vip es {{vip_code}}, con eso tienes 10% de descuento en tu proxima visita. te esperamos pronto',
  },
  miss_you_30d: {
    text: 'hola {{name}}, hace rato no te vemos por aqui y te extranamos. ven esta semana y te damos 15% de descuento en cualquier servicio. te agendamos?',
  },
  miss_you_60d: {
    text: '{{name}} hace mucho que no vienes por prontobella, te tenemos un 20% de descuento en lo que tu quieras. dinos cuando vienes y te agendamos',
  },
  retouch_color: {
    text: 'hola {{name}}, ya pasaron {{weeks}} semanas desde tu ultimo color. cuando quieras refrescar el look nos dices, te agendamos al 809-682-0069',
  },
  retouch_keratina: {
    text: 'hola {{name}}, tu keratina ya cumplio su ciclo, es buen momento para renovar y que el pelo se mantenga brutal. te agendamos? 809-682-0069',
  },
  retouch_acrilico: {
    text: 'hola {{name}}, tus unas ya necesitan relleno, ya van {{weeks}} semanas. vienes esta semana? 809-682-0069',
  },
  retouch_pestanas: {
    text: 'hola {{name}}, ya toca retoque de pestanas, pasaron {{weeks}} semanas. te agendamos? 809-682-0069',
  },
  birthday: {
    text: 'feliz cumple {{name}}! de parte de todo el equipo de prontobella te deseamos un dia super lindo. te regalamos 20% de descuento esta semana en cualquier servicio, ven a celebrar con nosotras',
  },
  loyalty_5th: {
    text: '{{name}} ya llevas 5 visitas con nosotras, eso es increible. como agradecimiento tu proximo servicio tiene 25% de descuento. gracias por confiar en prontobella',
  },
};

// Follow-up message templates — natural, human tone
const FOLLOWUP_TEMPLATES = {
  post_visit: {
    label: 'Gracias por tu visita',
    text: 'hola {{name}}, gracias por venir hoy a prontobella. esperamos que te haya encantado, nos vemos pronto',
  },
  followup_15d: {
    label: 'Recordatorio 15 dias',
    text: 'hola {{name}}, como te ha ido con tu look? ya pasaron 15 dias desde tu ultima visita. si necesitas retoque o quieres consentirte aqui estamos, 809-682-0069',
  },
  miss_you_30d: {
    label: 'Te extranamos (30 dias)',
    text: '{{name}} te extranamos, ya paso un mes sin verte por prontobella. te tenemos 15% de descuento en cualquier servicio, cuando te agendamos? 809-682-0069',
  },
  miss_you_60d: {
    label: 'Vuelve (60 dias)',
    text: '{{name}} donde andas? hace 2 meses que no vienes y te echamos de menos. te tenemos 20% de descuento en lo que tu quieras, solo escribenos y te agendamos',
  },
  birthday: {
    label: 'Feliz cumple',
    text: 'feliz cumple {{name}}! todo el equipo de prontobella te desea un dia increible. te regalamos 20% de descuento esta semana en cualquier servicio, ven a celebrar con nosotras',
  },
  retouch: {
    label: 'Retoque pendiente',
    text: 'hola {{name}}, ya toca tu retoque de {{procedure}}, no dejes que se pierda el look. te agendamos esta semana? 809-682-0069',
  },
  loyalty: {
    label: 'Cliente fiel',
    text: '{{name}} ya llevas {{visits}} visitas con nosotras, eso nos encanta. te ganaste 25% de descuento en tu proximo servicio, gracias por confiar en prontobella',
  },
  custom: {
    label: 'Mensaje personalizado',
    text: 'hola {{name}}, ',
  },
};

module.exports = { RETOUCH_INTERVALS, TEMPLATES, FOLLOWUP_TEMPLATES };
