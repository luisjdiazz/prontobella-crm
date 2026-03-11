const clientsQ = require('../queries/clients.queries');
const { normalizePhone, isValidPhone, generateVipCode } = require('../utils/validators');

exports.getAll = async (req, res, next) => {
  try {
    const { search, limit, offset } = req.query;
    const [data, countResult] = await Promise.all([
      clientsQ.findAll(search, Number(limit) || 50, Number(offset) || 0),
      clientsQ.count(search),
    ]);
    res.json({
      clients: data.rows,
      total: parseInt(countResult.rows[0].count),
    });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const result = await clientsQ.findById(req.params.id);
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.search = async (req, res, next) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ error: 'Teléfono requerido para búsqueda' });
    }
    const normalizedPhone = normalizePhone(phone);
    const result = await clientsQ.findByPhone(normalizedPhone);
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, phone, email, birthday, source } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Nombre y teléfono son requeridos' });
    }
    const normalizedPhone = normalizePhone(phone);
    if (!isValidPhone(normalizedPhone)) {
      return res.status(400).json({ error: 'Número de teléfono inválido' });
    }
    const vipCode = generateVipCode();
    const result = await clientsQ.create({
      name,
      phone: normalizedPhone,
      email,
      birthday,
      vip_code: vipCode,
      source: source || 'cashier',
    });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Este teléfono ya está registrado' });
    }
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const result = await clientsQ.update(req.params.id, req.body);
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await clientsQ.remove(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
