package com.dentalclinic.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dentalclinic.dto.MonthlyRevenueDTO;
import com.dentalclinic.dto.S1aHkdDTO;
import com.dentalclinic.model.MonthlyRevenue;
import com.dentalclinic.service.RevenueService;

/**
 * REST endpoints for the Revenue & Tax subsystem.
 *
 * <p>
 * All paths are under {@code /api/revenue}, which is already covered by the
 * existing CORS configuration at {@code /api/**} in {@code CorsConfig.java}.
 *
 * <p>
 * Endpoints provided in Session 2:
 * <table border="1">
 * <tr>
 * <th>Method</th>
 * <th>Path</th>
 * <th>Description</th>
 * </tr>
 * <tr>
 * <td>GET</td>
 * <td>/api/revenue/current-month</td>
 * <td>Live running total for the current calendar month</td>
 * </tr>
 * <tr>
 * <td>GET</td>
 * <td>/api/revenue/monthly/{year}</td>
 * <td>12-element list for the given year</td>
 * </tr>
 * <tr>
 * <td>GET</td>
 * <td>/api/revenue/annual/{year}</td>
 * <td>Annual total (BigDecimal)</td>
 * </tr>
 * <tr>
 * <td>POST</td>
 * <td>/api/revenue/finalize/{year}/{month}</td>
 * <td>Manual month-end finalization (idempotent)</td>
 * </tr>
 * </table>
 *
 * <p>
 * The S1a-HKD endpoint ({@code GET /api/revenue/s1a-hkd/{year}/{month}})
 * is added in Session 3 once the S1a-HKD DTOs and service method exist.
 */
@RestController
@RequestMapping("/api/revenue")
@CrossOrigin(origins = "http://localhost:5173")
public class RevenueController {

    @Autowired
    private RevenueService revenueService;

    // -----------------------------------------------------------------------
    // GET /api/revenue/current-month
    // -----------------------------------------------------------------------

    /**
     * Returns the live revenue total for the current calendar month.
     *
     * <p>
     * The response always has {@code finalized = false} because the current
     * month is never finalized until it has ended. Data is computed on-the-fly
     * from the {@code appointments} table.
     *
     * @return HTTP 200 with a {@link MonthlyRevenueDTO} for the current month
     */
    @GetMapping("/current-month")
    public ResponseEntity<MonthlyRevenueDTO> getCurrentMonth() {
        MonthlyRevenueDTO dto = revenueService.getCurrentMonthDTO();
        return ResponseEntity.ok(dto);
    }

    // -----------------------------------------------------------------------
    // GET /api/revenue/monthly/{year}
    // -----------------------------------------------------------------------

    /**
     * Returns monthly revenue data for all 12 months of the given year.
     *
     * <p>
     * Always returns exactly 12 elements (January = index 0, December = index 11).
     * <ul>
     * <li>Finalized months → data from {@code monthly_revenue}
     * ({@code finalized = true})</li>
     * <li>Past/current unfinalized months → live data from
     * {@code appointments}</li>
     * <li>Future months → zero-value DTO ({@code finalized = false})</li>
     * </ul>
     *
     * @param year 4-digit calendar year (e.g. 2026)
     * @return HTTP 200 with a list of 12 {@link MonthlyRevenueDTO}s
     */
    @GetMapping("/monthly/{year}")
    public ResponseEntity<List<MonthlyRevenueDTO>> getMonthlyByYear(@PathVariable int year) {
        List<MonthlyRevenueDTO> months = revenueService.getAllMonthsForYear(year);
        return ResponseEntity.ok(months);
    }

    // -----------------------------------------------------------------------
    // GET /api/revenue/annual/{year}
    // -----------------------------------------------------------------------

    /**
     * Returns the total revenue for the given year.
     *
     * <p>
     * For the current year, the live current-month total is added to the
     * sum of all finalized months (avoiding double-counting if the current month
     * has already been finalized). For past years, only finalized rows contribute.
     *
     * @param year 4-digit calendar year
     * @return HTTP 200 with a {@link BigDecimal} annual total
     */
    @GetMapping("/annual/{year}")
    public ResponseEntity<BigDecimal> getAnnualTotal(@PathVariable int year) {
        BigDecimal total = revenueService.getAnnualTotal(year);
        return ResponseEntity.ok(total);
    }

    // -----------------------------------------------------------------------
    // GET /api/revenue/s1a-hkd/{year}/{month}
    // -----------------------------------------------------------------------

    /**
     * Returns the complete S1a-HKD ledger payload for the given period.
     *
     * <p>
     * The response contains:
     * <ul>
     * <li>Header block populated from {@code clinic_settings}.</li>
     * <li>One {@code S1aHkdEntryDTO} per appointment in the period,
     * ordered by date ASC then patient name ASC.</li>
     * <li>Footer: {@code totalRevenue} (sum of all entry amounts) and
     * {@code tncnAmount} ({@code totalRevenue × tncnRate}).</li>
     * <li>{@code signatureDate}: today formatted as
     * {@code "Ngày DD tháng MM năm YYYY"}.</li>
     * </ul>
     *
     * <p>
     * NULL-fee appointments appear with {@code amount = 0}.
     * Empty {@code clinic_settings} string fields are returned as empty strings;
     * the frontend renders {@code "..........."} placeholders.
     *
     * @param year  4-digit calendar year
     * @param month 1-based month number (1–12)
     * @return HTTP 200 with a fully populated {@link S1aHkdDTO}
     */
    @GetMapping("/s1a-hkd/{year}/{month}")
    public ResponseEntity<S1aHkdDTO> getS1aHkd(
            @PathVariable int year, @PathVariable int month) {
        S1aHkdDTO dto = revenueService.getS1aHkdData(year, month);
        return ResponseEntity.ok(dto);
    }

    // -----------------------------------------------------------------------
    // POST /api/revenue/finalize/{year}/{month}
    // -----------------------------------------------------------------------

    /**
     * Finalizes the given calendar month — writes an immutable snapshot to
     * {@code monthly_revenue}.
     *
     * <p>
     * This endpoint is <strong>idempotent</strong>: calling it on a month
     * that is already finalized returns the existing row unchanged (HTTP 200).
     * The {@code finalized_at} timestamp in the response indicates when
     * finalization occurred.
     *
     * <p>
     * Normal flow: the {@code MonthlyFinalizationJob} fires automatically at
     * midnight on the 1st of every month. Use this endpoint to manually trigger
     * finalization if the scheduler missed a run (e.g. server was offline).
     *
     * @param year  4-digit calendar year
     * @param month 1-based month number (1–12)
     * @return HTTP 200 with the finalized {@link MonthlyRevenueDTO}
     */
    @PostMapping("/finalize/{year}/{month}")
    public ResponseEntity<MonthlyRevenueDTO> finalizeMonth(
            @PathVariable int year, @PathVariable int month) {

        MonthlyRevenue finalized = revenueService.finalizeMonth(year, month);

        // Convert entity → DTO for the response
        MonthlyRevenueDTO dto = new MonthlyRevenueDTO(
                finalized.getYear(),
                finalized.getMonth(),
                finalized.getTotalRevenue(),
                finalized.getAppointmentCount(),
                finalized.getTaxableRevenue(),
                finalized.getTncnAmount(),
                finalized.getFinalized(),
                finalized.getFinalizedAt());
        return ResponseEntity.ok(dto);
    }
}
