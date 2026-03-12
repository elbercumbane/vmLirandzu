package com.lirandzo.repository;

import com.lirandzo.entity.Viatura;
import com.lirandzo.entity.Viatura.StatusViatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ViaturaRepository extends JpaRepository<Viatura, Long> {
    
    Optional<Viatura> findByMatricula(String matricula);
    
    List<Viatura> findByStatus(StatusViatura status);
    
    List<Viatura> findByTipo(String tipo);
}
