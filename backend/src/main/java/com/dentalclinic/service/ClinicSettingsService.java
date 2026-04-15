package com.dentalclinic.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dentalclinic.dto.ClinicSettingsDTO;
import com.dentalclinic.model.ClinicSettings;
import com.dentalclinic.repository.ClinicSettingsRepository;

/**
 * Business logic for clinic settings (single-row configuration table).
 *
 * <p>The settings table is always guaranteed to contain exactly one row.
 * {@link #getSettings()} creates and persists a default row if none exists,
 * so callers never need to handle a null/empty result.
 */
@Service
public class ClinicSettingsService {

    @Autowired
    private ClinicSettingsRepository settingsRepository;

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Returns the singleton settings row.
     *
     * <p>If no row exists (e.g. on a fresh database that somehow missed the
     * Flyway seed), a default row is created and persisted before returning.
     *
     * @return The (only) {@link ClinicSettings} row — never {@code null}
     */
    @Transactional
    public ClinicSettings getSettings() {
        List<ClinicSettings> all = settingsRepository.findAll();
        if (all.isEmpty()) {
            ClinicSettings defaults = buildDefaultSettings();
            return settingsRepository.save(defaults);
        }
        return all.get(0);
    }

    /**
     * Updates the clinic settings from the supplied DTO.
     *
     * <p>Validation rules:
     * <ul>
     *   <li>{@code tncnRate} must be in the closed interval [0.0000, 1.0000].
     *       Values outside this range throw {@link IllegalArgumentException}.</li>
     *   <li>All string fields may be {@code null} or blank (the S1a-HKD form
     *       degrades gracefully with placeholder dots).</li>
     * </ul>
     *
     * @param dto Updated settings values
     * @return The persisted, updated {@link ClinicSettings}
     * @throws IllegalArgumentException if {@code tncnRate} is out of range
     */
    @Transactional
    public ClinicSettings updateSettings(ClinicSettingsDTO dto) {
        // Validate TNCN rate
        if (dto.getTncnRate() != null) {
            BigDecimal rate = dto.getTncnRate();
            if (rate.compareTo(BigDecimal.ZERO) < 0 || rate.compareTo(BigDecimal.ONE) > 0) {
                throw new IllegalArgumentException(
                        "Tỷ lệ thuế TNCN phải nằm trong khoảng [0.0000, 1.0000]. "
                        + "Giá trị nhận được: " + rate);
            }
        }

        ClinicSettings existing = getSettings();

        // Apply updates (null values leave the existing field unchanged)
        if (dto.getBusinessName() != null) existing.setBusinessName(dto.getBusinessName());
        if (dto.getOwnerName()    != null) existing.setOwnerName(dto.getOwnerName());
        if (dto.getAddress()      != null) existing.setAddress(dto.getAddress());
        if (dto.getTaxId()        != null) existing.setTaxId(dto.getTaxId());
        if (dto.getBusinessAddress() != null) existing.setBusinessAddress(dto.getBusinessAddress());
        if (dto.getCurrencyUnit() != null) existing.setCurrencyUnit(dto.getCurrencyUnit());
        if (dto.getTncnRate()     != null) existing.setTncnRate(dto.getTncnRate());

        existing.setUpdatedAt(LocalDateTime.now());
        return settingsRepository.save(existing);
    }

    /**
     * Convenience method: converts a {@link ClinicSettings} entity to a DTO.
     *
     * @param entity Source entity
     * @return Corresponding DTO
     */
    public ClinicSettingsDTO toDTO(ClinicSettings entity) {
        return new ClinicSettingsDTO(
                entity.getId(),
                entity.getBusinessName(),
                entity.getOwnerName(),
                entity.getAddress(),
                entity.getTaxId(),
                entity.getBusinessAddress(),
                entity.getCurrencyUnit(),
                entity.getTncnRate()
        );
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private ClinicSettings buildDefaultSettings() {
        ClinicSettings s = new ClinicSettings();
        s.setBusinessName("");
        s.setOwnerName("");
        s.setAddress("");
        s.setTaxId("");
        s.setBusinessAddress("");
        s.setCurrencyUnit("VNĐ");
        s.setTncnRate(new BigDecimal("0.0200"));
        s.setCreatedAt(LocalDateTime.now());
        s.setUpdatedAt(LocalDateTime.now());
        return s;
    }
}
