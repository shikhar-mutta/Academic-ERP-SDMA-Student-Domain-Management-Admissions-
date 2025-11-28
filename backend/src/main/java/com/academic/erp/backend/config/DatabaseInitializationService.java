package com.academic.erp.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.hibernate.Session;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashSet;
import java.util.Set;

/**
 * Service to automatically check and create database tables if they don't exist.
 * This service runs after Hibernate initialization and creates missing tables.
 */
@Service
@Slf4j
@Order(1)
public class DatabaseInitializationService {

    @PersistenceContext
    private EntityManager entityManager;

    private static final Set<String> REQUIRED_TABLES = Set.of("domains", "students");

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initializeDatabase() {
        try {
            log.info("Checking database tables...");
            
            // Get connection from EntityManager
            Session session = entityManager.unwrap(Session.class);
            
            // Check which tables exist
            Set<String> existingTables = getExistingTables(session);
            Set<String> missingTables = new HashSet<>(REQUIRED_TABLES);
            missingTables.removeAll(existingTables);
            
            if (missingTables.isEmpty()) {
                log.info("All required database tables exist: {}", existingTables);
                return;
            }
            
            log.warn("Missing database tables detected: {}", missingTables);
            log.info("Attempting to create missing tables...");
            
            // Create tables using direct SQL
            createMissingTables(session, missingTables);
            
            // Verify tables were created
            Set<String> tablesAfterCreation = getExistingTables(session);
            Set<String> stillMissing = new HashSet<>(missingTables);
            stillMissing.removeAll(tablesAfterCreation);
            
            if (stillMissing.isEmpty()) {
                log.info("Successfully created all missing database tables.");
            } else {
                log.error("Failed to create some tables: {}", stillMissing);
                log.error("Please run the schema creation script: mysql -u root -p < create_schema.sql");
            }
            
        } catch (Exception e) {
            log.error("Error during database initialization: {}", e.getMessage(), e);
            log.warn("Database tables may be missing. Please ensure tables are created manually or check application.properties configuration.");
        }
    }

    /**
     * Public method to create missing tables on demand
     * Can be called from exception handlers or controllers
     * Uses REQUIRES_NEW to ensure it runs in a separate transaction
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean createMissingTablesOnDemand() {
        try {
            Session session = entityManager.unwrap(Session.class);
            Set<String> existingTables = getExistingTables(session);
            Set<String> missingTables = new HashSet<>(REQUIRED_TABLES);
            missingTables.removeAll(existingTables);
            
            if (missingTables.isEmpty()) {
                log.info("All required tables already exist");
                return true;
            }
            
            log.info("Creating missing tables on demand: {}", missingTables);
            createMissingTables(session, missingTables);
            
            // Verify creation
            Set<String> tablesAfterCreation = getExistingTables(session);
            Set<String> stillMissing = new HashSet<>(missingTables);
            stillMissing.removeAll(tablesAfterCreation);
            
            if (stillMissing.isEmpty()) {
                log.info("Successfully created all missing tables on demand");
                return true;
            } else {
                log.error("Failed to create some tables: {}", stillMissing);
                return false;
            }
        } catch (Exception e) {
            log.error("Error creating tables on demand: {}", e.getMessage(), e);
            return false;
        }
    }

    private void createMissingTables(Session session, Set<String> missingTables) {
        try {
            Connection connection = session.doReturningWork(conn -> {
                if (conn instanceof Connection) {
                    return (Connection) conn;
                }
                return null;
            });
            
            if (connection == null) {
                log.warn("Could not obtain connection for SQL table creation");
                return;
            }
            
            try (Statement stmt = connection.createStatement()) {
                // Create domains table first (students depends on it)
                if (missingTables.contains("domains")) {
                    String createDomainsSQL = "CREATE TABLE IF NOT EXISTS domains (" +
                            "domain_id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                            "program VARCHAR(120) NOT NULL, " +
                            "batch VARCHAR(255), " +
                            "capacity INT CHECK (capacity >= 0 AND capacity <= 150), " +
                            "exam_name VARCHAR(120), " +
                            "cutoff_marks DECIMAL(5,2) CHECK (cutoff_marks >= 0 AND cutoff_marks <= 100), " +
                            "created_at DATETIME(6), " +
                            "INDEX idx_domain_program (program), " +
                            "INDEX idx_domain_batch (batch)" +
                            ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
                    stmt.execute(createDomainsSQL);
                    log.info("Created 'domains' table");
                }
                
                // Create students table (depends on domains)
                if (missingTables.contains("students")) {
                    String createStudentsSQL = "CREATE TABLE IF NOT EXISTS students (" +
                            "student_id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                            "roll_number VARCHAR(50) UNIQUE, " +
                            "first_name VARCHAR(120) NOT NULL, " +
                            "last_name VARCHAR(120) NOT NULL, " +
                            "email VARCHAR(255) NOT NULL UNIQUE, " +
                            "domain_id BIGINT NOT NULL, " +
                            "join_year INT NOT NULL, " +
                            "exam_marks DECIMAL(5,2) NOT NULL CHECK (exam_marks >= 0 AND exam_marks <= 100), " +
                            "is_active BIT NOT NULL DEFAULT 1, " +
                            "created_at DATETIME(6), " +
                            "FOREIGN KEY (domain_id) REFERENCES domains(domain_id), " +
                            "INDEX idx_student_domain (domain_id), " +
                            "INDEX idx_student_email (email), " +
                            "INDEX idx_student_roll (roll_number)" +
                            ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
                    stmt.execute(createStudentsSQL);
                    log.info("Created 'students' table");
                }
            }
        } catch (SQLException e) {
            log.error("Error creating tables using SQL: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create database tables", e);
        } catch (Exception e) {
            log.error("Unexpected error creating tables: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create database tables", e);
        }
    }

    private Set<String> getExistingTables(Session session) {
        Set<String> tables = new HashSet<>();
        try {
            Connection connection = session.doReturningWork(conn -> {
                if (conn instanceof Connection) {
                    return (Connection) conn;
                }
                return null;
            });
            
            if (connection == null) {
                log.warn("Could not obtain database connection");
                return tables;
            }
            
            DatabaseMetaData metaData = connection.getMetaData();
            String catalog = connection.getCatalog();
            
            try (ResultSet rs = metaData.getTables(catalog, null, null, new String[]{"TABLE"})) {
                while (rs.next()) {
                    String tableName = rs.getString("TABLE_NAME").toLowerCase();
                    tables.add(tableName);
                }
            }
            
            log.debug("Found existing tables: {}", tables);
        } catch (Exception e) {
            log.error("Error checking existing tables: {}", e.getMessage(), e);
        }
        return tables;
    }
}

