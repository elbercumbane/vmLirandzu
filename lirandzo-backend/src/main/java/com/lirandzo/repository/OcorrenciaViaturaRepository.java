package com.lirandzo.repository;

import com.lirandzo.entity.OcorrenciaViatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface OcorrenciaViaturaRepository extends JpaRepository<OcorrenciaViatura, Long> {

    List<OcorrenciaViatura> findByViaturaIdOrderByDataOcorrenciaDesc(Long vehicleId);

    List<OcorrenciaViatura> findByMotoristaIdOrderByDataOcorrenciaDesc(Long driverId);

    List<OcorrenciaViatura> findAllByOrderByDataOcorrenciaDesc();

    List<OcorrenciaViatura> findByEstado(OcorrenciaViatura.EstadoOcorrencia estado);

    List<OcorrenciaViatura> findByDataOcorrenciaBetween(LocalDate start, LocalDate end);
}
