const { query } = require('../config/db');

exports.findAll = (status) => {
  if (status) {
    return query(
      `SELECT al.*, c.name AS client_name, c.phone AS client_phone
       FROM automation_log al JOIN clients c ON al.client_id = c.id
       WHERE al.status = $1 ORDER BY al.created_at DESC`,
      [status]
    );
  }
  return query(
    `SELECT al.*, c.name AS client_name, c.phone AS client_phone
     FROM automation_log al JOIN clients c ON al.client_id = c.id
     ORDER BY al.created_at DESC LIMIT 100`
  );
};

exports.findPending = () =>
  query(
    `SELECT al.*, c.name AS client_name, c.phone AS client_phone
     FROM automation_log al JOIN clients c ON al.client_id = c.id
     WHERE al.status = 'pending'
     ORDER BY al.scheduled_for ASC`
  );

exports.markSent = (id) =>
  query(
    `UPDATE automation_log SET status = 'sent', sent_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id]
  );

exports.create = ({ client_id, type, message_text, scheduled_for }) =>
  query(
    `INSERT INTO automation_log (client_id, type, message_text, scheduled_for)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [client_id, type, message_text, scheduled_for || new Date()]
  );
