CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  role VARCHAR(40) NOT NULL DEFAULT 'manager' CHECK (role IN ('admin', 'manager', 'sales', 'viewer')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_type VARCHAR(30) NOT NULL CHECK (customer_type IN ('individual', 'company')),
  name VARCHAR(180) NOT NULL,
  company_name VARCHAR(180),
  email VARCHAR(180),
  phone VARCHAR(40),
  billing_address TEXT,
  gst_number VARCHAR(40),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS halls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(140) NOT NULL,
  code VARCHAR(40) NOT NULL UNIQUE,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  event_name VARCHAR(180) NOT NULL,
  event_date DATE NOT NULL,
  expected_guests INTEGER CHECK (expected_guests IS NULL OR expected_guests > 0),
  status VARCHAR(40) NOT NULL DEFAULT 'new',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id UUID REFERENCES enquiries(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  hall_id UUID NOT NULL REFERENCES halls(id),
  event_name VARCHAR(180) NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'tentative',
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT booking_time_valid CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS idx_halls_active ON halls(active);
CREATE INDEX IF NOT EXISTS idx_bookings_hall_time ON bookings(hall_id, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_enquiries_event_date ON enquiries(event_date);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL,
  method VARCHAR(50) NOT NULL,
  reference_number VARCHAR(120),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
