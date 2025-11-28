package com.academic.erp.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "domains")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Domain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "domain_id")
    private Long domainId;

    @Column(nullable = false, length = 120)
    private String program;

    private String batch;
    
    @Min(value = 0, message = "Capacity must be at least 0")
    @Max(value = 150, message = "Capacity must be at most 150")
    private Integer capacity;

    @Column(name = "exam_name", length = 120)
    private String examName;

    @Column(name = "cutoff_marks", columnDefinition = "DECIMAL(5,2)")
    private Double cutoffMarks;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
