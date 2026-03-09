-- Migration 003: Add payment_method to payment_records and package_details to delivery_requests
-- Run this in pgAdmin against your Ardi_db database

ALTER TABLE payment_records
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'telebirr'
    CHECK (payment_method IN ('telebirr', 'cbe_birr'));

ALTER TABLE delivery_requests
  ADD COLUMN IF NOT EXISTS package_details TEXT;

-- Index on payment records for fast lookup by delivery
CREATE INDEX IF NOT EXISTS idx_payment_delivery ON payment_records (delivery_request_id);
