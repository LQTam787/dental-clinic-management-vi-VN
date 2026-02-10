package com.dentalclinic.controller;

import com.dentalclinic.dto.AppointmentWithPatientDTO;
import com.dentalclinic.exception.ResourceNotFoundException;
import com.dentalclinic.model.Appointment;
import com.dentalclinic.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Appointment operations
 * Base URL: /api/appointments
 * 
 * Provides CRUD operations for appointment management:
 * - GET all appointments
 * - GET appointment by ID
 * - POST create new appointment
 * - PUT update existing appointment
 * - DELETE remove appointment
 * - GET appointments with patient data (primary UI endpoint)
 */
@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173") // React dev server (Vite)
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    /**
     * GET /api/appointments
     * Retrieve all appointments
     * 
     * @return List of all appointments
     */
    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        List<Appointment> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(appointments);
    }

    /**
     * GET /api/appointments/{id}
     * Retrieve a single appointment by ID
     * 
     * @param id Appointment ID
     * @return Appointment object
     * @throws ResourceNotFoundException if appointment not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        Appointment appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointment);
    }

    /**
     * POST /api/appointments
     * Create a new appointment
     * 
     * Request body should include patient ID:
     * {
     *   "date": "2024-03-20",
     *   "diagnosis": "Cavity",
     *   "treatment": "Filling",
     *   "needsImplant": false,
     *   "needsDenture": false,
     *   "needsOrthodontics": false,
     *   "fee": 150.00,
     *   "note": "Follow-up needed",
     *   "patient": { "id": 1 }
     * }
     * 
     * @param appointment Appointment object (without ID, but with patient.id)
     * @return Created appointment with generated ID
     * @throws ResourceNotFoundException if patient not found
     */
    @PostMapping
    public ResponseEntity<Appointment> createAppointment(@RequestBody Appointment appointment) {
        Appointment createdAppointment = appointmentService.createAppointment(appointment);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAppointment);
    }

    /**
     * PUT /api/appointments/{id}
     * Update an existing appointment
     * 
     * Note: Cannot change the patient of an existing appointment
     * 
     * @param id Appointment ID to update
     * @param appointmentDetails Updated appointment data
     * @return Updated appointment object
     * @throws ResourceNotFoundException if appointment not found
     */
    @PutMapping("/{id}")
    public ResponseEntity<Appointment> updateAppointment(
            @PathVariable Long id, 
            @RequestBody Appointment appointmentDetails) {
        Appointment updatedAppointment = appointmentService.updateAppointment(id, appointmentDetails);
        return ResponseEntity.ok(updatedAppointment);
    }

    /**
     * DELETE /api/appointments/{id}
     * Delete an appointment
     * 
     * @param id Appointment ID to delete
     * @return 204 No Content
     * @throws ResourceNotFoundException if appointment not found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/appointments/with-patients
     * PRIMARY UI ENDPOINT
     * 
     * Retrieve appointments joined with patient data with optional filtering
     * 
     * Query Parameters (all optional):
     * - search: Filter by patient name OR phone (case-insensitive, partial match)
     * - needsImplant: Filter by implant requirement (true/false)
     * - needsDenture: Filter by denture requirement (true/false)
     * - needsOrthodontics: Filter by orthodontics requirement (true/false)
     * 
     * Examples:
     * - GET /api/appointments/with-patients
     * - GET /api/appointments/with-patients?search=John
     * - GET /api/appointments/with-patients?needsImplant=true
     * - GET /api/appointments/with-patients?search=Jane&needsOrthodontics=true
     * 
     * @param search Search term for patient name or phone
     * @param needsImplant Filter for implant requirement
     * @param needsDenture Filter for denture requirement
     * @param needsOrthodontics Filter for orthodontics requirement
     * @return List of appointments with patient data (DTOs)
     */
    @GetMapping("/with-patients")
    public ResponseEntity<List<AppointmentWithPatientDTO>> getAppointmentsWithPatients(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean needsImplant,
            @RequestParam(required = false) Boolean needsDenture,
            @RequestParam(required = false) Boolean needsOrthodontics) {
        
        List<AppointmentWithPatientDTO> appointments = appointmentService.getAppointmentsWithPatients(
            search, needsImplant, needsDenture, needsOrthodontics);
        
        return ResponseEntity.ok(appointments);
    }
}
