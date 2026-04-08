package com.dentalclinic.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Clinic business identity and tax configuration.
 *
 * <p>Always contains exactly one row. The service layer creates a default row
 * on first access if none is present (the Flyway migration also seeds one, so
 * in practice the row always exists when the application starts).
 *
 * <p>Field mapping to the S1a-HKD form (TT 152/2025/TT-BTC):
 * <ul>
 *   <li>{@code businessName}    → "HỘ, CÁ NHÂN KINH DOANH"</li>
 *   <li>{@code address}         → "Địa chỉ" in the header block</li>
 *   <li>{@code taxId}           → "Mã số thuế"</li>
 *   <li>{@code businessAddress} → "Địa điểm kinh doanh" sub-header</li>
 *   <li>{@code currencyUnit}    → "Đơn vị tính" sub-header</li>
 *   <li>{@code ownerName}       → signature block label</li>
 *   <li>{@code tncnRate}        → used to calculate thuế TNCN ước tính</li>
 * </ul>
 */
@Entity
@Table(name = "clinic_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClinicSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** "HỘ, CÁ NHÂN KINH DOANH" — printed on the S1a-HKD header. */
    @Column(name = "business_name")
    private String businessName;

    /** Full name of the representative / owner (used in signature block). */
    @Column(name = "owner_name")
    private String ownerName;

    /** Registered address of the business. */
    @Column(name = "address")
    private String address;

    /** "Mã số thuế" — tax identification number. */
    @Column(name = "tax_id")
    private String taxId;

    /**
     * "Địa điểm kinh doanh" — may differ from the registered address.
     * This is the physical location where services are rendered.
     */
    @Column(name = "business_address")
    private String businessAddress;

    /**
     * "Đơn vị tính" on the S1a-HKD sub-header.
     * Defaults to "VNĐ".
     */
    @Column(name = "currency_unit", nullable = false)
    private String currencyUnit = "VNĐ";

    /**
     * Personal income tax (thuế TNCN) rate as a decimal fraction.
     * {@code 0.0200} represents 2 %.
     *
     * <p>The service layer validates that this value is in [0.0000, 1.0000].
     * The rate is locked into each {@link MonthlyRevenue} row at finalization
     * time, so changing it here does not alter historical records.
     *
     * <p><strong>Important:</strong> the clinic owner must confirm the
     * applicable rate with the local Chi cục Thuế before using this system
     * for official tax filings.
     */
    @Column(name = "tncn_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal tncnRate = new BigDecimal("0.0200");

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
