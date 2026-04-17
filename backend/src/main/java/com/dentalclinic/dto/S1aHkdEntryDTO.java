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
 * (format: {@code "Dịch vụ nha khoa — [tên bệnh nhân]"})</li>
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
     * Always {@code "Dịch vụ nha khoa — <patientName>"} per the confirmed
     * per-appointment granularity decision (03/04/2026).
     */
    private String description;

    /**
     * Cột 1 — fee amount.
     * {@code COALESCE(appointments.fee, 0)}; never {@code null}.
     * Formatting (Vietnamese locale thousands separator) is the frontend's
     * responsibility.
     */
    private BigDecimal amount;
}
