package com.dentalclinic.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data transfer object for monthly revenue data.
 *
 * <p>Returned by all revenue endpoints. Can represent either:
 * <ul>
 *   <li>A <strong>finalized</strong> month — data comes from
 *       {@link com.dentalclinic.model.MonthlyRevenue} ({@code finalized = true},
 *       {@code finalizedAt} is set).</li>
 *   <li>A <strong>live / unfinalized</strong> month — data is computed on-the-fly
 *       from the {@code appointments} table ({@code finalized = false},
 *       {@code finalizedAt} is {@code null}).</li>
 * </ul>
 *
 * <p>The {@code getAllMonthsForYear} service method always returns exactly 12
 * instances of this DTO — one per calendar month. Future months use zero
 * values and {@code finalized = false}.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyRevenueDTO {

    /** 4-digit calendar year. */
    private int year;

    /** 1-based calendar month (1 = January … 12 = December). */
    private int month;

    /**
     * Total revenue for the period — all appointments regardless of type.
     * {@code COALESCE(SUM(fee), 0)} — never {@code null}.
     */
    private BigDecimal totalRevenue;

    /** Number of appointments in the period. */
    private int appointmentCount;

    /**
     * Sum of fees for beauty-only ({@code is_beauty = true}) appointments.
     * This is the TNCN tax base; dental treatment fees are exempt.
     * Never {@code null}.
     */
    private BigDecimal taxableRevenue;

    /**
     * Personal income tax estimate:
     * {@code taxableRevenue × tncnRate} at the time this DTO was built.
     * For finalized months this is the rate that was in effect at
     * finalization time.
     */
    private BigDecimal tncnAmount;

    /**
     * {@code true} if the month has been officially finalized and a
     * snapshot row exists in {@code monthly_revenue}.
     */
    private boolean finalized;

    /**
     * Timestamp when the month was finalized.
     * {@code null} for live / unfinalized months.
     */
    private LocalDateTime finalizedAt;
}
