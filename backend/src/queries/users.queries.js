const { query } = require('../config/db');

exports.findByEmail = (email) =>
  query('SELECT * FROM users WHERE email = $1', [email]);

exports.findByPin = (pin) =>
  query('SELECT * FROM users WHERE pin = $1 AND role = $2', [pin, 'cashier']);

exports.findAll = () =>
  query('SELECT id, name, email, role, pin, created_at FROM users ORDER BY created_at');

exports.create = ({ name, email, password_hash, role, pin }) =>
  query(
    `INSERT INTO users (name, email, password_hash, role, pin)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, pin, created_at`,
    [name, email || null, password_hash || null, role || 'cashier', pin || null]
  );

exports.update = (id, { name, email, role, pin }) =>
  query(
    `UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email),
     role = COALESCE($3, role), pin = COALESCE($4, pin), updated_at = NOW()
     WHERE id = $5 RETURNING id, name, email, role, pin`,
    [name, email, role, pin, id]
  );

exports.remove = (id) =>
  query('DELETE FROM users WHERE id = $1', [id]);
