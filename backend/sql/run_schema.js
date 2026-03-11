// Run schema on Supabase (no psql needed)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const schema = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    email           TEXT UNIQUE,
    password_hash   TEXT,
    role            TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('owner', 'cashier', 'staff')),
    pin             TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    phone           TEXT NOT NULL UNIQUE,
    email           TEXT,
    birthday        TEXT,
    vip_code        TEXT,
    source          TEXT DEFAULT 'qr' CHECK (source IN ('qr', 'cashier', 'manual')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    visited_at      TIMESTAMPTZ DEFAULT NOW(),
    notes           TEXT,
    created_by      TEXT DEFAULT 'cashier' CHECK (created_by IN ('qr', 'cashier')),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS special_procedures (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    visit_id        UUID REFERENCES visits(id) ON DELETE SET NULL,
    procedure_type  TEXT NOT NULL CHECK (procedure_type IN ('color_highlights', 'keratina', 'acrilico', 'pestanas')),
    performed_at    TIMESTAMPTZ DEFAULT NOW(),
    next_retouch    TIMESTAMPTZ,
    reminder_sent   BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS automation_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    type            TEXT NOT NULL CHECK (type IN ('welcome', 'miss_you_30d', 'miss_you_60d', 'retouch', 'birthday', 'loyalty_5th')),
    channel         TEXT DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'email', 'manual')),
    status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
    message_text    TEXT,
    scheduled_for   TIMESTAMPTZ,
    sent_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_visits_client_id ON visits(client_id);
CREATE INDEX IF NOT EXISTS idx_visits_visited_at ON visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_procedures_client_id ON special_procedures(client_id);
CREATE INDEX IF NOT EXISTS idx_procedures_next_retouch ON special_procedures(next_retouch);
CREATE INDEX IF NOT EXISTS idx_automation_status ON automation_log(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_automation_client_id ON automation_log(client_id);
`;

async function run() {
  const client = await pool.connect();
  try {
    console.log('Conectando a Supabase...');
    await client.query(schema);
    console.log('Schema creado exitosamente!');
    console.log('Tablas: users, clients, visits, special_procedures, automation_log');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
