package com.lirandzo.repository;

import com.lirandzo.entity.Viagem;
import com.lirandzo.entity.Viagem.StatusViagem;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ViagemRepository extends JpaRepository<Viagem, Long> {
    
    @EntityGraph(attributePaths = {"motorista", "viatura"})
    @Query("SELECT v FROM Viagem v")
    List<Viagem> findAllWithRelations();
    
    @EntityGraph(attributePaths = {"motorista", "viatura"})
    @Override
    java.util.Optional<Viagem> findById(Long id);
    
    @EntityGraph(attributePaths = {"motorista", "viatura"})
    List<Viagem> findByMotoristaId(Long motoristaId);
    
    @EntityGraph(attributePaths = {"motorista", "viatura"})
    List<Viagem> findByViaturaId(Long viaturaId);
    
    @EntityGraph(attributePaths = {"motorista", "viatura"})
    List<Viagem> findByStatus(StatusViagem status);
}
