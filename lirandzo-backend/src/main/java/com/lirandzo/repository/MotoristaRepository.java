package com.lirandzo.repository;

import com.lirandzo.entity.Motorista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MotoristaRepository extends JpaRepository<Motorista, Long> {
    
    List<Motorista> findByStatus(Motorista.StatusMotorista status);
    
    List<Motorista> findByNomeContainingIgnoreCase(String nome);
}
