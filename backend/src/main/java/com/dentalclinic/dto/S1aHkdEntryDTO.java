package com.dentalclinic.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One line-item row in the S1a-HKD revenue ledger.
 *
 * <p>
 * Maps directly to the three-column body of Mẫu số S1a-HKD
 * (TT 152/2025/TT-BTC):
 * <ul>
 * <li><strong>Cột A — Ngày tháng:</strong> {@code entryDate}</li>
 * <li><strong>Cột B — Diễn giải:</strong> {@code description}
 * (format: {@code "Dịch vụ nha khoa - [tên bệnh nhân]"} or
 * {@code "Dịch vụ nha khoa - [tên bệnh nhân] - [điều trị]"})</li>
 * <li><strong>Cột 1 — Số tiền:</strong> {@code amount}
 * ({@code COALESCE(appointments.fee, 0)} — never null)</li>
 * </ul>
 *
 * <p>
 * One instance is created per appointment in the queried period.
 * Appointments with a NULL fee appear with {@code amount = 0}, not omitted.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class S1aHkdEntryDTO {

    /** Cột A — date of the appointment (dd/MM/yyyy on the printed form). */
    private LocalDate entryDate;

    /**
     * Cột B — narrative description.
     * Format: {@code "Dịch vụ nha khoa - <patientName>"} when treatment is
     * blank, or {@code "Dịch vụ nha khoa - <patientName> - <treatment>"}
     * when treatment has a value. Uses regular hyphens (U+002D) only.
     */
    private String description;

    /**
     * Cột 1 — fee amount.
     * {@code COALESCE(appointments.fee, 0)}; never {@code null}.
     * Formatting (Vietnamese locale thousands separator) is the frontend's
     * responsibility.
     */
    private BigDecimal amount;

    /**
     * Whether this appointment is a beauty/cosmetic service ({@code true})
     * or a dental treatment service ({@code false}).
     * Used by the frontend for browser-only visual distinction (badge, row
     * highlight). Must NOT appear in print/PDF or Excel output.
     */
    private Boolean isBeauty;
}
