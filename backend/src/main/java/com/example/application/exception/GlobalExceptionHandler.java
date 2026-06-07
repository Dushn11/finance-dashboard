package com.example.application.exception;

import com.example.application.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleUserAlreadyExists(UserAlreadyExistsException ex) {
        ErrorResponse error = new ErrorResponse(ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors()
            .stream()
            .map(FieldError::getDefaultMessage)
            .findFirst()
            .orElse("Validation error");

        ErrorResponse error = new ErrorResponse(message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        // Handle generic runtime exceptions with appropriate status codes
        String message = ex.getMessage();
        HttpStatus status = HttpStatus.BAD_REQUEST;

        if (message != null && (message.contains("Invalid credentials") || message.contains("Invalid password"))) {
            status = HttpStatus.UNAUTHORIZED;
        } else if (message != null && message.contains("not found")) {
            status = HttpStatus.NOT_FOUND;
        }

        ErrorResponse error = new ErrorResponse(message != null ? message : "An error occurred");
        return ResponseEntity.status(status).body(error);
    }
}
