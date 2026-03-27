package com.lirandzo.repository;

import com.lirandzo.entity.Cotacao;
import com.lirandzo.entity.Cotacao.StatusCotacao;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CotacaoRepository extends JpaRepository<Cotacao, Long> {
    
    @EntityGraph(attributePaths = {"cliente"})
    @Query("SELECT c FROM Cotacao c")
    List<Cotacao> findAllWithCliente();
    
    @EntityGraph(attributePaths = {"cliente"})
    @Override
    java.util.Optional<Cotacao> findById(Long id);
    
    @EntityGraph(attributePaths = {"cliente"})
    List<Cotacao> findByStatus(StatusCotacao status);
    
    @EntityGraph(attributePaths = {"cliente"})
    List<Cotacao> findByClienteId(Long clienteId);
    
    @EntityGraph(attributePaths = {"cliente"})
    List<Cotacao> findByDataCotacaoBetween(LocalDate inicio, LocalDate fim);
}
