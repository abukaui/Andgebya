-- Ardi Core Database Schema
-- Focus: Geospatial tracking, RBAC, Fayda KYC, and Courier-Bond™ Escrow

-- Enable PostGIS extension for geospatial features
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Enums
CREATE TYPE user_role AS ENUM ('customer', 'merchant', 'courier', 'admin');
CREATE TYPE delivery_status AS ENUM ('pending', 'matched', 'picked_up', 'in_transit', 'delivered', 'cancelled');
CREATE TYPE kyc_status AS ENUM ('none', 'pending', 'approved', 'rejected');
CREATE TYPE payment_status AS ENUM ('held_in_escrow', 'released', 'refunded');

-- 2. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Courier Profiles (The Courier-Bond™ System)
CREATE TABLE courier_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    fayda_id TEXT UNIQUE, -- Ethiopian National ID
    bond_amount DECIMAL(10, 2) DEFAULT 0.00 CHECK (bond_amount >= 0),
    kyc_status kyc_status DEFAULT 'none',
    is_verified BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT FALSE,
    current_location GEOGRAPHY(POINT, 4326),
    last_active TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Shops Table
CREATE TABLE shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326),
    rating DECIMAL(2, 1) DEFAULT 5.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Delivery Requests (Matching & Tracking)
CREATE TABLE delivery_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
    courier_id UUID REFERENCES users(id) ON DELETE SET NULL,
    pickup_location GEOGRAPHY(POINT, 4326) NOT NULL,
    dropoff_location GEOGRAPHY(POINT, 4326) NOT NULL,
    status delivery_status DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL, -- Total customer paid
    delivery_fee DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL, -- Calculated as 5% or fixed
    matched_at TIMESTAMP WITH TIME ZONE,
    picked_up_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Payment Records (Escrow Split Audit)
CREATE TABLE payment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_request_id UUID REFERENCES delivery_requests(id) ON DELETE SET NULL,
    transaction_id TEXT UNIQUE NOT NULL, -- External provider ID
    total_paid DECIMAL(10, 2) NOT NULL,
    merchant_share DECIMAL(10, 2) NOT NULL,
    courier_share DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) NOT NULL,
    status payment_status DEFAULT 'held_in_escrow',
    metadata JSONB, -- For Chapa/PayPal specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Indexes for Performance
CREATE INDEX idx_courier_geography ON courier_profiles USING GIST (current_location);
CREATE INDEX idx_delivery_status ON delivery_requests (status);
CREATE INDEX idx_delivery_courier ON delivery_requests (courier_id) WHERE courier_id IS NOT NULL;
CREATE INDEX idx_shop_location ON shops USING GIST (location);

-- Update triggers for updated_at (optional but good practice)
-- CREATE OR REPLACE FUNCTION update_updated_at_column() ...
