-- =============================================================
-- V2__revenue_tables.sql
-- Revenue & Tax Subsystem — Session 1
-- Reference: Thông tư 152/2025/TT-BTC, Mẫu số S1a-HKD
-- =============================================================

-- ---------------------------------------------------------------
-- Table: clinic_settings
-- Stores the clinic's business identity and tax configuration.
-- A single row is always present (created on first application
-- start via the seed INSERT below).
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clinic_settings (
    id               BIGSERIAL    PRIMARY KEY,
    business_name    VARCHAR(255),
    owner_name       VARCHAR(255),
    address          VARCHAR(500),
    tax_id           VARCHAR(50),
    -- Địa điểm kinh doanh — may differ from registered address
    business_address VARCHAR(500),
    -- Đơn vị tính in the S1a-HKD header (e.g. "VNĐ")
    currency_unit    VARCHAR(20)  NOT NULL DEFAULT 'VNĐ',
    -- Tỷ lệ thuế TNCN as a decimal fraction (0.0200 = 2 %)
    -- Must be in [0.0000, 1.0000]; validated at the service layer as well.
    tncn_rate        NUMERIC(5,4) NOT NULL DEFAULT 0.0200,
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed exactly one default row so the service layer never has to
-- deal with a missing row on first access.
INSERT INTO clinic_settings
    (business_name, owner_name, address, tax_id,
     business_address, currency_unit, tncn_rate)
SELECT '', '', '', '', '', 'VNĐ', 0.0200
WHERE NOT EXISTS (SELECT 1 FROM clinic_settings);

-- ---------------------------------------------------------------
-- Table: monthly_revenue
-- One row per finalized calendar month.
-- The UNIQUE constraint on (year, month) makes finalization
-- idempotent at the database level.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monthly_revenue (
    id                 BIGSERIAL     PRIMARY KEY,
    year               INTEGER       NOT NULL,
    month              INTEGER       NOT NULL,
    -- Snapshot of SUM(COALESCE(appointments.fee, 0)) for the period
    total_revenue      NUMERIC(15,2) NOT NULL DEFAULT 0,
    -- Count of appointments in the period
    appointment_count  INTEGER       NOT NULL DEFAULT 0,
    -- total_revenue × tncn_rate at the moment of finalization.
    -- Rate is locked here; changing the rate later does NOT
    -- alter previously finalized months.
    tncn_amount        NUMERIC(15,2) NOT NULL DEFAULT 0,
    -- FALSE = draft / preview; TRUE = officially finalized
    finalized          BOOLEAN       NOT NULL DEFAULT FALSE,
    -- Timestamp of finalization (NULL while finalized = FALSE)
    finalized_at       TIMESTAMP,
    -- Optional manual diễn giải for the period
    notes              VARCHAR(1000),
    created_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_month     CHECK (month BETWEEN 1 AND 12),
    CONSTRAINT uq_year_month UNIQUE (year, month)
);
