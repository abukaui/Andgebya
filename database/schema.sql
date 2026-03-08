-- ============================================================
-- Ardi Database Schema — STEP-BY-STEP SAFE SETUP
-- ============================================================
-- HOW TO RUN THIS IN pgAdmin:
--   1. In the left panel, expand Servers → PostgreSQL → Databases
--   2. RIGHT-CLICK on "Ardi_db" → select "Query Tool"
--   3. In the Query Tool that opens, paste this entire file
--   4. Press F5 (or click the ▶ Run button)
--   5. You should see "Ardi_db schema setup complete ✅" at the bottom
-- ============================================================

-- ✅ SAFETY CHECK: Confirm you are in the correct database
-- (This will print the current database name in your results)
SELECT current_database() AS "Connected to database";

-- ============================================================
-- STEP 1: Enable Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PostGIS (required for GPS/location features)
-- If this fails, right-click your DB in pgAdmin → "Query Tool" and run:
--   CREATE EXTENSION postgis;
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- STEP 2: Create Enums (Safe — won't fail if they already exist)
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'merchant', 'courier', 'admin');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'user_role enum already exists, skipping.';
END $$;

DO $$ BEGIN
  CREATE TYPE delivery_status AS ENUM ('pending', 'matched', 'picked_up', 'in_transit', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'delivery_status enum already exists, skipping.';
END $$;

DO $$ BEGIN
  CREATE TYPE kyc_status AS ENUM ('none', 'pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'kyc_status enum already exists, skipping.';
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('held_in_escrow', 'released', 'refunded');
EXCEPTION WHEN duplicate_object THEN
  RAISE NOTICE 'payment_status enum already exists, skipping.';
END $$;

-- ============================================================
-- STEP 3: Create Tables
-- ============================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         TEXT UNIQUE NOT NULL,
    phone_number  TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name     TEXT NOT NULL,
    role          user_role NOT NULL,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Courier Profiles (Courier-Bond™ + Fayda ID + GPS)
CREATE TABLE IF NOT EXISTS courier_profiles (
    user_id          UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    fayda_id         TEXT UNIQUE,
    bond_amount      DECIMAL(10, 2) DEFAULT 0.00 CHECK (bond_amount >= 0),
    kyc_status       kyc_status DEFAULT 'none',
    is_verified      BOOLEAN DEFAULT FALSE,
    is_available     BOOLEAN DEFAULT FALSE,
    current_location GEOGRAPHY(POINT, 4326),
    last_active      TIMESTAMP WITH TIME ZONE,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shops
CREATE TABLE IF NOT EXISTS shops (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id   UUID REFERENCES users(id) ON DELETE SET NULL,
    name       TEXT NOT NULL,
    address    TEXT NOT NULL,
    location   GEOGRAPHY(POINT, 4326),
    rating     DECIMAL(2, 1) DEFAULT 5.0,
    is_active  BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id      UUID REFERENCES shops(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    description  TEXT,
    price        DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category     TEXT DEFAULT 'Food',  -- 'Food' or 'Other'
    image_url    TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Delivery Requests
CREATE TABLE IF NOT EXISTS delivery_requests (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    shop_id          UUID REFERENCES shops(id) ON DELETE SET NULL,
    courier_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    pickup_location  GEOGRAPHY(POINT, 4326) NOT NULL,
    dropoff_location GEOGRAPHY(POINT, 4326) NOT NULL,
    status           delivery_status DEFAULT 'pending',
    total_amount     DECIMAL(10, 2) NOT NULL,
    delivery_fee     DECIMAL(10, 2) NOT NULL,
    platform_fee     DECIMAL(10, 2) NOT NULL,
    matched_at       TIMESTAMP WITH TIME ZONE,
    picked_up_at     TIMESTAMP WITH TIME ZONE,
    delivered_at     TIMESTAMP WITH TIME ZONE,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment Records (Escrow Audit)
CREATE TABLE IF NOT EXISTS payment_records (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_request_id UUID REFERENCES delivery_requests(id) ON DELETE SET NULL,
    transaction_id      TEXT UNIQUE NOT NULL,
    total_paid          DECIMAL(10, 2) NOT NULL,
    merchant_share      DECIMAL(10, 2) NOT NULL,
    courier_share       DECIMAL(10, 2) NOT NULL,
    platform_fee        DECIMAL(10, 2) NOT NULL,
    status              payment_status DEFAULT 'held_in_escrow',
    metadata            JSONB,
    created_at          TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- STEP 4: Performance Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_email           ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_phone           ON users (phone_number);
CREATE INDEX IF NOT EXISTS idx_courier_geography     ON courier_profiles USING GIST (current_location);
CREATE INDEX IF NOT EXISTS idx_courier_online        ON courier_profiles USING GIST (current_location) WHERE is_available = TRUE;
CREATE INDEX IF NOT EXISTS idx_courier_last_active   ON courier_profiles (last_active DESC) WHERE is_available = TRUE;
CREATE INDEX IF NOT EXISTS idx_delivery_status       ON delivery_requests (status);
CREATE INDEX IF NOT EXISTS idx_delivery_courier      ON delivery_requests (courier_id) WHERE courier_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shop_location         ON shops USING GIST (location);

-- ============================================================
-- STEP 5: Verify tables were created
-- ============================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

SELECT 'Ardi_db schema setup complete ✅' AS message;
