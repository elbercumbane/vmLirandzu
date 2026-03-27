package com.lirandzo.repository;

import com.lirandzo.entity.Abastecimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AbastecimentoRepository extends JpaRepository<Abastecimento, Long> {

    List<Abastecimento> findByViaturaIdOrderByDataAbastecimentoDesc(Long vehicleId);

    List<Abastecimento> findAllByOrderByDataAbastecimentoDesc();

    List<Abastecimento> findByDataAbastecimentoBetween(LocalDate start, LocalDate end);
}
