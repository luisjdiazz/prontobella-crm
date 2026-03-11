const RETOUCH_INTERVALS = {
  color_highlights: { days: 42, label: '6 semanas' },
  keratina:         { days: 90, label: '3 meses' },
  acrilico:         { days: 18, label: '2-3 semanas' },
  pestanas:         { days: 21, label: '3 semanas' },
};

const TEMPLATES = {
  welcome: {
    text: '¡Hola {{name}}! 💜 Bienvenida a ProntoBella. Gracias por visitarnos. Tu código VIP es: {{vip_code}} — úsalo para obtener 10% de descuento en tu próxima visita. ¡Te esperamos pronto! ✨',
  },
  miss_you_30d: {
    text: '¡Hola {{name}}! Hace un tiempo que no te vemos por ProntoBella 💜 Te extrañamos. Ven esta semana y recibe 15% de descuento en cualquier servicio. ¿Te agendamos? 📞',
  },
  miss_you_60d: {
    text: '{{name}}, ¡te echamos de menos! 🥺 Ha pasado mucho tiempo sin verte. Tenemos un regalo especial esperándote: 20% OFF en el servicio que quieras. Solo dinos cuándo vienes 💜',
  },
  retouch_color: {
    text: '¡Hola {{name}}! 🎨 Ya pasaron {{weeks}} semanas desde tu último color/highlights. ¿Lista para refrescar tu look? Agenda tu cita: 809-682-0069 💜',
  },
  retouch_keratina: {
    text: '¡Hola {{name}}! 🧴 Tu tratamiento de keratina ya cumplió su ciclo. Es momento de renovar para mantener tu cabello espectacular. ¿Agendamos? 809-682-0069 💜',
  },
  retouch_acrilico: {
    text: '¡Hola {{name}}! 💎 Tus uñas necesitan un relleno — ya han pasado {{weeks}} semanas. ¿Vienes esta semana? Agenda: 809-682-0069 💅',
  },
  retouch_pestanas: {
    text: '¡Hola {{name}}! 👁️ Es hora del retoque de tus pestañas — ya pasaron {{weeks}} semanas. ¿Te agendamos? 809-682-0069 ✨',
  },
  birthday: {
    text: '¡Feliz cumpleaños, {{name}}! 🎂🎉 ProntoBella te regala 20% de descuento en cualquier servicio durante esta semana. ¡Ven a celebrar con nosotras! 💜',
  },
  loyalty_5th: {
    text: '¡{{name}}, eres increíble! 🏆 Ya completaste 5 visitas en ProntoBella. Como agradecimiento, tu próximo servicio tiene 25% de descuento. ¡Gracias por confiar en nosotras! 💜',
  },
};

// Follow-up message templates — Dominican style, warm & personal
const FOLLOWUP_TEMPLATES = {
  post_visit: {
    label: 'Gracias por tu visita',
    icon: '💜',
    text: '¡Hola {{name}}! 💜 Gracias por visitarnos hoy en ProntoBella. Esperamos que te haya encantado tu servicio. ¡Nos vemos pronto, bella! ✨',
  },
  followup_15d: {
    label: 'Recordatorio 15 días',
    icon: '💌',
    text: '¡Hola {{name}}! 💌 ¿Cómo te ha ido con tu look? Ya pasaron 15 días desde tu última visita. Si necesitas un retoque o quieres consentirte, aquí estamos para ti. ¡Agenda tu cita! 809-682-0069 💜',
  },
  miss_you_30d: {
    label: 'Te extrañamos (30 días)',
    icon: '🥺',
    text: '¡{{name}}, te extrañamos! 🥺 Ya pasó un mes sin verte por ProntoBella. Tenemos un 15% de descuento esperándote en cualquier servicio. ¿Cuándo te agendamos? 📞 809-682-0069 💜',
  },
  miss_you_60d: {
    label: 'Vuelve (60 días)',
    icon: '😢',
    text: '{{name}}, ¿dónde andas? 😢 Hace 2 meses que no nos visitas y te echamos de menos. Te tenemos un regalo: 20% OFF en lo que tú quieras. Solo escríbenos y te agendamos. ¡Te esperamos! 💜✨',
  },
  birthday: {
    label: 'Feliz cumpleaños',
    icon: '🎂',
    text: '¡Feliz cumpleaños, {{name}}! 🎂🎉 Todo el equipo de ProntoBella te desea un día increíble. Tu regalo: 20% de descuento esta semana en cualquier servicio. ¡Ven a celebrar con nosotras! 💜',
  },
  retouch: {
    label: 'Retoque pendiente',
    icon: '💅',
    text: '¡Hola {{name}}! 💅 Ya es hora de tu retoque de {{procedure}}. No dejes que se pierda tu look. ¿Te agendamos esta semana? 📞 809-682-0069 💜',
  },
  loyalty: {
    label: 'Cliente fiel',
    icon: '🏆',
    text: '¡{{name}}, eres una de nuestras clientas estrella! 🏆 Con {{visits}} visitas, te ganaste 25% de descuento en tu próximo servicio. ¡Gracias por confiar en ProntoBella! 💜',
  },
  custom: {
    label: 'Mensaje personalizado',
    icon: '✏️',
    text: '¡Hola {{name}}! ',
  },
};

module.exports = { RETOUCH_INTERVALS, TEMPLATES, FOLLOWUP_TEMPLATES };
