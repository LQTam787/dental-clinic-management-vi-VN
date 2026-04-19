package com.dentalclinic.service;

import com.dentalclinic.dto.AppointmentWithPatientDTO;
import com.dentalclinic.exception.ResourceNotFoundException;
import com.dentalclinic.model.Appointment;
import com.dentalclinic.model.Patient;
import com.dentalclinic.repository.AppointmentRepository;
import com.dentalclinic.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service layer for Appointment operations.
 * Contains business logic for managing appointments and provides the main data for the UI.
 */
@Service
@Transactional
public class AppointmentService {
    
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    
    /**
     * Constructor injection.
     * We need both repositories because appointments reference patients.
     */
    @Autowired
    public AppointmentService(AppointmentRepository appointmentRepository, 
                             PatientRepository patientRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
    }
    
    /**
     * Get all appointments.
     * 
     * Note: This returns Appointment entities, not the joined DTO.
     * For the UI, use getAppointmentsWithPatients() instead.
     * 
     * @return List of all appointments
     */
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
    
    /**
     * Get a single appointment by ID.
     * 
     * @param id The appointment ID
     * @return The appointment if found
     * @throws ResourceNotFoundException if appointment doesn't exist
     */
    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
    }
    
    /**
     * Create a new appointment.
     * 
     * Business rules enforced:
     * 1. The patient must exist (we verify this before saving)
     * 2. The patient reference is properly set
     * 
     * Future enhancements:
     * - Validate appointment date is not in the past
     * - Check for scheduling conflicts (same patient, same day)
     * - Validate fee is non-negative
     * - Auto-calculate treatment needs based on diagnosis
     * 
     * @param appointment The appointment to create (id should be null)
     * @return The created appointment with generated ID
     * @throws ResourceNotFoundException if the patient doesn't exist
     */
    public Appointment createAppointment(Appointment appointment) {
        // Verify that the patient exists
        // This prevents appointments being created for non-existent patients
        Patient patient = patientRepository.findById(appointment.getPatient().getId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Cannot create appointment: Patient not found with id: " + appointment.getPatient().getId()));
        
        // Set the patient reference (ensures relationship is properly established)
        appointment.setPatient(patient);
        
        return appointmentRepository.save(appointment);
    }
    
    /**
     * Update an existing appointment.
     * 
     * Note: We don't allow changing the patient for an existing appointment.
     * This is a business decision - if you need to change the patient,
     * delete this appointment and create a new one.
     * 
     * This prevents accidentally moving appointment history between patients.
     * 
     * @param id The appointment ID to update
     * @param appointmentDetails The new appointment data
     * @return The updated appointment
     * @throws ResourceNotFoundException if appointment doesn't exist
     */
    public Appointment updateAppointment(Long id, Appointment appointmentDetails) {
        Appointment appointment = getAppointmentById(id);
        
        // Update all fields EXCEPT patient and ID
        appointment.setDate(appointmentDetails.getDate());
        appointment.setDiagnosis(appointmentDetails.getDiagnosis());
        appointment.setTreatment(appointmentDetails.getTreatment());
        appointment.setNeedsImplant(appointmentDetails.getNeedsImplant());
        appointment.setNeedsDenture(appointmentDetails.getNeedsDenture());
        appointment.setNeedsOrthodontics(appointmentDetails.getNeedsOrthodontics());
        appointment.setIsBeauty(appointmentDetails.getIsBeauty());
        appointment.setFee(appointmentDetails.getFee());
        appointment.setNote(appointmentDetails.getNote());
        
        // Note: We're NOT updating appointment.patient here
        // The patient association is immutable after creation
        
        return appointmentRepository.save(appointment);
    }
    
    /**
     * Delete an appointment by ID.
     * 
     * Unlike deleting a patient (which cascades to appointments),
     * deleting an appointment does NOT delete the patient.
     * 
     * @param id The appointment ID to delete
     * @throws ResourceNotFoundException if appointment doesn't exist
     */
    public void deleteAppointment(Long id) {
        Appointment appointment = getAppointmentById(id);
        appointmentRepository.delete(appointment);
    }
    
    /**
     * Get all appointments for a specific patient.
     * Useful for viewing patient history.
     * 
     * @param patientId The patient's ID
     * @return List of appointments for that patient
     */
    public List<Appointment> getAppointmentsByPatientId(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }
    
    /**
     * PRIMARY METHOD FOR THE UI - Get appointments with patient data and optional filtering.
     * 
     * This is the most important method in the service layer.
     * It's used by the main UI to display the appointment table with:
     * - All appointment details
     * - All patient details
     * - Optional filtering by search term and treatment needs
     * 
     * HOW IT WORKS:
     * 1. Calls the repository's custom JPQL query
     * 2. The query joins appointments with patients in a single database call
     * 3. Returns DTOs (not entities) for efficiency
     * 4. Supports flexible filtering - any/all parameters can be null
     * 
     * USAGE EXAMPLES:
     * 
     * Get all appointments:
     *   getAppointmentsWithPatients(null, null, null, null)
     * 
     * Search by patient name:
     *   getAppointmentsWithPatients("John", null, null, null)
     * 
     * Filter by treatment need:
     *   getAppointmentsWithPatients(null, true, null, null)
     *     → Only appointments needing implants
     * 
     * Combined filters:
     *   getAppointmentsWithPatients("Jane", true, null, true)
     *     → Patient name contains "Jane" AND needs implant AND needs orthodontics
     * 
     * @param search Optional search term (searches patient name and phone)
     * @param needsImplant Optional filter for implant requirement (true/false/null)
     * @param needsDenture Optional filter for denture requirement (true/false/null)
     * @param needsOrthodontics Optional filter for orthodontics requirement (true/false/null)
     * @return List of AppointmentWithPatientDTO matching the criteria
     */
    public List<AppointmentWithPatientDTO> getAppointmentsWithPatients(
            String search, Boolean needsImplant, Boolean needsDenture, Boolean needsOrthodontics) {
        
        return appointmentRepository.findAppointmentsWithPatients(
            search, needsImplant, needsDenture, needsOrthodontics);
    }
}
