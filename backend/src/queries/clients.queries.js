const { query } = require('../config/db');

exports.findAll = (search, limit = 50, offset = 0) => {
  if (search) {
    return query(
      `SELECT *, (SELECT COUNT(*) FROM visits WHERE client_id = clients.id) AS visit_count
       FROM clients WHERE name ILIKE $1 OR phone ILIKE $1
       ORDER BY name LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );
  }
  return query(
    `SELECT *, (SELECT COUNT(*) FROM visits WHERE client_id = clients.id) AS visit_count
     FROM clients ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
};

exports.count = (search) => {
  if (search) {
    return query(
      'SELECT COUNT(*) FROM clients WHERE name ILIKE $1 OR phone ILIKE $1',
      [`%${search}%`]
    );
  }
  return query('SELECT COUNT(*) FROM clients');
};

exports.findById = (id) =>
  query(
    `SELECT c.*, (SELECT COUNT(*) FROM visits WHERE client_id = c.id) AS visit_count,
     (SELECT MAX(visited_at) FROM visits WHERE client_id = c.id) AS last_visit
     FROM clients c WHERE c.id = $1`,
    [id]
  );

exports.findByPhone = (phone) =>
  query(
    `SELECT c.*, (SELECT COUNT(*) FROM visits WHERE client_id = c.id) AS visit_count,
     (SELECT MAX(visited_at) FROM visits WHERE client_id = c.id) AS last_visit
     FROM clients c WHERE c.phone = $1`,
    [phone]
  );

exports.create = ({ name, phone, email, birthday, source, accepts_promos }) =>
  query(
    `INSERT INTO clients (name, phone, email, birthday, source, accepts_promos)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, phone, email || null, birthday || null, source || 'manual', accepts_promos || false]
  );

exports.update = (id, { name, phone, email, birthday, source }) =>
  query(
    `UPDATE clients SET
     name = COALESCE($1, name), phone = COALESCE($2, phone),
     email = COALESCE($3, email), birthday = COALESCE($4, birthday),
     source = COALESCE($5, source),
     updated_at = NOW()
     WHERE id = $6 RETURNING *`,
    [name, phone, email, birthday, source, id]
  );

exports.remove = (id) =>
  query('DELETE FROM clients WHERE id = $1', [id]);
