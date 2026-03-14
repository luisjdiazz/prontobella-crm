const ExcelJS = require('exceljs');
const { query } = require('../config/db');

const HEADER_STYLE = {
  font: { bold: true, color: { argb: 'FFFFFFFF' } },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7B4FA2' } },
  alignment: { horizontal: 'center' },
};

function applyHeaderStyle(sheet) {
  sheet.getRow(1).eachCell((cell) => {
    cell.font = HEADER_STYLE.font;
    cell.fill = HEADER_STYLE.fill;
    cell.alignment = HEADER_STYLE.alignment;
  });
}

/**
 * Export clients to Excel buffer with optional filters
 */
exports.exportClients = async ({ period, minVisits, maxVisits } = {}) => {
  let dateFilter = '';
  const params = [];

  if (period === 'today') {
    dateFilter = `AND c.created_at >= CURRENT_DATE`;
  } else if (period === 'week') {
    dateFilter = `AND c.created_at >= CURRENT_DATE - INTERVAL '7 days'`;
  } else if (period === 'month') {
    dateFilter = `AND c.created_at >= CURRENT_DATE - INTERVAL '30 days'`;
  }

  let havingFilter = '';
  if (minVisits != null) {
    params.push(Number(minVisits));
    havingFilter += ` HAVING COUNT(v.id) >= $${params.length}`;
  }
  if (maxVisits != null) {
    params.push(Number(maxVisits));
    havingFilter += havingFilter
      ? ` AND COUNT(v.id) <= $${params.length}`
      : ` HAVING COUNT(v.id) <= $${params.length}`;
  }

  const sql = `
    SELECT c.id, c.name, c.phone, c.email, c.birthday, c.source,
           c.accepts_promos, c.created_at,
           COUNT(v.id)::int AS visit_count,
           MAX(v.visited_at) AS last_visit
    FROM clients c
    LEFT JOIN visits v ON v.client_id = c.id
    WHERE 1=1 ${dateFilter}
    GROUP BY c.id
    ${havingFilter}
    ORDER BY c.name
  `;

  const { rows } = await query(sql, params);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ProntoBella CRM';

  // Clients sheet
  const sheet = workbook.addWorksheet('Clientes');
  sheet.columns = [
    { header: 'Nombre', key: 'name', width: 25 },
    { header: 'Teléfono', key: 'phone', width: 15 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Cumpleaños', key: 'birthday', width: 12 },
    { header: 'Fuente', key: 'source', width: 12 },
    { header: 'Visitas', key: 'visit_count', width: 10 },
    { header: 'Última visita', key: 'last_visit', width: 18 },
    { header: 'Acepta promos', key: 'accepts_promos', width: 14 },
    { header: 'Registro', key: 'created_at', width: 18 },
  ];

  const sourceLabels = { qr: 'QR', cashier: 'Cajera', google: 'Google', manual: 'Manual' };

  rows.forEach((r) => {
    sheet.addRow({
      name: r.name,
      phone: r.phone,
      email: r.email || '',
      birthday: r.birthday || '',
      source: sourceLabels[r.source] || r.source || 'Manual',
      visit_count: r.visit_count,
      last_visit: r.last_visit ? new Date(r.last_visit).toLocaleDateString('es-DO') : 'Nunca',
      accepts_promos: r.accepts_promos ? 'Sí' : 'No',
      created_at: new Date(r.created_at).toLocaleDateString('es-DO'),
    });
  });

  applyHeaderStyle(sheet);

  const buffer = await workbook.xlsx.writeBuffer();
  return { buffer, count: rows.length };
};

/**
 * Full backup — all clients + visits + procedures
 */
exports.generateBackup = async () => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ProntoBella CRM — Backup';

  // Clients
  const { rows: clients } = await query(`
    SELECT c.*, COUNT(v.id)::int AS visit_count, MAX(v.visited_at) AS last_visit
    FROM clients c LEFT JOIN visits v ON v.client_id = c.id
    GROUP BY c.id ORDER BY c.id
  `);

  const cSheet = workbook.addWorksheet('Clientes');
  cSheet.columns = [
    { header: 'ID', key: 'id', width: 8 },
    { header: 'Nombre', key: 'name', width: 25 },
    { header: 'Teléfono', key: 'phone', width: 15 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Cumpleaños', key: 'birthday', width: 12 },
    { header: 'Fuente', key: 'source', width: 12 },
    { header: 'Acepta promos', key: 'accepts_promos', width: 14 },
    { header: 'Visitas', key: 'visit_count', width: 10 },
    { header: 'Última visita', key: 'last_visit', width: 18 },
    { header: 'Registro', key: 'created_at', width: 18 },
  ];
  clients.forEach((r) => cSheet.addRow({
    ...r,
    email: r.email || '',
    birthday: r.birthday || '',
    accepts_promos: r.accepts_promos ? 'Sí' : 'No',
    last_visit: r.last_visit ? new Date(r.last_visit).toLocaleDateString('es-DO') : '',
    created_at: new Date(r.created_at).toLocaleDateString('es-DO'),
  }));
  applyHeaderStyle(cSheet);

  // Visits
  const { rows: visits } = await query(`
    SELECT v.id, c.name AS client_name, c.phone AS client_phone,
           v.visited_at, v.created_by, v.notes
    FROM visits v JOIN clients c ON c.id = v.client_id
    ORDER BY v.visited_at DESC
  `);

  const vSheet = workbook.addWorksheet('Visitas');
  vSheet.columns = [
    { header: 'ID', key: 'id', width: 8 },
    { header: 'Cliente', key: 'client_name', width: 25 },
    { header: 'Teléfono', key: 'client_phone', width: 15 },
    { header: 'Fecha', key: 'visited_at', width: 20 },
    { header: 'Registrada por', key: 'created_by', width: 14 },
    { header: 'Notas', key: 'notes', width: 30 },
  ];
  visits.forEach((r) => vSheet.addRow({
    ...r,
    visited_at: new Date(r.visited_at).toLocaleString('es-DO'),
    notes: r.notes || '',
  }));
  applyHeaderStyle(vSheet);

  // Procedures
  const { rows: procedures } = await query(`
    SELECT sp.id, c.name AS client_name, sp.procedure_type,
           sp.performed_at, sp.next_retouch
    FROM special_procedures sp JOIN clients c ON c.id = sp.client_id
    ORDER BY sp.performed_at DESC
  `);

  const pSheet = workbook.addWorksheet('Procedimientos');
  pSheet.columns = [
    { header: 'ID', key: 'id', width: 8 },
    { header: 'Cliente', key: 'client_name', width: 25 },
    { header: 'Tipo', key: 'procedure_type', width: 20 },
    { header: 'Fecha', key: 'performed_at', width: 18 },
    { header: 'Próximo retoque', key: 'next_retouch', width: 18 },
  ];
  procedures.forEach((r) => pSheet.addRow({
    ...r,
    performed_at: new Date(r.performed_at).toLocaleDateString('es-DO'),
    next_retouch: r.next_retouch ? new Date(r.next_retouch).toLocaleDateString('es-DO') : '',
  }));
  applyHeaderStyle(pSheet);

  const buffer = await workbook.xlsx.writeBuffer();
  return { buffer, clients: clients.length, visits: visits.length, procedures: procedures.length };
};
