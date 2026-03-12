package com.lirandzo.repository;

import com.lirandzo.entity.GuiaRemessa;
import com.lirandzo.entity.GuiaRemessa.StatusGuia;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GuiaRemessaRepository extends JpaRepository<GuiaRemessa, Long> {
    
    @EntityGraph(attributePaths = {"motorista", "viatura", "viagem", "itens"})
    @Query("SELECT g FROM GuiaRemessa g")
    List<GuiaRemessa> findAllWithRelations();
    
    @EntityGraph(attributePaths = {"motorista", "viatura", "viagem", "itens"})
    @Override
    java.util.Optional<GuiaRemessa> findById(Long id);
    
    @EntityGraph(attributePaths = {"motorista", "viatura", "viagem", "itens"})
    List<GuiaRemessa> findByStatus(StatusGuia status);
    
    @EntityGraph(attributePaths = {"motorista", "viatura", "viagem", "itens"})
    List<GuiaRemessa> findByMotoristaId(Long motoristaId);
    
    @EntityGraph(attributePaths = {"motorista", "viatura", "viagem", "itens"})
    List<GuiaRemessa> findByViaturaId(Long viaturaId);
    
    @EntityGraph(attributePaths = {"motorista", "viatura", "viagem", "itens"})
    List<GuiaRemessa> findByDataGuiaBetween(LocalDate inicio, LocalDate fim);
}
