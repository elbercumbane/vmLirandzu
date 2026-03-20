package com.lirandzo.repository;

import com.lirandzo.entity.Manutencao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ManutencaoRepository extends JpaRepository<Manutencao, Long> {

    List<Manutencao> findByViaturaIdOrderByDataManutencaoDesc(Long vehicleId);

    List<Manutencao> findAllByOrderByDataManutencaoDesc();

    List<Manutencao> findByStatus(Manutencao.StatusManutencao status);

    List<Manutencao> findByDataManutencaoBetween(LocalDate start, LocalDate end);
}
