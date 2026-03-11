const { query } = require('../config/db');

exports.findByClient = (clientId) =>
  query(
    `SELECT v.*,
     (SELECT json_agg(json_build_object('id', sp.id, 'procedure_type', sp.procedure_type, 'next_retouch', sp.next_retouch))
      FROM special_procedures sp WHERE sp.visit_id = v.id) AS procedures
     FROM visits v WHERE v.client_id = $1 ORDER BY v.visited_at DESC`,
    [clientId]
  );

exports.findToday = () =>
  query(
    `SELECT v.*, c.name AS client_name, c.phone AS client_phone
     FROM visits v JOIN clients c ON v.client_id = c.id
     WHERE v.visited_at::date = CURRENT_DATE
     ORDER BY v.visited_at DESC`
  );

exports.create = ({ client_id, notes, created_by }) =>
  query(
    `INSERT INTO visits (client_id, notes, created_by)
     VALUES ($1, $2, $3) RETURNING *`,
    [client_id, notes || null, created_by || 'cashier']
  );

exports.countByClient = (clientId) =>
  query('SELECT COUNT(*) FROM visits WHERE client_id = $1', [clientId]);
