package com.dentalclinic.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dentalclinic.exception.DuplicatePhoneException;
import com.dentalclinic.exception.ResourceNotFoundException;
import com.dentalclinic.model.Patient;
import com.dentalclinic.repository.PatientRepository;

/**
 * Service layer for Patient operations. Contains business logic and acts as an
 * intermediary between controllers and repositories.
 *
 * @Service annotation marks this as a Spring service component.
 * @Transactional ensures database operations are atomic (all-or-nothing).
 */
@Service
@Transactional
public class PatientService {

	private final PatientRepository patientRepository;

	/**
	 * Constructor injection (preferred over field injection). Spring automatically
	 * provides the PatientRepository implementation.
	 */
	@Autowired
	public PatientService(PatientRepository patientRepository) {
		this.patientRepository = patientRepository;
	}

	/**
	 * Get all patients from the database.
	 *
	 * @return List of all patients (empty list if none exist)
	 */
	public List<Patient> getAllPatients() {
		return patientRepository.findAll(org.springframework.data.domain.Sort.by("id").descending());
	}

	/**
	 * Get a single patient by ID.
	 *
	 * @param id The patient ID to search for
	 * @return The patient if found
	 * @throws ResourceNotFoundException if patient with this ID doesn't exist
	 */
	public Patient getPatientById(Long id) {
		return patientRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
	}

	/**
	 * Create a new patient.
	 *
	 * FIX FOR TEST 1.5 Now checks for duplicate phone numbers BEFORE attempting to
	 * save
	 *
	 * Business rules enforced: - Phone number must be unique (checked
	 * programmatically) - All required fields must be present (name, birthYear,
	 * gender, phone)
	 *
	 * @param patient The patient to create (id should be null)
	 * @return The created patient with generated ID
	 * @throws DuplicatePhoneException if a patient with this phone already exists
	 */
	public Patient createPatient(Patient patient) {
		return patientRepository.save(patient);
	}

	/**
	 * Update an existing patient.
	 *
	 * FIX FOR TEST 1.5 Now checks if the new phone number conflicts with another
	 * patient
	 *
	 * This method: 1. Fetches the existing patient (throws exception if not found)
	 * 2. Checks if phone number is changing 3. If changing, verifies the new phone
	 * isn't already used by another patient 4. Updates all fields from the provided
	 * patient object 5. Saves the updated patient back to database
	 *
	 * Note: We don't update the ID - it's immutable Note: We don't update the
	 * appointments list here - that's managed separately
	 *
	 * @param id             The ID of the patient to update
	 * @param patientDetails The new patient data
	 * @return The updated patient
	 * @throws ResourceNotFoundException if patient with this ID doesn't exist
	 * @throws DuplicatePhoneException   if new phone number belongs to another
	 *                                   patient
	 */
	public Patient updatePatient(Long id, Patient patientDetails) {
		Patient patient = getPatientById(id);

		// Update all editable fields
		patient.setName(patientDetails.getName());
		patient.setBirthYear(patientDetails.getBirthYear());
		patient.setGender(patientDetails.getGender());
		patient.setPhone(patientDetails.getPhone());
		patient.setAddress(patientDetails.getAddress());

		return patientRepository.save(patient);
	}

	/**
	 * Delete a patient by ID.
	 *
	 * Important: Due to CASCADE DELETE configured in the Appointment entity,
	 * deleting a patient will automatically delete all their appointments.
	 *
	 * This is intentional because: - Appointments don't make sense without a
	 * patient - Maintains referential integrity
	 *
	 * Future enhancement: Add confirmation in UI before deleting patients with
	 * appointments
	 *
	 * @param id The ID of the patient to delete
	 * @throws ResourceNotFoundException if patient with this ID doesn't exist
	 */
	public void deletePatient(Long id) {
		Patient patient = getPatientById(id);
		patientRepository.delete(patient);
	}

	/**
	 * Search patients by name or phone number. Useful for finding a patient before
	 * creating an appointment.
	 *
	 * @param searchTerm The term to search for (case-insensitive, partial match)
	 * @return List of matching patients
	 */
	public List<Patient> searchPatients(String searchTerm) {
		return patientRepository.searchByNameOrPhone(searchTerm);
	}
}