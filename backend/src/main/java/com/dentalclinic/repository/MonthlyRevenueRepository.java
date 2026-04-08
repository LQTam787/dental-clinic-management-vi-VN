package com.dentalclinic.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dentalclinic.model.MonthlyRevenue;

/**
 * Data-access layer for {@link MonthlyRevenue}.
 *
 * <p>All query methods here operate on the <em>finalized</em> snapshot table.
 * Live revenue figures (current, unfinalized month) are computed directly
 * from the {@code appointments} table in
 * {@link com.dentalclinic.repository.AppointmentRepository}.
 */
@Repository
public interface MonthlyRevenueRepository extends JpaRepository<MonthlyRevenue, Long> {

    /**
     * Returns the finalized record for a specific year/month, if one exists.
     *
     * <p>Used by {@code RevenueService} to determine whether a month has
     * already been finalized before attempting to write a new snapshot.
     *
     * @param year  4-digit calendar year
     * @param month 1-based month (1 = January … 12 = December)
     * @return Optional containing the row if finalized, empty otherwise
     */
    Optional<MonthlyRevenue> findByYearAndMonth(int year, int month);

    /**
     * Returns all finalized records for a given year, ordered chronologically.
     *
     * <p>Used by {@code RevenueService.getAllMonthsForYear()} to build the
     * 12-element list shown in the annual summary table. Months without a
     * finalized record are filled in with live-computed zero-value DTOs by
     * the service layer.
     *
     * @param year 4-digit calendar year
     * @return List of finalized records for the year, sorted by month ASC
     */
    List<MonthlyRevenue> findAllByYearOrderByMonth(int year);

    /**
     * Aggregates the total revenue across all finalized records for a year.
     *
     * <p>Returns {@code BigDecimal.ZERO} (via COALESCE) rather than
     * {@code null} when there are no finalized records for the year.
     *
     * @param year 4-digit calendar year
     * @return Sum of {@code total_revenue} for all finalized months in the year
     */
    @Query("SELECT COALESCE(SUM(mr.totalRevenue), 0) "
         + "FROM MonthlyRevenue mr "
         + "WHERE mr.year = :year")
    BigDecimal sumTotalRevenueByYear(@Param("year") int year);
}
