package com.academic.erp.backend.repository;

import com.academic.erp.backend.entity.Domain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DomainRepository extends JpaRepository<Domain, Long> {

    Optional<Domain> findByProgram(String program);
}
