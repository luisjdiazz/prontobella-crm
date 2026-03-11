const { query } = require('../config/db');

exports.findByClient = (clientId) =>
  query(
    `SELECT sp.*, c.name AS client_name
     FROM special_procedures sp JOIN clients c ON sp.client_id = c.id
     WHERE sp.client_id = $1 ORDER BY sp.performed_at DESC`,
    [clientId]
  );

exports.findUpcoming = (days = 7) =>
  query(
    `SELECT sp.*, c.name AS client_name, c.phone AS client_phone
     FROM special_procedures sp JOIN clients c ON sp.client_id = c.id
     WHERE sp.next_retouch BETWEEN NOW() AND NOW() + $1 * INTERVAL '1 day'
     AND sp.reminder_sent = FALSE
     ORDER BY sp.next_retouch ASC`,
    [days]
  );

exports.create = ({ client_id, visit_id, procedure_type, next_retouch }) =>
  query(
    `INSERT INTO special_procedures (client_id, visit_id, procedure_type, next_retouch)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [client_id, visit_id || null, procedure_type, next_retouch]
  );

exports.markReminderSent = (id) =>
  query(
    'UPDATE special_procedures SET reminder_sent = TRUE WHERE id = $1 RETURNING *',
    [id]
  );
