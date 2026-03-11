const { query } = require('../config/db');
const { TEMPLATES } = require('../utils/constants');

function renderTemplate(template, vars) {
  let text = template;
  for (const [key, value] of Object.entries(vars)) {
    text = text.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return text;
}

async function queueWelcomeMessages() {
  const result = await query(`
    INSERT INTO automation_log (client_id, type, message_text, scheduled_for)
    SELECT c.id, 'welcome',
      '¡Hola ' || c.name || '! 💜 Bienvenida a ProntoBella. Tu código VIP es: ' || COALESCE(c.vip_code, 'N/A') || ' — úsalo para obtener 10% de descuento.',
      NOW()
    FROM clients c
    WHERE c.created_at::date = CURRENT_DATE
    AND c.id NOT IN (SELECT client_id FROM automation_log WHERE type = 'welcome')
    RETURNING id
  `);
  return { welcome: result.rowCount };
}

async function queueMissYou30d() {
  const result = await query(`
    INSERT INTO automation_log (client_id, type, message_text, scheduled_for)
    SELECT c.id, 'miss_you_30d',
      '¡Hola ' || c.name || '! Hace un tiempo que no te vemos por ProntoBella 💜 Te extrañamos. Ven esta semana y recibe 15% de descuento.',
      NOW()
    FROM clients c
    WHERE c.id IN (
      SELECT client_id FROM visits GROUP BY client_id
      HAVING MAX(visited_at) BETWEEN NOW() - INTERVAL '31 days' AND NOW() - INTERVAL '29 days'
    )
    AND c.id NOT IN (
      SELECT client_id FROM automation_log WHERE type = 'miss_you_30d' AND created_at > NOW() - INTERVAL '25 days'
    )
    RETURNING id
  `);
  return { miss_you_30d: result.rowCount };
}

async function queueMissYou60d() {
  const result = await query(`
    INSERT INTO automation_log (client_id, type, message_text, scheduled_for)
    SELECT c.id, 'miss_you_60d',
      c.name || ', ¡te echamos de menos! 🥺 Tenemos un regalo especial: 20% OFF en el servicio que quieras. Solo dinos cuándo vienes 💜',
      NOW()
    FROM clients c
    WHERE c.id IN (
      SELECT client_id FROM visits GROUP BY client_id
      HAVING MAX(visited_at) BETWEEN NOW() - INTERVAL '61 days' AND NOW() - INTERVAL '59 days'
    )
    AND c.id NOT IN (
      SELECT client_id FROM automation_log WHERE type = 'miss_you_60d' AND created_at > NOW() - INTERVAL '55 days'
    )
    RETURNING id
  `);
  return { miss_you_60d: result.rowCount };
}

async function queueRetouchReminders() {
  const result = await query(`
    INSERT INTO automation_log (client_id, type, message_text, scheduled_for)
    SELECT sp.client_id, 'retouch',
      '¡Hola ' || c.name || '! Tu retoque de ' || sp.procedure_type || ' está programado pronto. Confirma tu cita: 809-682-0069 💜',
      sp.next_retouch - INTERVAL '3 days'
    FROM special_procedures sp
    JOIN clients c ON sp.client_id = c.id
    WHERE sp.next_retouch BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
    AND sp.reminder_sent = FALSE
    AND sp.id NOT IN (
      SELECT DISTINCT al.client_id FROM automation_log al
      WHERE al.type = 'retouch' AND al.created_at > NOW() - INTERVAL '7 days'
      AND al.client_id = sp.client_id
    )
    RETURNING id
  `);
  return { retouch: result.rowCount };
}

async function queueBirthdayMessages() {
  const result = await query(`
    INSERT INTO automation_log (client_id, type, message_text, scheduled_for)
    SELECT c.id, 'birthday',
      '¡Feliz cumpleaños, ' || c.name || '! 🎂🎉 ProntoBella te regala 20% de descuento en cualquier servicio esta semana.',
      NOW()
    FROM clients c
    WHERE c.birthday IS NOT NULL
    AND c.birthday = to_char(CURRENT_DATE, 'DD/MM')
    AND c.id NOT IN (
      SELECT client_id FROM automation_log
      WHERE type = 'birthday' AND created_at > NOW() - INTERVAL '360 days'
    )
    RETURNING id
  `);
  return { birthday: result.rowCount };
}

async function queueLoyalty5th() {
  const result = await query(`
    INSERT INTO automation_log (client_id, type, message_text, scheduled_for)
    SELECT c.id, 'loyalty_5th',
      '¡' || c.name || ', eres increíble! 🏆 Ya completaste 5 visitas. Tu próximo servicio tiene 25% de descuento.',
      NOW()
    FROM clients c
    WHERE (SELECT COUNT(*) FROM visits WHERE client_id = c.id) = 5
    AND c.id NOT IN (SELECT client_id FROM automation_log WHERE type = 'loyalty_5th')
    RETURNING id
  `);
  return { loyalty_5th: result.rowCount };
}

exports.evaluateAndQueue = async () => {
  const results = await Promise.all([
    queueWelcomeMessages(),
    queueMissYou30d(),
    queueMissYou60d(),
    queueRetouchReminders(),
    queueBirthdayMessages(),
    queueLoyalty5th(),
  ]);

  const summary = Object.assign({}, ...results);
  console.log('Automatizaciones evaluadas:', summary);
  return summary;
};
