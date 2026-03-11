const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usersQ = require('../queries/users.queries');

const sign = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' });

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }
    const result = await usersQ.findByEmail(email);
    const user = result.rows[0];
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    const token = sign({ id: user.id, role: user.role, name: user.name });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
};

exports.pinLogin = async (req, res, next) => {
  try {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({ error: 'PIN requerido' });
    }
    const result = await usersQ.findByPin(pin);
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'PIN incorrecto' });
    }
    const token = sign({ id: user.id, role: user.role, name: user.name });
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
};
