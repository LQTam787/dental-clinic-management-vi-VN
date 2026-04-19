package com.dentalclinic.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dentalclinic.dto.AppointmentWithPatientDTO;
import com.dentalclinic.model.Appointment;

/**
 * Repository interface for Appointment entity. Provides database operations for
 * appointments including the critical findAppointmentsWithPatients query used
 * by the main UI.
 */
@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

	/**
	 * Find all appointments for a specific patient. Useful for viewing a patient's
	 * appointment history.
	 *
	 * @param patientId The patient's ID
	 * @return List of appointments for that patient
	 */
	List<Appointment> findByPatientId(Long patientId);

	/**
	 * PRIMARY QUERY FOR THE UI - Get appointments with patient data and filtering.
	 *
	 * This is the most important query in the application. It: 1. Joins
	 * appointments with patients (avoiding N+1 query problem) 2. Returns a DTO
	 * instead of entities (more efficient) 3. Supports optional filtering by search
	 * term and treatment needs
	 *
	 * JPQL EXPLANATION: - "new com.dentalclinic.dto.AppointmentWithPatientDTO(...)"
	 * → Constructor expression - creates DTO directly in query
	 *
	 * - "FROM Appointment a JOIN a.patient p" → Joins appointments with their
	 * patients using the relationship
	 *
	 * - "WHERE (:search IS NULL OR ...)" → If search is null, this condition is
	 * ignored (shows all) → If search has a value, it filters by name or phone
	 *
	 * - "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))" → Case-insensitive
	 * partial match on patient name → Example: "john" matches "John Doe", "Johnny
	 * Smith"
	 *
	 * - "AND (:needsImplant IS NULL OR a.needsImplant = :needsImplant)" → If
	 * needsImplant is null, ignore this filter → If needsImplant is true, only show
	 * appointments needing implants → If needsImplant is false, only show
	 * appointments NOT needing implants
	 *
	 * PARAMETER NOTES: - All parameters are nullable (required = false in
	 * controller) - Null means "don't filter on this criteria" - This allows
	 * flexible combinations: * All appointments: all params null * Search only:
	 * search="john", others null * Filter only: search=null, needsImplant=true *
	 * Combined: search="jane", needsImplant=true, needsDenture=true
	 *
	 * @param search            Optional search term for patient name or phone
	 * @param needsImplant      Optional filter for implant requirement
	 * @param needsDenture      Optional filter for denture requirement
	 * @param needsOrthodontics Optional filter for orthodontics requirement
	 * @return List of AppointmentWithPatientDTO containing all matching
	 *         appointments
	 */
	@Query("SELECT new com.dentalclinic.dto.AppointmentWithPatientDTO("
			+ "a.id, a.date, a.diagnosis, a.treatment, a.needsImplant, "
			+ "a.needsDenture, a.needsOrthodontics, a.isBeauty, a.fee, a.note, "
			+ "p.id, p.name, p.birthYear, p.gender, p.phone, p.address) " + "FROM Appointment a JOIN a.patient p "
			+ "WHERE (:search IS NULL OR " + "LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR "
			+ "p.phone LIKE CONCAT('%', CAST(:search AS string), '%')) "
			+ "AND (:needsImplant IS NULL OR a.needsImplant = :needsImplant) "
			+ "AND (:needsDenture IS NULL OR a.needsDenture = :needsDenture) "
			+ "AND (:needsOrthodontics IS NULL OR a.needsOrthodontics = :needsOrthodontics)")
	List<AppointmentWithPatientDTO> findAppointmentsWithPatients(@Param("search") String search,
			@Param("needsImplant") Boolean needsImplant, @Param("needsDenture") Boolean needsDenture,
			@Param("needsOrthodontics") Boolean needsOrthodontics);

	// -----------------------------------------------------------------------
	// Revenue aggregation queries — added Session 2
	// Used by RevenueService for live (unfinalized) monthly calculations.
	// -----------------------------------------------------------------------

	/**
	 * Sum of all appointment fees for a specific calendar month.
	 *
	 * <p>Uses {@code COALESCE} at two levels:
	 * <ul>
	 *   <li>Inner {@code COALESCE(a.fee, 0)} — treats NULL fees as zero.</li>
	 *   <li>Outer {@code COALESCE(SUM(...), 0)} — returns zero rather than NULL
	 *       when there are no appointments in the period.</li>
	 * </ul>
	 *
	 * @param year  4-digit calendar year
	 * @param month 1-based month number (1 = January … 12 = December)
	 * @return Non-null sum of fees; {@code BigDecimal.ZERO} when no appointments exist
	 */
	@Query("SELECT COALESCE(SUM(COALESCE(a.fee, 0)), 0) FROM Appointment a "
			+ "WHERE EXTRACT(YEAR FROM a.date) = :year AND EXTRACT(MONTH FROM a.date) = :month")
	BigDecimal sumFeeByYearAndMonth(@Param("year") int year, @Param("month") int month);

	/**
	 * Count of appointments for a specific calendar month.
	 *
	 * @param year  4-digit calendar year
	 * @param month 1-based month number
	 * @return Number of appointments in the period (0 if none)
	 */
	@Query("SELECT COUNT(a) FROM Appointment a "
			+ "WHERE EXTRACT(YEAR FROM a.date) = :year AND EXTRACT(MONTH FROM a.date) = :month")
	long countByYearAndMonth(@Param("year") int year, @Param("month") int month);

	/**
	 * Sum of fees for beauty-only appointments in a specific calendar month.
	 *
	 * <p>Only appointments with {@code is_beauty = true} are included. This is
	 * the TNCN tax base: dental treatment services are exempt; only
	 * beauty/cosmetic services are taxable under TNCN.
	 *
	 * @param year  4-digit calendar year
	 * @param month 1-based month number (1 = January ... 12 = December)
	 * @return Non-null sum of beauty-appointment fees; {@code BigDecimal.ZERO} when none exist
	 */
	@Query("SELECT COALESCE(SUM(COALESCE(a.fee, 0)), 0) FROM Appointment a "
			+ "WHERE EXTRACT(YEAR FROM a.date) = :year AND EXTRACT(MONTH FROM a.date) = :month "
			+ "AND a.isBeauty = true")
	BigDecimal sumBeautyFeeByYearAndMonth(@Param("year") int year, @Param("month") int month);

	/**
	 * Fetches all appointments with their associated patient for a given calendar
	 * month, ordered by date ASC then patient name ASC.
	 *
	 * <p>Used by {@link com.dentalclinic.service.RevenueService#getS1aHkdData}
	 * (Session 3) to build the per-row entries of the S1a-HKD ledger.
	 *
	 * @param year  4-digit calendar year
	 * @param month 1-based month number
	 * @return List of {@code Object[]} where index 0 is {@link Appointment} and
	 *         index 1 is {@link com.dentalclinic.model.Patient}
	 */
	@Query("SELECT a, p FROM Appointment a JOIN a.patient p "
			+ "WHERE EXTRACT(YEAR FROM a.date) = :year AND EXTRACT(MONTH FROM a.date) = :month "
			+ "ORDER BY a.date ASC, p.name ASC")
	List<Object[]> findAppointmentsWithPatientsByYearAndMonth(
			@Param("year") int year, @Param("month") int month);
}
