const clientsQ = require('../queries/clients.queries');
const visitsQ = require('../queries/visits.queries');
const { normalizePhone, isValidPhone } = require('../utils/validators');

exports.checkin = async (req, res, next) => {
  try {
    const { name, phone, email, accepts_promos } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Nombre y teléfono son requeridos' });
    }

    const normalizedPhone = normalizePhone(phone);
    if (!isValidPhone(normalizedPhone)) {
      return res.status(400).json({ error: 'Número de teléfono inválido. Formato: 809XXXXXXX' });
    }

    // Check if client already exists
    let clientResult = await clientsQ.findByPhone(normalizedPhone);
    let client = clientResult.rows[0];
    let isNew = false;

    if (!client) {
      const created = await clientsQ.create({
        name,
        phone: normalizedPhone,
        email,
        source: 'qr',
        accepts_promos: accepts_promos || false,
      });
      client = created.rows[0];
      isNew = true;
    }

    // Log the visit
    const visit = await visitsQ.create({
      client_id: client.id,
      notes: 'Check-in via QR',
      created_by: 'qr',
    });

    res.status(201).json({
      message: isNew
        ? `Bienvenida ${client.name}! Tu visita ha sido registrada.`
        : `Hola de nuevo ${client.name}! Tu visita ha sido registrada.`,
      client: {
        id: client.id,
        name: client.name,
        is_new: isNew,
      },
      visit: visit.rows[0],
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Este teléfono ya está registrado' });
    }
    next(err);
  }
};
