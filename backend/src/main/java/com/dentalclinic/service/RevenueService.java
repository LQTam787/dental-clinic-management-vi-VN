package com.dentalclinic.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dentalclinic.dto.MonthlyRevenueDTO;
import com.dentalclinic.dto.S1aHkdDTO;
import com.dentalclinic.dto.S1aHkdEntryDTO;
import com.dentalclinic.model.Appointment;
import com.dentalclinic.model.ClinicSettings;
import com.dentalclinic.model.MonthlyRevenue;
import com.dentalclinic.model.Patient;
import com.dentalclinic.repository.AppointmentRepository;
import com.dentalclinic.repository.MonthlyRevenueRepository;

/**
 * Core service for the Revenue & Tax subsystem.
 *
 * <p>
 * Responsibilities:
 * <ul>
 * <li>Computing live (unfinalized) monthly totals directly from the
 * {@code appointments} table.</li>
 * <li>Building the 12-element annual summary list.</li>
 * <li>Finalizing a month — writing an immutable snapshot to
 * {@code monthly_revenue}.</li>
 * <li>Providing the raw data for the S1a-HKD ledger (Session 3 extends
 * this with {@code getS1aHkdData}).</li>
 * </ul>
 *
 * <p>
 * <strong>Monthly reset mechanics:</strong> "Reset to zero on day 1" does
 * NOT delete data. The scheduled job (or manual endpoint) takes a snapshot of
 * the previous month's total and writes it to {@code monthly_revenue}. The
 * live monthly total is always re-computed from the {@code appointments} table,
 * so it reflects any retroactive edits. The finalized snapshot is immutable.
 */
@Service
public class RevenueService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private MonthlyRevenueRepository monthlyRevenueRepository;

    @Autowired
    private ClinicSettingsService settingsService;

    // -----------------------------------------------------------------------
    // Live (current month) queries
    // -----------------------------------------------------------------------

    /**
     * Live revenue total for the current calendar month.
     *
     * <p>
     * Computes {@code SUM(COALESCE(fee, 0))} directly from the
     * {@code appointments} table for the current year/month. Never returns
     * {@code null}.
     *
     * @return Current-month revenue; {@link BigDecimal#ZERO} if no appointments
     */
    public BigDecimal getCurrentMonthRevenue() {
        LocalDate today = LocalDate.now();
        BigDecimal result = appointmentRepository.sumFeeByYearAndMonth(
                today.getYear(), today.getMonthValue());
        return result != null ? result : BigDecimal.ZERO;
    }

    /**
     * Live appointment count for the current calendar month.
     *
     * @return Number of appointments in the current month
     */
    public long getCurrentMonthAppointmentCount() {
        LocalDate today = LocalDate.now();
        return appointmentRepository.countByYearAndMonth(
                today.getYear(), today.getMonthValue());
    }

    /**
     * Builds a {@link MonthlyRevenueDTO} for the current calendar month.
     *
     * <p>
     * The returned DTO always has {@code finalized = false} because the
     * current month is never finalized until it has ended.
     *
     * @return Live DTO for the current month
     */
    public MonthlyRevenueDTO getCurrentMonthDTO() {
        LocalDate today = LocalDate.now();
        return buildLiveDTO(today.getYear(), today.getMonthValue());
    }

    // -----------------------------------------------------------------------
    // Monthly / annual queries
    // -----------------------------------------------------------------------

    /**
     * Returns a {@link MonthlyRevenueDTO} for the given year/month.
     *
     * <p>
     * If a finalized snapshot exists in {@code monthly_revenue}, that row
     * is returned (finalized = true). Otherwise a live DTO is computed from
     * the {@code appointments} table (finalized = false).
     *
     * @param year  4-digit calendar year
     * @param month 1-based month number
     * @return DTO for the period — never {@code null}
     */
    public MonthlyRevenueDTO getMonthlyRevenue(int year, int month) {
        Optional<MonthlyRevenue> snapshot = monthlyRevenueRepository.findByYearAndMonth(year, month);
        if (snapshot.isPresent()) {
            return toDTO(snapshot.get());
        }
        return buildLiveDTO(year, month);
    }

    /**
     * Returns a 12-element list of monthly revenue DTOs for the given year.
     *
     * <p>
     * The list is always exactly 12 elements (index 0 = January,
     * index 11 = December). For each month:
     * <ul>
     * <li>If a finalized snapshot exists → use it (finalized = true).</li>
     * <li>If the month is in the past (but no snapshot) → compute live.</li>
     * <li>If the month is in the future → return a zero-value DTO.</li>
     * </ul>
     *
     * @param year 4-digit calendar year
     * @return Immutable 12-element list, one DTO per calendar month
     */
    public List<MonthlyRevenueDTO> getAllMonthsForYear(int year) {
        // Index the finalized rows by month for O(1) lookup
        Map<Integer, MonthlyRevenue> finalizedByMonth = monthlyRevenueRepository
                .findAllByYearOrderByMonth(year)
                .stream()
                .collect(Collectors.toMap(MonthlyRevenue::getMonth, mr -> mr));

        LocalDate today = LocalDate.now();
        List<MonthlyRevenueDTO> result = new ArrayList<>(12);

        for (int month = 1; month <= 12; month++) {
            if (finalizedByMonth.containsKey(month)) {
                // Finalized snapshot
                result.add(toDTO(finalizedByMonth.get(month)));
            } else {
                // Not finalized — compute live for past/current, zero for future
                boolean isFutureMonth = year > today.getYear()
                        || (year == today.getYear() && month > today.getMonthValue());
                if (isFutureMonth) {
                    result.add(buildZeroDTO(year, month));
                } else {
                    result.add(buildLiveDTO(year, month));
                }
            }
        }
        return result;
    }

    /**
     * Annual revenue total for the given year.
     *
     * <p>
     * Sums all finalized monthly totals from {@code monthly_revenue} plus
     * the live current-month total if the year is the current year. For past
     * years, only finalized rows contribute (months that were never finalized
     * will be absent from the total — the caller is expected to surface the
     * "Chưa chốt sổ" warning via {@link #getAllMonthsForYear}).
     *
     * @param year 4-digit calendar year
     * @return Annual total; {@link BigDecimal#ZERO} if no data
     */
    public BigDecimal getAnnualTotal(int year) {
        BigDecimal finalizedTotal = monthlyRevenueRepository.sumTotalRevenueByYear(year);
        if (finalizedTotal == null)
            finalizedTotal = BigDecimal.ZERO;

        LocalDate today = LocalDate.now();
        if (year == today.getYear()) {
            // Add live current-month total (not yet finalized)
            // Avoid double-counting if the current month was already finalized
            int currentMonth = today.getMonthValue();
            boolean currentMonthFinalized = monthlyRevenueRepository
                    .findByYearAndMonth(year, currentMonth)
                    .map(MonthlyRevenue::getFinalized)
                    .orElse(false);

            if (!currentMonthFinalized) {
                BigDecimal liveRevenue = getCurrentMonthRevenue();
                finalizedTotal = finalizedTotal.add(liveRevenue);
            }
        }
        return finalizedTotal;
    }

    // -----------------------------------------------------------------------
    // Finalization
    // -----------------------------------------------------------------------

    /**
     * Finalizes a calendar month — writes an immutable snapshot to
     * {@code monthly_revenue}.
     *
     * <p>
     * This method is <strong>idempotent</strong>: if a finalized row already
     * exists for the given year/month, it is returned unchanged. The second
     * call has no side effects.
     *
     * <p>
     * Steps when a snapshot does not yet exist:
     * <ol>
     * <li>Compute {@code SUM(COALESCE(fee,0))} from {@code appointments}.</li>
     * <li>Read current TNCN rate from {@link ClinicSettings} and lock it into
     * the snapshot (changing the rate later will not alter this row).</li>
     * <li>Write and persist the {@link MonthlyRevenue} row.</li>
     * </ol>
     *
     * @param year  4-digit calendar year
     * @param month 1-based month number
     * @return The finalized {@link MonthlyRevenue} row (existing or newly created)
     */
    @Transactional
    public MonthlyRevenue finalizeMonth(int year, int month) {
        // Idempotency check — return existing row if already finalized
        Optional<MonthlyRevenue> existing = monthlyRevenueRepository.findByYearAndMonth(year, month);
        if (existing.isPresent() && Boolean.TRUE.equals(existing.get().getFinalized())) {
            return existing.get();
        }

        // Compute live totals from appointments table
        BigDecimal totalRevenue = appointmentRepository.sumFeeByYearAndMonth(year, month);
        if (totalRevenue == null)
            totalRevenue = BigDecimal.ZERO;

        long appointmentCount = appointmentRepository.countByYearAndMonth(year, month);

        // Lock in the current TNCN rate
        ClinicSettings settings = settingsService.getSettings();
        BigDecimal tncnRate = settings.getTncnRate();
        BigDecimal tncnAmount = totalRevenue.multiply(tncnRate)
                .setScale(2, RoundingMode.HALF_UP);

        LocalDateTime now = LocalDateTime.now();

        // Update existing draft row or create a new finalized row
        MonthlyRevenue record = existing.orElseGet(MonthlyRevenue::new);
        record.setYear(year);
        record.setMonth(month);
        record.setTotalRevenue(totalRevenue);
        record.setAppointmentCount((int) appointmentCount);
        record.setTncnAmount(tncnAmount);
        record.setFinalized(true);
        record.setFinalizedAt(now);
        record.setUpdatedAt(now);
        if (record.getCreatedAt() == null) {
            record.setCreatedAt(now);
        }

        return monthlyRevenueRepository.save(record);
    }

    // -----------------------------------------------------------------------
    // S1a-HKD form data — Session 3
    // -----------------------------------------------------------------------

    /**
     * Builds the complete {@link S1aHkdDTO} for the given year/month.
     *
     * <p>
     * Steps:
     * <ol>
     * <li>Fetch {@link ClinicSettings} for the header block fields.</li>
     * <li>Query all appointments with their patients for the period,
     * ordered by date ASC then patient name ASC.</li>
     * <li>Map each row to an {@link S1aHkdEntryDTO}:
     * <ul>
     * <li>Cột A — {@code appointment.date}</li>
     * <li>Cột B — {@code "Dịch vụ nha khoa — " + patient.name}</li>
     * <li>Cột 1 — {@code COALESCE(appointment.fee, 0)}</li>
     * </ul>
     * </li>
     * <li>Sum all entry amounts → {@code totalRevenue}.</li>
     * <li>Apply {@code tncnRate} → {@code tncnAmount} (rounded HALF_UP to 2
     * dp).</li>
     * <li>Set {@code signatureDate} to today in "Ngày DD tháng MM năm YYYY"
     * format.</li>
     * </ol>
     *
     * <p>
     * NULL-fee appointments are included with {@code amount = 0} and do not
     * cause any exception. An empty period (no appointments) returns a valid DTO
     * with an empty entries list and all totals at zero.
     *
     * <p>
     * Empty {@code clinic_settings} string fields are returned as-is
     * (empty strings). The frontend renders {@code "..........."} placeholders
     * for blank fields.
     *
     * @param year  4-digit calendar year
     * @param month 1-based month number (1 = January … 12 = December)
     * @return A fully populated {@link S1aHkdDTO}; never {@code null}
     */
    public S1aHkdDTO getS1aHkdData(int year, int month) {
        ClinicSettings settings = settingsService.getSettings();

        String declarationPeriod = String.format("Tháng %02d/%d", month, year);

        List<Object[]> rows = appointmentRepository
                .findAppointmentsWithPatientsByYearAndMonth(year, month);

        List<S1aHkdEntryDTO> entries = new ArrayList<>(rows.size());
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (Object[] row : rows) {
            Appointment appt = (Appointment) row[0];
            Patient patient = (Patient) row[1];

            BigDecimal amount = appt.getFee() != null ? appt.getFee() : BigDecimal.ZERO;
            String description = "Dịch vụ nha khoa — " + patient.getName();

            entries.add(new S1aHkdEntryDTO(appt.getDate(), description, amount));
            totalRevenue = totalRevenue.add(amount);
        }

        BigDecimal tncnAmount = totalRevenue
                .multiply(settings.getTncnRate())
                .setScale(2, RoundingMode.HALF_UP);

        LocalDate today = LocalDate.now();
        String signatureDate = String.format("Ngày %02d tháng %02d năm %d",
                today.getDayOfMonth(), today.getMonthValue(), today.getYear());

        return new S1aHkdDTO(
                nullToEmpty(settings.getBusinessName()),
                nullToEmpty(settings.getOwnerName()),
                nullToEmpty(settings.getAddress()),
                nullToEmpty(settings.getTaxId()),
                nullToEmpty(settings.getBusinessAddress()),
                declarationPeriod,
                settings.getCurrencyUnit() != null ? settings.getCurrencyUnit() : "VNĐ",
                entries,
                totalRevenue,
                tncnAmount,
                signatureDate);
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    /**
     * Computes a live (unfinalized) DTO for any year/month from the
     * {@code appointments} table.
     */
    private MonthlyRevenueDTO buildLiveDTO(int year, int month) {
        BigDecimal totalRevenue = appointmentRepository.sumFeeByYearAndMonth(year, month);
        if (totalRevenue == null)
            totalRevenue = BigDecimal.ZERO;

        long appointmentCount = appointmentRepository.countByYearAndMonth(year, month);

        ClinicSettings settings = settingsService.getSettings();
        BigDecimal tncnAmount = totalRevenue.multiply(settings.getTncnRate())
                .setScale(2, RoundingMode.HALF_UP);

        return new MonthlyRevenueDTO(
                year, month, totalRevenue, (int) appointmentCount,
                tncnAmount, false, null);
    }

    /** Returns a zero-value DTO for a future month (no appointments yet). */
    private MonthlyRevenueDTO buildZeroDTO(int year, int month) {
        return new MonthlyRevenueDTO(
                year, month, BigDecimal.ZERO, 0, BigDecimal.ZERO, false, null);
    }

    /** Converts a finalized {@link MonthlyRevenue} entity to a DTO. */
    private MonthlyRevenueDTO toDTO(MonthlyRevenue entity) {
        return new MonthlyRevenueDTO(
                entity.getYear(),
                entity.getMonth(),
                entity.getTotalRevenue(),
                entity.getAppointmentCount(),
                entity.getTncnAmount(),
                entity.getFinalized(),
                entity.getFinalizedAt());
    }

    /** Returns the string value, or an empty string if {@code null}. */
    private String nullToEmpty(String value) {
        return value != null ? value : "";
    }
}
