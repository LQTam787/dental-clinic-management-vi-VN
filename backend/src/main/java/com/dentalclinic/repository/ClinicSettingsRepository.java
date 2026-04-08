package com.dentalclinic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.dentalclinic.model.ClinicSettings;

/**
 * Data-access layer for {@link ClinicSettings}.
 *
 * <p>No custom query methods are needed here — the single-row semantics are
 * handled entirely in {@code ClinicSettingsService}:
 * <ul>
 *   <li>{@link #findAll()} is used to retrieve the singleton row.</li>
 *   <li>{@link #save(Object)} is used to persist updates.</li>
 * </ul>
 */
@Repository
public interface ClinicSettingsRepository extends JpaRepository<ClinicSettings, Long> {
    // All required operations are covered by JpaRepository's default methods.
}
