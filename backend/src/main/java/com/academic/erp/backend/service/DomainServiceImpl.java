package com.academic.erp.backend.service;

import com.academic.erp.backend.dto.DomainRequestDto;
import com.academic.erp.backend.dto.DomainResponseDto;
import com.academic.erp.backend.dto.DomainUpdateImpactDto;
import com.academic.erp.backend.entity.Domain;
import com.academic.erp.backend.entity.Student;
import com.academic.erp.backend.repository.DomainRepository;
import com.academic.erp.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DomainServiceImpl implements DomainService {

    private final DomainRepository domainRepository;
    private final StudentRepository studentRepository;

    @Override
    public List<DomainResponseDto> getAllDomains() {
        return domainRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional
    public DomainResponseDto createDomain(DomainRequestDto request) {
        Domain domain = Domain.builder()
                .program(request.getProgram())
                .batch(request.getBatch())
                .capacity(request.getCapacity())
                .examName(request.getExamName())
                .cutoffMarks(request.getCutoffMarks())
                .build();
        
        Domain saved = domainRepository.save(domain);
        return toDto(saved);
    }

    @Override
    @Transactional
    public DomainResponseDto updateDomain(Long domainId, DomainRequestDto request) {
        Domain domain = domainRepository.findById(domainId)
                .orElseThrow(() -> new RuntimeException("Domain not found with id: " + domainId));
        
        Integer oldCapacity = domain.getCapacity();
        Integer newCapacity = request.getCapacity();
        Double newCutoffMarks = request.getCutoffMarks();
        
        domain.setProgram(request.getProgram());
        domain.setBatch(request.getBatch());
        domain.setCapacity(newCapacity);
        domain.setExamName(request.getExamName());
        domain.setCutoffMarks(newCutoffMarks);
        
        List<Student> students = studentRepository.findByDomain_DomainId(domainId);
        
        // If capacity is reduced, prioritize students by marks (highest first), then by name (alphabetical)
        if (oldCapacity != null && newCapacity != null && newCapacity < oldCapacity) {
            // Sort all students: first by exam marks (descending), then by full name (ascending)
            students.sort((s1, s2) -> {
                // Compare by exam marks (descending - higher marks first)
                int marksCompare = Double.compare(
                    s2.getExamMarks() != null ? s2.getExamMarks() : 0.0,
                    s1.getExamMarks() != null ? s1.getExamMarks() : 0.0
                );
                if (marksCompare != 0) {
                    return marksCompare;
                }
                // If marks are equal, compare by name (alphabetical - ascending)
                String name1 = (s1.getFirstName() != null ? s1.getFirstName() : "") + 
                             (s1.getLastName() != null ? s1.getLastName() : "");
                String name2 = (s2.getFirstName() != null ? s2.getFirstName() : "") + 
                             (s2.getLastName() != null ? s2.getLastName() : "");
                return name1.compareToIgnoreCase(name2);
            });
            
            // Keep top N students active (where N = new capacity)
            // Only consider students who meet the cutoff requirement
            int activeCount = 0;
            for (Student student : students) {
                // Only activate students who meet cutoff requirement
                boolean meetsCutoff = newCutoffMarks == null || 
                                    (student.getExamMarks() != null && 
                                     student.getExamMarks() >= newCutoffMarks);
                
                if (meetsCutoff && activeCount < newCapacity) {
                    student.setIsActive(true);
                    activeCount++;
                } else {
                    // Deactivate if capacity is full or doesn't meet cutoff
                    student.setIsActive(false);
                }
            }
        } else {
            // If capacity is not reduced, just update isActive based on cutoff marks
            if (newCutoffMarks != null) {
                for (Student student : students) {
                    // For each student in this domain: if marks < cutoff, set isActive = false (disabled)
                    boolean shouldBeActive = student.getExamMarks() != null && 
                                           student.getExamMarks() >= newCutoffMarks;
                    student.setIsActive(shouldBeActive);
                }
            }
        }
        
        studentRepository.saveAll(students);
        Domain updated = domainRepository.save(domain);
        return toDto(updated);
    }

    @Override
    public DomainUpdateImpactDto getUpdateImpact(Long domainId, DomainRequestDto request) {
        Domain domain = domainRepository.findById(domainId)
                .orElseThrow(() -> new RuntimeException("Domain not found with id: " + domainId));
        
        Integer oldCapacity = domain.getCapacity();
        Integer newCapacity = request.getCapacity();
        Double oldCutoffMarks = domain.getCutoffMarks();
        Double newCutoffMarks = request.getCutoffMarks();
        
        long affectedCount = 0;
        String message = "No impact on students.";
        List<String> messages = new java.util.ArrayList<>();
        
        // Check capacity reduction impact
        if (oldCapacity != null && newCapacity != null && newCapacity < oldCapacity) {
            List<Student> students = studentRepository.findByDomain_DomainId(domainId);
            
            // Filter students who meet cutoff requirement
            List<Student> eligibleStudents = students.stream()
                    .filter(s -> newCutoffMarks == null || 
                               (s.getExamMarks() != null && s.getExamMarks() >= newCutoffMarks))
                    .sorted((s1, s2) -> {
                        // Sort by marks (descending), then by name (ascending)
                        int marksCompare = Double.compare(
                            s2.getExamMarks() != null ? s2.getExamMarks() : 0.0,
                            s1.getExamMarks() != null ? s1.getExamMarks() : 0.0
                        );
                        if (marksCompare != 0) {
                            return marksCompare;
                        }
                        String name1 = (s1.getFirstName() != null ? s1.getFirstName() : "") + 
                                     (s1.getLastName() != null ? s1.getLastName() : "");
                        String name2 = (s2.getFirstName() != null ? s2.getFirstName() : "") + 
                                     (s2.getLastName() != null ? s2.getLastName() : "");
                        return name1.compareToIgnoreCase(name2);
                    })
                    .toList();
            
            long currentlyActive = eligibleStudents.stream()
                    .filter(Student::getIsActive)
                    .count();
            
            // Calculate how many will be deactivated
            long willBeDeactivated = Math.max(0, currentlyActive - newCapacity);
            
            if (willBeDeactivated > 0) {
                affectedCount = willBeDeactivated;
                messages.add(String.format(
                    "Warning: Capacity will be reduced from %d to %d. %d student(s) with lower marks will be deactivated. Students will be prioritized by highest marks, then by name (alphabetical).",
                    oldCapacity, newCapacity, willBeDeactivated
                ));
            }
        }
        
        // Check cutoff marks impact (only if capacity impact is not the primary concern)
        if (oldCutoffMarks != null && newCutoffMarks != null && newCutoffMarks > oldCutoffMarks) {
            List<Student> students = studentRepository.findByDomain_DomainId(domainId);
            long cutoffAffected = students.stream()
                    .filter(s -> s.getExamMarks() == null || s.getExamMarks() < newCutoffMarks)
                    .count();
            
            if (cutoffAffected > 0) {
                affectedCount += cutoffAffected;
                messages.add(String.format(
                    "Warning: %d student(s) will be disabled as their exam marks are below the new cutoff of %.2f.",
                    cutoffAffected, newCutoffMarks
                ));
            }
        } else if (oldCutoffMarks != null && newCutoffMarks != null && newCutoffMarks < oldCutoffMarks) {
            // If cutoff decreased, some previously disabled students might become active
            List<Student> students = studentRepository.findByDomain_DomainId(domainId);
            long willBeEnabled = students.stream()
                    .filter(s -> !s.getIsActive() && s.getExamMarks() != null && s.getExamMarks() >= newCutoffMarks)
                    .count();
            
            if (willBeEnabled > 0 && messages.isEmpty()) {
                messages.add(String.format(
                    "Info: %d previously disabled student(s) will be enabled as their exam marks now meet the new cutoff of %.2f.",
                    willBeEnabled, newCutoffMarks
                ));
            }
        }
        
        if (!messages.isEmpty()) {
            message = String.join(" ", messages);
        }
        
        return DomainUpdateImpactDto.builder()
                .domainId(domainId)
                .affectedStudentsCount(affectedCount)
                .message(message)
                .build();
    }

    @Override
    public DomainUpdateImpactDto getDeleteImpact(Long domainId) {
        if (!domainRepository.existsById(domainId)) {
            throw new RuntimeException("Domain not found with id: " + domainId);
        }
        
        List<Student> students = studentRepository.findByDomain_DomainId(domainId);
        long studentCount = students.size();
        
        String message = "No students will be deleted.";
        if (studentCount > 0) {
            message = String.format("Warning: %d student(s) will be permanently deleted along with this domain.", studentCount);
        }
        
        return DomainUpdateImpactDto.builder()
                .domainId(domainId)
                .affectedStudentsCount(studentCount)
                .message(message)
                .build();
    }

    @Override
    @Transactional
    public void deleteDomain(Long domainId) {
        Domain domain = domainRepository.findById(domainId)
                .orElseThrow(() -> new RuntimeException("Domain not found with id: " + domainId));
        
        // Delete all students associated with this domain first
        List<Student> students = studentRepository.findByDomain_DomainId(domainId);
        if (!students.isEmpty()) {
            studentRepository.deleteAll(students);
        }
        
        // Then delete the domain
        domainRepository.delete(domain);
    }

    @Override
    public DomainResponseDto getDomainById(Long domainId) {
        Domain domain = domainRepository.findById(domainId)
                .orElseThrow(() -> new RuntimeException("Domain not found with id: " + domainId));
        return toDto(domain);
    }

    private DomainResponseDto toDto(Domain domain) {
        // Count only active students for this domain
        long studentCount = studentRepository.findByDomain_DomainIdAndIsActiveTrue(domain.getDomainId()).size();
        
        return DomainResponseDto.builder()
                .domainId(domain.getDomainId())
                .program(domain.getProgram())
                .batch(domain.getBatch())
                .capacity(domain.getCapacity())
                .examName(domain.getExamName())
                .cutoffMarks(domain.getCutoffMarks())
                .studentCount(studentCount)
                .build();
    }
}
