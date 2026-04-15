package com.dentalclinic.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dentalclinic.dto.ClinicSettingsDTO;
import com.dentalclinic.model.ClinicSettings;
import com.dentalclinic.service.ClinicSettingsService;

/**
 * REST endpoints for clinic business settings.
 *
 * <p>Endpoints:
 * <ul>
 *   <li>{@code GET  /api/settings} — returns the current settings</li>
 *   <li>{@code PUT  /api/settings} — updates settings (partial update supported)</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "http://localhost:5173")
public class ClinicSettingsController {

    @Autowired
    private ClinicSettingsService settingsService;

    /**
     * Returns the clinic's current settings.
     *
     * <p>Creates a default row if none exists (safe to call on a fresh DB).
     *
     * @return HTTP 200 with {@link ClinicSettingsDTO}
     */
    @GetMapping
    public ResponseEntity<ClinicSettingsDTO> getSettings() {
        ClinicSettings settings = settingsService.getSettings();
        return ResponseEntity.ok(settingsService.toDTO(settings));
    }

    /**
     * Updates the clinic settings.
     *
     * <p>Partial updates are supported: any field left {@code null} in the
     * request body retains its existing value. Only the supplied (non-null)
     * fields are overwritten.
     *
     * <p>Validates that {@code tncnRate} (if provided) is in [0.0000, 1.0000];
     * returns HTTP 400 otherwise.
     *
     * @param dto Updated settings values
     * @return HTTP 200 with the updated {@link ClinicSettingsDTO}
     */
    @PutMapping
    public ResponseEntity<ClinicSettingsDTO> updateSettings(@RequestBody ClinicSettingsDTO dto) {
        ClinicSettings updated = settingsService.updateSettings(dto);
        return ResponseEntity.ok(settingsService.toDTO(updated));
    }
}
