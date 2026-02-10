package com.dentalclinic.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.dentalclinic.model.Patient;

/**
 * Repository interface for Patient entity. Extends JpaRepository which
 * provides: - findAll() - Get all patients - findById(Long id) - Get patient by
 * ID - save(Patient) - Create or update patient - delete(Patient) - Delete
 * patient - count() - Count total patients - and many more built-in methods
 *
 * We add custom query methods for searching patients.
 */
@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

	/**
	 * Find patients by name (case-insensitive, partial match). Spring Data JPA
	 * automatically implements this method based on the method name.
	 *
	 * Example: findByNameContainingIgnoreCase("john") will find "John Doe", "Johnny
	 * Smith", etc.
	 *
	 * @param name The name search term
	 * @return List of matching patients
	 */
	List<Patient> findByNameContainingIgnoreCase(String name);

	/**
	 * Find patients by phone number (partial match).
	 *
	 * Example: findByPhoneContaining("555") will find "555-0101", "555-0102", etc.
	 *
	 * @param phone The phone search term
	 * @return List of matching patients
	 */
	List<Patient> findByPhoneContaining(String phone);

	/**
	 * Find a patient by exact phone number.
	 *
	 * FIX FOR TEST 1.5 Used to check for duplicate phone numbers before
	 * creating/updating patients.
	 *
	 * @param phone The exact phone number to search for
	 * @return Optional containing the patient if found, empty otherwise
	 */
	Optional<Patient> findByPhone(String phone);

	/**
	 * Search patients by name OR phone using JPQL. This is more flexible than the
	 * method name queries above.
	 *
	 * The @Query annotation allows us to write custom JPQL (Java Persistence Query
	 * Language). JPQL is similar to SQL but works with entity objects instead of
	 * tables.
	 *
	 * LOWER() makes the search case-insensitive for names. CONCAT('%', :search,
	 * '%') adds wildcards for partial matching.
	 *
	 * Example: searchByNameOrPhone("john") will find patients with "john" in name
	 * OR phone.
	 *
	 * @param search The search term
	 * @return List of matching patients
	 */
	@Query("SELECT p FROM Patient p WHERE " + "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR "
			+ "p.phone LIKE CONCAT('%', :search, '%')")
	List<Patient> searchByNameOrPhone(@Param("search") String search);
}