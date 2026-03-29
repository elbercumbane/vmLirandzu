package com.lirandzo.repository;

import com.lirandzo.entity.Pagamento;
import com.lirandzo.entity.Pagamento.VerificationStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {

    List<Pagamento> findByEncomendaNumeroEncomendaOrderByIdDesc(Long numeroEncomenda);

    @EntityGraph(attributePaths = {"encomenda", "encomenda.cliente"})
    List<Pagamento> findByVerificationStatusOrderByDataPagamentoAsc(VerificationStatus status);

    @EntityGraph(attributePaths = {"encomenda", "encomenda.cliente"})
    @Query("SELECT p FROM Pagamento p ORDER BY p.dataPagamento DESC NULLS LAST, p.id DESC")
    List<Pagamento> findAllOrderedWithDetails();

    @EntityGraph(attributePaths = {"encomenda", "encomenda.cliente"})
    @Query("SELECT p FROM Pagamento p WHERE p.id = :id")
    Optional<Pagamento> findWithDetailsById(@Param("id") Long id);
}
