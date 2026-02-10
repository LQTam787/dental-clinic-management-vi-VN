package com.dentalclinic.controller;

import com.dentalclinic.exception.ResourceNotFoundException;
import com.dentalclinic.model.Patient;
import com.dentalclinic.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Patient operations
 * Base URL: /api/patients
 * 
 * Provides CRUD operations for patient management:
 * - GET all patients
 * - GET patient by ID
 * - POST create new patient
 * - PUT update existing patient
 * - DELETE remove patient
 */
@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "http://localhost:5173") // React dev server (Vite)
public class PatientController {

    @Autowired
    private PatientService patientService;

    /**
     * GET /api/patients
     * Retrieve all patients
     * 
     * @return List of all patients
     */
    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients() {
        List<Patient> patients = patientService.getAllPatients();
        return ResponseEntity.ok(patients);
    }

    /**
     * GET /api/patients/{id}
     * Retrieve a single patient by ID
     * 
     * @param id Patient ID
     * @return Patient object
     * @throws ResourceNotFoundException if patient not found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        Patient patient = patientService.getPatientById(id);
        return ResponseEntity.ok(patient);
    }

    /**
     * POST /api/patients
     * Create a new patient
     * 
     * @param patient Patient object (without ID)
     * @return Created patient with generated ID
     */
    @PostMapping
    public ResponseEntity<Patient> createPatient(@RequestBody Patient patient) {
        Patient createdPatient = patientService.createPatient(patient);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPatient);
    }

    /**
     * PUT /api/patients/{id}
     * Update an existing patient
     * 
     * @param id Patient ID to update
     * @param patientDetails Updated patient data
     * @return Updated patient object
     * @throws ResourceNotFoundException if patient not found
     */
    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(
            @PathVariable Long id, 
            @RequestBody Patient patientDetails) {
        Patient updatedPatient = patientService.updatePatient(id, patientDetails);
        return ResponseEntity.ok(updatedPatient);
    }

    /**
     * DELETE /api/patients/{id}
     * Delete a patient (cascades to appointments)
     * 
     * @param id Patient ID to delete
     * @return 204 No Content
     * @throws ResourceNotFoundException if patient not found
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }
}
