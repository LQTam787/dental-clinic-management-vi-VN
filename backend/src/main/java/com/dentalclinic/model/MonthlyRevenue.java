package com.dentalclinic.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Finalized monthly revenue snapshot.
 *
 * <p>One row is written per calendar month when that month is finalized
 * (either by the scheduled job on the 1st or by the manual finalization
 * endpoint). The {@code UNIQUE(year, month)} database constraint makes
 * finalization idempotent.
 *
 * <p>Importantly, this table stores <em>snapshots</em>. Appointment data is
 * never deleted; the {@code appointments} table remains the source of truth
 * for live queries. A finalized row is the official declaration for a period
 * and is not updated retroactively when appointments are later edited.
 *
 * <p>The {@code tncnAmount} is computed as
 * {@code taxableRevenue × tncn_rate} at the moment of finalization and stored
 * here, where {@code taxableRevenue} is the sum of fees for beauty-only
 * appointments. Changing the TNCN rate in {@link ClinicSettings} does not
 * alter previously finalized rows.
 */
@Entity
@Table(
    name = "monthly_revenue",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_year_month",
        columnNames = {"year", "month"}
    )
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyRevenue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Calendar year (e.g. 2026). */
    @Column(name = "year", nullable = false)
    private Integer year;

    /** Calendar month, 1-based (1 = January … 12 = December). */
    @Column(name = "month", nullable = false)
    private Integer month;

    /**
     * Sum of {@code COALESCE(appointments.fee, 0)} for appointments in
     * this year/month.
     */
    @Column(name = "total_revenue", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalRevenue = BigDecimal.ZERO;

    /** Number of appointments in the period. */
    @Column(name = "appointment_count", nullable = false)
    private Integer appointmentCount = 0;

    /**
     * Sum of fees for beauty-only ({@code is_beauty = true}) appointments in
     * this period. This is the TNCN tax base: only beauty/cosmetic services
     * are taxable; dental treatment services are exempt.
     */
    @Column(name = "taxable_revenue", precision = 15, scale = 2)
    private BigDecimal taxableRevenue = BigDecimal.ZERO;

    /**
     * Personal income tax (thuế TNCN) amount:
     * {@code taxableRevenue × ClinicSettings.tncnRate} at finalization time.
     */
    @Column(name = "tncn_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal tncnAmount = BigDecimal.ZERO;

    /**
     * {@code false} = draft / live preview; {@code true} = officially finalized.
     * Once set to {@code true} by the service layer it is never set back to
     * {@code false}.
     */
    @Column(name = "finalized", nullable = false)
    private Boolean finalized = false;

    /** Timestamp when the month was finalized; {@code null} while not yet finalized. */
    @Column(name = "finalized_at")
    private LocalDateTime finalizedAt;

    /** Optional diễn giải / notes for the period. */
    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
