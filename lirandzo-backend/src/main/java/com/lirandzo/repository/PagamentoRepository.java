package com.lirandzo.repository;

import com.lirandzo.entity.Pagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PagamentoRepository extends JpaRepository<Pagamento, Long> {
    
    List<Pagamento> findByEncomendaNumeroEncomenda(Long numeroEncomenda);
}
