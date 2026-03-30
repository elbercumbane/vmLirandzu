package com.lirandzo.repository;

import com.lirandzo.entity.Recibo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReciboRepository extends JpaRepository<Recibo, Long> {

    Optional<Recibo> findByPagamento_Id(Long pagamentoId);

    @Query("SELECT COALESCE(MAX(r.sequencia), 0) FROM Recibo r WHERE r.ano = :ano")
    int findMaxSequenciaByAno(@Param("ano") int ano);

    List<Recibo> findAllByOrderByDataEmissaoDescIdDesc();
}
