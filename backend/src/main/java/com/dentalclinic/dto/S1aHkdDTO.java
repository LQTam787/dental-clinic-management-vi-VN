package com.dentalclinic.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Complete payload for rendering or exporting the S1a-HKD revenue ledger form.
 *
 * <p>
 * Mẫu số S1a-HKD (Thông tư 152/2025/TT-BTC) structure:
 *
 * <pre>
 * ┌─ Header block ──────────────────────────────────────────────────────┐
 * │  HỘ, CÁ NHÂN KINH DOANH: businessName                              │
 * │  Địa chỉ: address            Mẫu số S1a-HKD (TT 152/2025/TT-BTC)  │
 * │  Mã số thuế: taxId                                                  │
 * │       SỔ DOANH THU BÁN HÀNG HÓA, DỊCH VỤ                          │
 * │       Địa điểm kinh doanh: businessAddress                         │
 * │       Kỳ kê khai: declarationPeriod  (e.g. "Tháng 04/2026")        │
 * │       Đơn vị tính: currencyUnit                                     │
 * ├─ Body (entries) ────────────────────────────────────────────────────┤
 * │  Cột A (date) │ Cột B (description) │ Cột 1 (amount)               │
 * │  …            │ …                   │ …                             │
 * │               │ Tổng cộng           │ totalRevenue                  │
 * ├─ Footer ────────────────────────────────────────────────────────────┤
 * │  signatureDate                                                       │
 * │  NGƯỜI ĐẠI DIỆN: ownerName                                          │
 * └──────────────────────────────────────────────────────────────────────┘
 * </pre>
 *
 * <h3>Empty-settings behaviour</h3>
 * <p>
 * When a {@code clinic_settings} field is an empty string, the backend
 * returns an empty string here. The frontend renders {@code "..........."}
 * in its place, matching the visual convention of the official blank template.
 * This class never contains {@code null} string fields.
 *
 * <h3>TNCN disclaimer</h3>
 * <p>
 * {@code tncnAmount} is an estimate based on the TNCN rate stored in
 * {@code clinic_settings} at the time of the request. It is shown in the UI
 * with a disclaimer badge but does <em>not</em> appear in the printed form
 * itself (the S1a-HKD template has no TNCN column).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class S1aHkdDTO {

    // -----------------------------------------------------------------------
    // Header block — sourced from clinic_settings
    // -----------------------------------------------------------------------

    /** "HỘ, CÁ NHÂN KINH DOANH" field; empty string if not configured. */
    private String businessName;

    /** Owner / representative name for the signature block. */
    private String ownerName;

    /** Registered address ("Địa chỉ" in the form header). */
    private String address;

    /** Tax identification number ("Mã số thuế"). */
    private String taxId;

    /**
     * Physical service location ("Địa điểm kinh doanh"); may differ from address.
     */
    private String businessAddress;

    /**
     * Declaration period label ("Kỳ kê khai").
     * Format: {@code "Tháng MM/YYYY"} — e.g. {@code "Tháng 04/2026"}.
     */
    private String declarationPeriod;

    /** Currency unit label ("Đơn vị tính"), e.g. {@code "VNĐ"}. */
    private String currencyUnit;

    // -----------------------------------------------------------------------
    // Body
    // -----------------------------------------------------------------------

    /**
     * One entry per appointment in the queried period, ordered by date ASC
     * then patient name ASC. An empty list is valid (month with no appointments).
     */
    private List<S1aHkdEntryDTO> entries;

    // -----------------------------------------------------------------------
    // Footer
    // -----------------------------------------------------------------------

    /**
     * Sum of all {@link S1aHkdEntryDTO#getAmount()} values (all appointment
     * types). Shown in the "Tổng cộng" row. Never {@code null}.
     */
    private BigDecimal totalRevenue;

    /**
     * Sum of fees for beauty-only ({@code isBeauty = true}) entries only.
     * This is the TNCN tax base. Shown as a browser-only subtotal row;
     * suppressed in {@code @media print} and excluded from Excel export.
     * Never {@code null}.
     */
    private BigDecimal taxableRevenue;

    /**
     * Estimated personal income tax: {@code taxableRevenue × tncnRate}.
     * Rounded to 2 decimal places (HALF_UP). Displayed in the UI with a
     * disclaimer; suppressed in {@code @media print} output.
     */
    private BigDecimal tncnAmount;

    /**
     * Signature date line.
     * Format: {@code "Ngày DD tháng MM năm YYYY"} — e.g.
     * {@code "Ngày 30 tháng 04 năm 2026"}.
     * Set to {@link java.time.LocalDate#now()} at generation time.
     */
    private String signatureDate;
}
