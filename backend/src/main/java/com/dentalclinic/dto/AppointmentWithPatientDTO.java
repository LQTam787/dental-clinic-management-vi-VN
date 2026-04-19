package com.dentalclinic.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Data Transfer Object (DTO) that combines Appointment and Patient data.
 * Used for the main UI view where we need to display appointments with patient information.
 * 
 * This DTO is used with JPQL constructor expressions to efficiently fetch joined data
 * without the N+1 query problem.
 */
public class AppointmentWithPatientDTO {
    
    // Appointment fields
    private Long appointmentId;
    private LocalDate date;
    private String diagnosis;
    private String treatment;
    private Boolean needsImplant;
    private Boolean needsDenture;
    private Boolean needsOrthodontics;
    private Boolean isBeauty;
    private BigDecimal fee;
    private String note;
    
    // Patient fields
    private Long patientId;
    private String patientName;
    private Integer birthYear;
    private String gender;
    private String phone;
    private String address;
    
    /**
     * All-args constructor required for JPQL constructor expression.
     * This constructor is called directly in the @Query annotation in AppointmentRepository.
     * 
     * Parameter order MUST match the order in the JPQL SELECT statement.
     */
    public AppointmentWithPatientDTO(
            Long appointmentId, LocalDate date, String diagnosis, String treatment,
            Boolean needsImplant, Boolean needsDenture, Boolean needsOrthodontics,
            Boolean isBeauty, BigDecimal fee, String note,
            Long patientId, String patientName, Integer birthYear,
            String gender, String phone, String address) {
        this.appointmentId = appointmentId;
        this.date = date;
        this.diagnosis = diagnosis;
        this.treatment = treatment;
        this.needsImplant = needsImplant;
        this.needsDenture = needsDenture;
        this.needsOrthodontics = needsOrthodontics;
        this.isBeauty = isBeauty;
        this.fee = fee;
        this.note = note;
        this.patientId = patientId;
        this.patientName = patientName;
        this.birthYear = birthYear;
        this.gender = gender;
        this.phone = phone;
        this.address = address;
    }
    
    // Getters and Setters
    
    public Long getAppointmentId() {
        return appointmentId;
    }
    
    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }
    
    public LocalDate getDate() {
        return date;
    }
    
    public void setDate(LocalDate date) {
        this.date = date;
    }
    
    public String getDiagnosis() {
        return diagnosis;
    }
    
    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }
    
    public String getTreatment() {
        return treatment;
    }
    
    public void setTreatment(String treatment) {
        this.treatment = treatment;
    }
    
    public Boolean getNeedsImplant() {
        return needsImplant;
    }
    
    public void setNeedsImplant(Boolean needsImplant) {
        this.needsImplant = needsImplant;
    }
    
    public Boolean getNeedsDenture() {
        return needsDenture;
    }
    
    public void setNeedsDenture(Boolean needsDenture) {
        this.needsDenture = needsDenture;
    }
    
    public Boolean getNeedsOrthodontics() {
        return needsOrthodontics;
    }
    
    public void setNeedsOrthodontics(Boolean needsOrthodontics) {
        this.needsOrthodontics = needsOrthodontics;
    }

    public Boolean getIsBeauty() {
        return isBeauty;
    }

    public void setIsBeauty(Boolean isBeauty) {
        this.isBeauty = isBeauty;
    }

    public BigDecimal getFee() {
        return fee;
    }
    
    public void setFee(BigDecimal fee) {
        this.fee = fee;
    }
    
    public String getNote() {
        return note;
    }
    
    public void setNote(String note) {
        this.note = note;
    }
    
    public Long getPatientId() {
        return patientId;
    }
    
    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }
    
    public String getPatientName() {
        return patientName;
    }
    
    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }
    
    public Integer getBirthYear() {
        return birthYear;
    }
    
    public void setBirthYear(Integer birthYear) {
        this.birthYear = birthYear;
    }
    
    public String getGender() {
        return gender;
    }
    
    public void setGender(String gender) {
        this.gender = gender;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getAddress() {
        return address;
    }
    
    public void setAddress(String address) {
        this.address = address;
    }
    
    @Override
    public String toString() {
        return "AppointmentWithPatientDTO{" +
                "appointmentId=" + appointmentId +
                ", date=" + date +
                ", patientName='" + patientName + '\'' +
                ", phone='" + phone + '\'' +
                ", diagnosis='" + diagnosis + '\'' +
                ", treatment='" + treatment + '\'' +
                ", isBeauty=" + isBeauty +
                ", fee=" + fee +
                '}';
    }
}
