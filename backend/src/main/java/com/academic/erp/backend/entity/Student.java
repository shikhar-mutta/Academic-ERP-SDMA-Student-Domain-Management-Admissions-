package com.academic.erp.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    private Long studentId;

    @Column(name = "roll_number", unique = true, length = 50)
    private String rollNumber;

    @Column(name = "first_name", nullable = false, length = 120)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 120)
    private String lastName;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "domain_id", nullable = false)
    private Domain domain;

    @Column(name = "join_year", nullable = false)
    private Integer joinYear;

    @Column(name = "exam_marks", nullable = false, columnDefinition = "DECIMAL(5,2)")
    private Double examMarks;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        
        // examMarks is required, so it should always be set before persisting
        // If somehow null, throw exception to catch data issues early
        if (this.examMarks == null) {
            throw new IllegalStateException("Exam marks is required and cannot be null");
        }
        
        // Set isActive based on exam marks vs domain cutoff for this particular domain
        // If marks < cutoff for this domain, set isActive = false (disabled)
        if (this.isActive == null) {
            this.isActive = true; // Default to active
        }
        
        // If domain is loaded, check cutoff marks for this specific domain
        // Only disable if marks are less than cutoff for this particular domain
        if (this.domain != null && this.domain.getCutoffMarks() != null && this.examMarks != null) {
            this.isActive = this.examMarks >= this.domain.getCutoffMarks();
        }
    }
}
