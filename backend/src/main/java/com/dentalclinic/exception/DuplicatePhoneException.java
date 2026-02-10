package com.dentalclinic.exception;

/**
 * Custom exception thrown when attempting to create or update a patient with a
 * phone number that already exists in the database.
 *
 * This exception is caught by GlobalExceptionHandler and returns HTTP 409
 * Conflict status with a user-friendly error message.
 *
 * FIX FOR TEST 1.5: Proper exception handling for duplicate phone numbers
 */
public class DuplicatePhoneException extends RuntimeException {

	/**
	 * Constructor with error message
	 * 
	 * @param message The error message to display to the user
	 */
	public DuplicatePhoneException(String message) {
		super(message);
	}

	/**
	 * Constructor with error message and cause
	 * 
	 * @param message The error message to display to the user
	 * @param cause   The underlying cause of the exception
	 */
	public DuplicatePhoneException(String message, Throwable cause) {
		super(message, cause);
	}
}