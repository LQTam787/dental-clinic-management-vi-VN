package com.dentalclinic.config;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import com.dentalclinic.exception.DuplicatePhoneException;
import com.dentalclinic.exception.ResourceNotFoundException;

/**
 * Global Exception Handler - Vietnamese Localization Support
 *
 * Handles exceptions thrown by controllers and converts them to proper HTTP
 * responses with consistent error format including error codes for frontend localization
 *
 * Error Response Format: 
 * { 
 *   "timestamp": "2026-01-27T10:30:00", 
 *   "status": 404,
 *   "error": "Not Found", 
 *   "errorCode": "RESOURCE_NOT_FOUND",
 *   "message": "Patient not found with id: 5", 
 *   "path": "/api/patients/5" 
 * }
 */
@ControllerAdvice
public class GlobalExceptionHandler {

	/**
	 * Handle ResourceNotFoundException
	 *
	 * Thrown when a patient or appointment is not found by ID Returns HTTP 404 Not
	 * Found
	 *
	 * @param ex      The exception
	 * @param request The web request
	 * @return ResponseEntity with error details
	 */
	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<Object> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {

		Map<String, Object> body = new LinkedHashMap<>();
		body.put("timestamp", LocalDateTime.now());
		body.put("status", HttpStatus.NOT_FOUND.value());
		body.put("error", "Not Found");
		body.put("errorCode", "RESOURCE_NOT_FOUND");
		body.put("message", ex.getMessage());
		body.put("path", request.getDescription(false).replace("uri=", ""));

		return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
	}

	/**
	 * Handle DuplicatePhoneException
	 *
	 * FIX FOR TEST 1.5 Thrown when trying to create/update a patient with an
	 * existing phone number Returns HTTP 409 Conflict with user-friendly message
	 *
	 * @param ex      The exception
	 * @param request The web request
	 * @return ResponseEntity with error details
	 */
	@ExceptionHandler(DuplicatePhoneException.class)
	public ResponseEntity<Object> handleDuplicatePhoneException(DuplicatePhoneException ex, WebRequest request) {

		Map<String, Object> body = new LinkedHashMap<>();
		body.put("timestamp", LocalDateTime.now());
		body.put("status", HttpStatus.CONFLICT.value());
		body.put("error", "Conflict");
		body.put("errorCode", "DUPLICATE_PHONE");
		body.put("message", ex.getMessage());
		body.put("path", request.getDescription(false).replace("uri=", ""));

		return new ResponseEntity<>(body, HttpStatus.CONFLICT);
	}

	/**
	 * Handle DataIntegrityViolationException
	 *
	 * ADDITIONAL FIX FOR TEST 1.5 Catches database constraint violations (like
	 * unique phone constraint) Returns HTTP 409 Conflict
	 *
	 * This is a safety net in case DuplicatePhoneException isn't thrown and the
	 * database constraint is violated directly
	 *
	 * @param ex      The exception
	 * @param request The web request
	 * @return ResponseEntity with error details
	 */
	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<Object> handleDataIntegrityViolationException(DataIntegrityViolationException ex,
			WebRequest request) {

		Map<String, Object> body = new LinkedHashMap<>();
		body.put("timestamp", LocalDateTime.now());
		body.put("status", HttpStatus.CONFLICT.value());
		body.put("error", "Conflict");

		// Check if it's a phone number constraint violation
		String message = ex.getMessage();
		if (message != null && message.toLowerCase().contains("phone")) {
			body.put("errorCode", "DUPLICATE_PHONE");
			body.put("message", "A patient with this phone number already exists");
		} else {
			body.put("errorCode", "DATA_INTEGRITY_VIOLATION");
			body.put("message", "Data integrity violation: " + ex.getMostSpecificCause().getMessage());
		}

		body.put("path", request.getDescription(false).replace("uri=", ""));

		return new ResponseEntity<>(body, HttpStatus.CONFLICT);
	}

	/**
	 * Handle IllegalArgumentException
	 *
	 * Thrown when invalid arguments are provided Returns HTTP 400 Bad Request
	 *
	 * @param ex      The exception
	 * @param request The web request
	 * @return ResponseEntity with error details
	 */
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<Object> handleIllegalArgumentException(IllegalArgumentException ex, WebRequest request) {

		Map<String, Object> body = new LinkedHashMap<>();
		body.put("timestamp", LocalDateTime.now());
		body.put("status", HttpStatus.BAD_REQUEST.value());
		body.put("error", "Bad Request");
		body.put("errorCode", "INVALID_ARGUMENT");
		body.put("message", ex.getMessage());
		body.put("path", request.getDescription(false).replace("uri=", ""));

		return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
	}

	/**
	 * Handle generic exceptions
	 *
	 * Catches any unexpected exceptions that weren't specifically handled Returns
	 * HTTP 500 Internal Server Error
	 *
	 * @param ex      The exception
	 * @param request The web request
	 * @return ResponseEntity with error details
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<Object> handleGlobalException(Exception ex, WebRequest request) {

		Map<String, Object> body = new LinkedHashMap<>();
		body.put("timestamp", LocalDateTime.now());
		body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
		body.put("error", "Internal Server Error");
		body.put("errorCode", "INTERNAL_SERVER_ERROR");
		body.put("message", ex.getMessage());
		body.put("path", request.getDescription(false).replace("uri=", ""));

		return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
	}
}