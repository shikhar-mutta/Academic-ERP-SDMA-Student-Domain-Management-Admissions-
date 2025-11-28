package com.academic.erp.backend.repository;

import com.academic.erp.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    List<Student> findByRollNumberStartingWithAndJoinYear(String rollBase, Integer joinYear);

    List<Student> findByDomain_DomainId(Long domainId);
    
    List<Student> findByDomain_DomainIdAndIsActiveTrue(Long domainId);
    
    List<Student> findByIsActiveTrue();
}
