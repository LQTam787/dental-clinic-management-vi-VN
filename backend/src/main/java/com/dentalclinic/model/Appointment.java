package com.dentalclinic.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private LocalDate date;

	@Column(length = 500)
	private String diagnosis;

	@Column(length = 500)
	private String treatment;

	@Column(name = "needs_implant")
	private Boolean needsImplant = false;

	@Column(name = "needs_denture")
	private Boolean needsDenture = false;

	@Column(name = "needs_orthodontics")
	private Boolean needsOrthodontics = false;

	@Column(name = "is_beauty")
	private Boolean isBeauty = false;

	@Column(precision = 10, scale = 2)
	private BigDecimal fee;

	@Column(length = 1000)
	private String note;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "patient_id", nullable = false)
	@JsonBackReference
	private Patient patient;
}
