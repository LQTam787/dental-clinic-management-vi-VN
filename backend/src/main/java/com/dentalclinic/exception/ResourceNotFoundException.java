package com.dentalclinic.exception;

/**
 * Custom exception thrown when a requested resource (Patient or Appointment) is not found.
 * This exception will be caught by exception handlers in future sessions to return
 * proper HTTP 404 responses.
 */
public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
