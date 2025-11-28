package com.academic.erp.backend.exception;

import com.academic.erp.backend.config.DatabaseInitializationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.InvalidDataAccessResourceUsageException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClientException;

import java.sql.SQLException;
import java.sql.SQLSyntaxErrorException;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @Autowired
    private DatabaseInitializationService databaseInitializationService;

    // Handle validation errors (DTO @Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(err ->
                errors.put(err.getField(), err.getDefaultMessage())
        );

        response.put("message", "Validation failed");
        response.put("errors", errors);
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // Handle HTTP client errors (4xx)
    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<Map<String, String>> handleHttpClientError(HttpClientErrorException ex) {
        log.warn("HTTP client error: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", "Authentication failed. Please try again.");
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    // Handle HTTP server errors (5xx from external services)
    @ExceptionHandler(HttpServerErrorException.class)
    public ResponseEntity<Map<String, String>> handleHttpServerError(HttpServerErrorException ex) {
        log.error("HTTP server error from external service: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", "External service error. Please try again later.");
        return new ResponseEntity<>(error, HttpStatus.BAD_GATEWAY);
    }

    // Handle REST client exceptions
    @ExceptionHandler(RestClientException.class)
    public ResponseEntity<Map<String, String>> handleRestClientError(RestClientException ex) {
        log.error("REST client error: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", "Service temporarily unavailable. Please try again.");
        return new ResponseEntity<>(error, HttpStatus.SERVICE_UNAVAILABLE);
    }

    // Handle IllegalArgumentException
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Illegal argument: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        String message = ex.getMessage();
        String userFriendlyMessage;
        
        if (message == null || message.isEmpty()) {
            userFriendlyMessage = "Invalid request. Please check your input and try again.";
        } else {
            String lowerMessage = message.toLowerCase();
            
            // StudentId mismatch
            if (lowerMessage.contains("studentid") || lowerMessage.contains("does not match")) {
                userFriendlyMessage = "There was a mismatch in the student information. Please refresh the page and try again.";
            }
            // Invalid degree/department
            else if (lowerMessage.contains("invalid degree")) {
                userFriendlyMessage = "The program name must include a valid degree type (B.Tech, M.Tech, IM.Tech, M.Sc, or Ph.D). " +
                    "Examples: 'Bachelor of Technology in CSE', 'B.Tech CSE', 'Master of Technology in ECE'. Please update the program name to include one of these degree types.";
            } else if (lowerMessage.contains("unknown department")) {
                userFriendlyMessage = "The program name must include a recognized department (CSE, ECE, or AIDS). " +
                    "Examples: 'Bachelor of Technology in CSE', 'B.Tech ECE', 'M.Tech AIDS'. Please update the program name to include one of these departments.";
            }
            // Default: use message if it's already user-friendly
            else {
                userFriendlyMessage = message;
            }
        }
        
        error.put("error", userFriendlyMessage);
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    // Handle EntityNotFoundException
    @ExceptionHandler(jakarta.persistence.EntityNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleEntityNotFound(jakarta.persistence.EntityNotFoundException ex) {
        log.warn("Entity not found: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        String message = ex.getMessage();
        String userFriendlyMessage;
        
        if (message == null || message.isEmpty()) {
            userFriendlyMessage = "The requested resource could not be found. Please check your input and try again.";
        } else {
            String lowerMessage = message.toLowerCase();
            
            // Specific entity type detection
            if (lowerMessage.contains("student")) {
                userFriendlyMessage = "The requested student could not be found. Please check the student ID and try again.";
            } else if (lowerMessage.contains("domain")) {
                userFriendlyMessage = "The requested domain could not be found. Please check the domain ID and try again.";
            } else {
                userFriendlyMessage = "The requested resource could not be found. Please verify the information and try again.";
            }
        }
        
        error.put("error", userFriendlyMessage);
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    // Handle InvalidDataAccessResourceUsageException (table doesn't exist, schema issues, etc.)
    @ExceptionHandler(InvalidDataAccessResourceUsageException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidDataAccessResourceUsage(InvalidDataAccessResourceUsageException ex) {
        log.error("Database resource usage exception: {}", ex.getMessage(), ex);
        
        Map<String, Object> error = new HashMap<>();
        String message = ex.getMessage();
        String userFriendlyMessage;
        String suggestion = null;
        
        // Extract root cause if available
        Throwable rootCause = ex.getRootCause();
        String rootCauseMessage = rootCause != null ? rootCause.getMessage() : null;
        
        // Check for specific database errors
        if (message != null || rootCauseMessage != null) {
            String combinedMessage = (message != null ? message : "") + " " + (rootCauseMessage != null ? rootCauseMessage : "");
            
            if (combinedMessage.contains("Table") && combinedMessage.contains("doesn't exist")) {
                // Automatically try to create missing tables
                log.info("Detected missing tables, attempting to create them automatically...");
                boolean created = databaseInitializationService.createMissingTablesOnDemand();
                
                if (created) {
                    userFriendlyMessage = "Database tables have been created successfully. Please refresh the page.";
                    suggestion = "Tables were created successfully. Refresh the page to continue.";
                } else {
                    userFriendlyMessage = "Database tables are being created. Please wait a moment and try again.";
                    suggestion = "The system is attempting to create tables. If this persists, restart the application.";
                }
            } else if (combinedMessage.contains("Unknown database") || 
                      (combinedMessage.contains("database") && combinedMessage.contains("doesn't exist"))) {
                userFriendlyMessage = "Database connection issue. Please check your database configuration.";
                suggestion = "Ensure the database exists and connection settings are correct.";
            } else if (combinedMessage.contains("Access denied") || combinedMessage.contains("denied")) {
                userFriendlyMessage = "Database access denied. Please check your credentials.";
                suggestion = "Verify your database username and password.";
            } else if (combinedMessage.contains("Connection") && 
                      (combinedMessage.contains("refused") || combinedMessage.contains("timeout"))) {
                userFriendlyMessage = "Cannot connect to database. Please ensure MySQL server is running.";
                suggestion = "Check if the database server is running and accessible.";
            } else if (combinedMessage.contains("SQL syntax") || combinedMessage.contains("syntax error")) {
                userFriendlyMessage = "SQL syntax error detected.";
                suggestion = "There may be an issue with the database schema or a query. Please check the application logs for details.";
            } else {
                userFriendlyMessage = "Database error occurred. Please try again.";
                suggestion = "If the problem persists, check your database configuration.";
            }
        } else {
            userFriendlyMessage = "Database error occurred. Please try again.";
            suggestion = "The system is attempting to resolve this automatically.";
        }
        
        error.put("error", userFriendlyMessage);
        if (suggestion != null) {
            error.put("suggestion", suggestion);
        }
        error.put("type", "DATABASE_RESOURCE_ERROR");
        
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Handle data integrity violations (duplicate keys, unique constraints, etc.)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.warn("Data integrity violation: {}", ex.getMessage());
        Map<String, Object> error = new HashMap<>();
        
        String message = ex.getMessage();
        String rootCauseMessage = ex.getRootCause() != null ? ex.getRootCause().getMessage() : null;
        String combinedMessage = ((message != null ? message : "") + " " + (rootCauseMessage != null ? rootCauseMessage : "")).toLowerCase();
        
        String userFriendlyMessage;
        HttpStatus status;
        
        // Check for duplicate email constraint
        if (combinedMessage.contains("email") && (combinedMessage.contains("duplicate") || combinedMessage.contains("unique") || combinedMessage.contains("key"))) {
            userFriendlyMessage = "A student with this email address already exists. Please use a different email.";
            status = HttpStatus.CONFLICT;
        }
        // Check for duplicate roll number constraint
        else if (combinedMessage.contains("roll_number") && (combinedMessage.contains("duplicate") || combinedMessage.contains("unique") || combinedMessage.contains("key"))) {
            userFriendlyMessage = "A student with this roll number already exists. Please contact the administrator.";
            status = HttpStatus.CONFLICT;
        }
        // Generic unique constraint violation
        else if (combinedMessage.contains("duplicate") || combinedMessage.contains("unique") || combinedMessage.contains("key")) {
            if (combinedMessage.contains("email")) {
                userFriendlyMessage = "A student with this email address already exists. Please use a different email.";
            } else {
                userFriendlyMessage = "This record already exists. Please check your input.";
            }
            status = HttpStatus.CONFLICT;
        }
        // Check constraint violations (capacity, cutoff marks, etc.)
        else if (combinedMessage.contains("check constraint") || combinedMessage.contains("check (capacity")) {
            if (combinedMessage.contains("capacity")) {
                userFriendlyMessage = "Capacity must be between 0 and 150. Please enter a valid capacity value.";
            } else if (combinedMessage.contains("cutoff_marks") || combinedMessage.contains("cutoff marks")) {
                userFriendlyMessage = "Cutoff marks must be between 0 and 100. Please enter a valid cutoff value.";
            } else {
                userFriendlyMessage = "Invalid data value. Please check your input and ensure all values are within the allowed range.";
            }
            status = HttpStatus.BAD_REQUEST;
        }
        // Foreign key constraint
        else if (combinedMessage.contains("foreign key") || combinedMessage.contains("constraint")) {
            userFriendlyMessage = "Cannot complete this operation. The selected domain or related data is invalid.";
            status = HttpStatus.BAD_REQUEST;
        }
        // Other integrity violations
        else {
            userFriendlyMessage = "Data validation error. Please check your input and try again.";
            status = HttpStatus.BAD_REQUEST;
        }
        
        error.put("error", userFriendlyMessage);
        error.put("type", "DATA_INTEGRITY_VIOLATION");
        
        return new ResponseEntity<>(error, status);
    }

    // Handle database access exceptions (table doesn't exist, connection issues, etc.)
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, Object>> handleDataAccessException(DataAccessException ex) {
        log.error("Database access exception: {}", ex.getMessage(), ex);
        Map<String, Object> error = new HashMap<>();
        
        String message = ex.getMessage();
        String userFriendlyMessage;
        String suggestion = null;
        
        // Check for specific database errors
        if (message != null) {
            String lowerMessage = message.toLowerCase();
            
            // Check for duplicate/unique constraint violations (before generic database errors)
            if (lowerMessage.contains("duplicate") || lowerMessage.contains("unique") || lowerMessage.contains("key")) {
                if (lowerMessage.contains("email")) {
                    userFriendlyMessage = "A student with this email address already exists. Please use a different email.";
                    error.put("type", "DUPLICATE_EMAIL");
                    return new ResponseEntity<>(error, HttpStatus.CONFLICT);
                } else if (lowerMessage.contains("roll_number") || lowerMessage.contains("roll number")) {
                    userFriendlyMessage = "A student with this roll number already exists. Please contact the administrator.";
                    error.put("type", "DUPLICATE_ROLL_NUMBER");
                    return new ResponseEntity<>(error, HttpStatus.CONFLICT);
                } else {
                    userFriendlyMessage = "This record already exists. Please check your input.";
                    error.put("type", "DUPLICATE_ENTRY");
                    return new ResponseEntity<>(error, HttpStatus.CONFLICT);
                }
            }
            
            if (lowerMessage.contains("doesn't exist") || (lowerMessage.contains("table") && lowerMessage.contains("doesn't exist"))) {
                userFriendlyMessage = "Database tables are missing.";
                suggestion = "Please run the database schema creation script (create_schema.sql) to set up the required tables.";
            } else if (lowerMessage.contains("unknown database") || (lowerMessage.contains("database") && lowerMessage.contains("doesn't exist"))) {
                userFriendlyMessage = "Database not found. Please ensure the database exists and is properly configured.";
                suggestion = "Create the database: CREATE DATABASE IF NOT EXISTS erp_admission;";
            } else if (lowerMessage.contains("access denied") || lowerMessage.contains("denied")) {
                userFriendlyMessage = "Database access denied. Please check your database credentials.";
                suggestion = "Verify username and password in application.properties";
            } else if (lowerMessage.contains("connection") && (lowerMessage.contains("refused") || lowerMessage.contains("timeout"))) {
                userFriendlyMessage = "Cannot connect to database. Please ensure the database server is running and accessible.";
                suggestion = "Check if MySQL server is running and accessible";
            } else {
                userFriendlyMessage = "Database error occurred. Please check your database configuration and ensure all tables are created.";
            }
        } else {
            userFriendlyMessage = "Database error occurred. Please check your database configuration.";
        }
        
        error.put("error", userFriendlyMessage);
        if (suggestion != null) {
            error.put("suggestion", suggestion);
        }
        error.put("type", "DATABASE_ERROR");
        
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Handle SQL syntax exceptions specifically
    @ExceptionHandler(SQLSyntaxErrorException.class)
    public ResponseEntity<Map<String, Object>> handleSQLSyntaxException(SQLSyntaxErrorException ex) {
        log.error("SQL syntax error: {} [SQLState: {}, ErrorCode: {}]", 
                 ex.getMessage(), ex.getSQLState(), ex.getErrorCode(), ex);
        
        Map<String, Object> error = new HashMap<>();
        String message = ex.getMessage();
        String userFriendlyMessage;
        String suggestion = null;
        
        if (message != null) {
            if (message.contains("Table") && message.contains("doesn't exist")) {
                String tableName = extractTableName(message);
                userFriendlyMessage = "Table" + (tableName != null ? " '" + tableName + "'" : "") + " does not exist.";
                suggestion = "The required database table is missing. Please initialize the database schema.";
            } else if (message.contains("Unknown database")) {
                userFriendlyMessage = "Database not found.";
                suggestion = "Create the database: CREATE DATABASE IF NOT EXISTS erp_admission;";
            } else {
                userFriendlyMessage = "A database syntax error occurred. Please contact the administrator if this issue persists.";
                suggestion = "Please check the SQL query or database schema.";
            }
        } else {
            userFriendlyMessage = "SQL syntax error occurred.";
        }
        
        error.put("error", userFriendlyMessage);
        if (suggestion != null) {
            error.put("suggestion", suggestion);
        }
        error.put("type", "SQL_SYNTAX_ERROR");
        error.put("sqlState", ex.getSQLState());
        error.put("errorCode", ex.getErrorCode());
        
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Handle SQL exceptions
    @ExceptionHandler(SQLException.class)
    public ResponseEntity<Map<String, Object>> handleSQLException(SQLException ex) {
        log.error("SQL exception: {} [SQLState: {}, ErrorCode: {}]", 
                 ex.getMessage(), ex.getSQLState(), ex.getErrorCode(), ex);
        
        Map<String, Object> error = new HashMap<>();
        String message = ex.getMessage();
        String userFriendlyMessage;
        String suggestion = null;
        
        if (message != null) {
            String lowerMessage = message.toLowerCase();
            
            // Check for duplicate/unique constraint violations
            if (lowerMessage.contains("duplicate") || lowerMessage.contains("unique") || 
                (ex.getErrorCode() == 1062 && lowerMessage.contains("key"))) {
                // MySQL error code 1062 is for duplicate entry
                if (lowerMessage.contains("email")) {
                    error.put("error", "A student with this email address already exists. Please use a different email.");
                    error.put("type", "DUPLICATE_EMAIL");
                    return new ResponseEntity<>(error, HttpStatus.CONFLICT);
                } else if (lowerMessage.contains("roll_number") || lowerMessage.contains("roll number")) {
                    error.put("error", "A student with this roll number already exists. Please contact the administrator.");
                    error.put("type", "DUPLICATE_ROLL_NUMBER");
                    return new ResponseEntity<>(error, HttpStatus.CONFLICT);
                } else {
                    error.put("error", "This record already exists. Please check your input.");
                    error.put("type", "DUPLICATE_ENTRY");
                    return new ResponseEntity<>(error, HttpStatus.CONFLICT);
                }
            }
            
            if (lowerMessage.contains("doesn't exist") || (lowerMessage.contains("table") && lowerMessage.contains("doesn't exist"))) {
                userFriendlyMessage = "Database tables are missing.";
                suggestion = "Please run the database schema creation script (create_schema.sql) to set up the required tables.";
            } else if (lowerMessage.contains("unknown database")) {
                userFriendlyMessage = "Database not found. Please ensure the database exists and is properly configured.";
                suggestion = "Create the database: CREATE DATABASE IF NOT EXISTS erp_admission;";
            } else {
                userFriendlyMessage = "Database error occurred. Please check your database configuration.";
            }
        } else {
            userFriendlyMessage = "Database error occurred. Please check your database configuration.";
        }
        
        error.put("error", userFriendlyMessage);
        if (suggestion != null) {
            error.put("suggestion", suggestion);
        }
        error.put("type", "SQL_ERROR");
        error.put("sqlState", ex.getSQLState());
        error.put("errorCode", ex.getErrorCode());
        
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Handle custom + generic runtime errors
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException ex) {
        log.error("Runtime exception: {}", ex.getMessage(), ex);
        Map<String, String> error = new HashMap<>();
        String message = ex.getMessage();
        String userFriendlyMessage;
        
        if (message == null || message.isEmpty()) {
            userFriendlyMessage = "An error occurred. Please try again.";
        } else {
            String lowerMessage = message.toLowerCase();
            
            // Student-related errors
            if (lowerMessage.contains("student not found")) {
                userFriendlyMessage = "The requested student could not be found. Please check the student ID and try again.";
            }
            // Domain-related errors
            else if (lowerMessage.contains("domain not found")) {
                userFriendlyMessage = "The requested domain could not be found. Please check the domain ID and try again.";
            }
            // Seat capacity errors
            else if (lowerMessage.contains("seat range exhausted") || lowerMessage.contains("capacity") || lowerMessage.contains("no seats available")) {
                userFriendlyMessage = "This domain has reached its maximum capacity. No more students can be admitted at this time.";
            }
            // Invalid domain ID
            else if (lowerMessage.contains("invalid domain")) {
                userFriendlyMessage = "The selected domain is invalid. Please select a valid domain.";
            }
            // OAuth/Authentication errors
            else if (lowerMessage.contains("authentication failed") || lowerMessage.contains("oauth error") || 
                     lowerMessage.contains("invalid authorization code") || lowerMessage.contains("invalid token")) {
                userFriendlyMessage = "Authentication failed. Please try logging in again.";
            }
            // Service unavailable errors
            else if (lowerMessage.contains("service temporarily unavailable") || lowerMessage.contains("service unavailable")) {
                userFriendlyMessage = "Service is temporarily unavailable. Please try again in a few moments.";
            }
            // Database table creation errors
            else if (lowerMessage.contains("failed to create database tables") || lowerMessage.contains("database tables")) {
                userFriendlyMessage = "Database initialization is in progress. Please wait a moment and try again.";
            }
            // Default: use the original message if it's already user-friendly, otherwise provide generic message
            else {
                // Check if message looks technical (contains class names, stack trace keywords, etc.)
                if (lowerMessage.contains("exception") || lowerMessage.contains("error") || 
                    lowerMessage.contains("failed") || lowerMessage.contains("unable")) {
                    userFriendlyMessage = "An error occurred while processing your request. Please try again or contact support if the issue persists.";
                } else {
                    // Message seems user-friendly already
                    userFriendlyMessage = message;
                }
            }
        }
        
        error.put("error", userFriendlyMessage);
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    // Fallback — unexpected errors (should rarely happen with proper handling above)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception ex) {
        log.error("Unexpected exception: {}", ex.getMessage(), ex);
        Map<String, String> error = new HashMap<>();
        error.put("error", "An unexpected error occurred. Please try again.");
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Helper method to extract table name from error message
     * @param message Error message containing table name
     * @return Extracted table name or null if not found
     */
    private String extractTableName(String message) {
        if (message == null) {
            return null;
        }
        
        // Pattern: Table 'database.table' doesn't exist
        int tableIndex = message.indexOf("Table '");
        if (tableIndex != -1) {
            int start = tableIndex + 7; // Length of "Table '"
            int end = message.indexOf("'", start);
            if (end != -1) {
                String tableRef = message.substring(start, end);
                // If it contains a dot, extract just the table name
                int dotIndex = tableRef.lastIndexOf('.');
                if (dotIndex != -1) {
                    return tableRef.substring(dotIndex + 1);
                }
                return tableRef;
            }
        }
        
        // Pattern: Table table_name doesn't exist
        if (message.contains("Table") && message.contains("doesn't exist")) {
            String[] parts = message.split("Table");
            if (parts.length > 1) {
                String afterTable = parts[1].trim();
                String[] words = afterTable.split("\\s+");
                if (words.length > 0) {
                    String potentialTable = words[0].replace("'", "").replace("`", "");
                    if (!potentialTable.isEmpty() && !potentialTable.equals("doesn't")) {
                        return potentialTable;
                    }
                }
            }
        }
        
        return null;
    }
}
