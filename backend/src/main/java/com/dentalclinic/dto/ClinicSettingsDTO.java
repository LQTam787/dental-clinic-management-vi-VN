package com.dentalclinic.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data transfer object for {@link com.dentalclinic.model.ClinicSettings}.
 *
 * <p>All string fields are nullable to support the "empty settings" state:
 * the S1a-HKD ledger view renders placeholder dots when a field is blank.
 * Only {@code currencyUnit} and {@code tncnRate} have non-null defaults
 * matching the database defaults.
 *
 * <p>Used by:
 * <ul>
 *   <li>{@code GET /api/settings} — returns the current settings</li>
 *   <li>{@code PUT /api/settings} — accepts updated settings</li>
 * </ul>
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClinicSettingsDTO {

    private Long id;

    /** "HỘ, CÁ NHÂN KINH DOANH" on the S1a-HKD form. */
    private String businessName;

    /** Representative / owner name (signature block). */
    private String ownerName;

    /** Registered address. */
    private String address;

    /** Tax identification number ("Mã số thuế"). */
    private String taxId;

    /** Physical service location ("Địa điểm kinh doanh"). */
    private String businessAddress;

    /** Currency unit label, e.g. "VNĐ". */
    private String currencyUnit;

    /**
     * TNCN rate as a decimal fraction (0.0200 = 2 %).
     * Validated at the service layer to be in [0.0000, 1.0000].
     */
    private BigDecimal tncnRate;
}
