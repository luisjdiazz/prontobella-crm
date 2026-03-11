-- ProntoBella CRM — Database Schema
-- Run: psql -U postgres -f backend/sql/001_schema.sql

CREATE DATABASE prontobella;
\c prontobella;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- USERS (salon staff)
-- ==========================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    email           TEXT UNIQUE,
    password_hash   TEXT,
    role            TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('owner', 'cashier', 'staff')),
    pin             TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- CLIENTS
-- ==========================================
CREATE TABLE clients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    phone           TEXT NOT NULL UNIQUE,
    email           TEXT,
    birthday        TEXT,                    -- format: DD/MM
    vip_code        TEXT,
    source          TEXT DEFAULT 'qr' CHECK (source IN ('qr', 'cashier', 'manual')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- VISITS
-- ==========================================
CREATE TABLE visits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    visited_at      TIMESTAMPTZ DEFAULT NOW(),
    notes           TEXT,
    created_by      TEXT DEFAULT 'cashier' CHECK (created_by IN ('qr', 'cashier')),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- SPECIAL PROCEDURES
-- ==========================================
CREATE TABLE special_procedures (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    visit_id        UUID REFERENCES visits(id) ON DELETE SET NULL,
    procedure_type  TEXT NOT NULL CHECK (procedure_type IN ('color_highlights', 'keratina', 'acrilico', 'pestanas')),
    performed_at    TIMESTAMPTZ DEFAULT NOW(),
    next_retouch    TIMESTAMPTZ,
    reminder_sent   BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- AUTOMATION LOG
-- ==========================================
CREATE TABLE automation_log (
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

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_visits_client_id ON visits(client_id);
CREATE INDEX idx_visits_visited_at ON visits(visited_at);
CREATE INDEX idx_procedures_client_id ON special_procedures(client_id);
CREATE INDEX idx_procedures_next_retouch ON special_procedures(next_retouch);
CREATE INDEX idx_automation_status ON automation_log(status, scheduled_for);
CREATE INDEX idx_automation_client_id ON automation_log(client_id);
