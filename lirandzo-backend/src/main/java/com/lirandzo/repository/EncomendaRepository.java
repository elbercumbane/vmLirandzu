package com.lirandzo.repository;

import com.lirandzo.entity.Encomenda;
import com.lirandzo.entity.Encomenda.StatusPagamento;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EncomendaRepository extends JpaRepository<Encomenda, Long> {
    
    @EntityGraph(attributePaths = {"cliente"})
    @Query("SELECT e FROM Encomenda e")
    List<Encomenda> findAllWithCliente();
    
    @EntityGraph(attributePaths = {"cliente"})
    List<Encomenda> findByClienteId(Long clienteId);
    
    @EntityGraph(attributePaths = {"cliente"})
    List<Encomenda> findByStatus(StatusPagamento status);
    
    @EntityGraph(attributePaths = {"cliente"})
    List<Encomenda> findByDataEncomendaBetween(LocalDate inicio, LocalDate fim);
    
    @EntityGraph(attributePaths = {"cliente"})
    List<Encomenda> findByProdutoContainingIgnoreCase(String produto);
    
    @EntityGraph(attributePaths = {"cliente"})
    List<Encomenda> findByOrigemContainingIgnoreCaseOrDestinoContainingIgnoreCase(String origem, String destino);
    
    @EntityGraph(attributePaths = {"cliente"})
    @Override
    java.util.Optional<Encomenda> findById(Long id);
}
