package com.lirandzo.service;

import com.lirandzo.dto.ManutencaoRequestDTO;
import com.lirandzo.dto.ManutencaoResponseDTO;
import com.lirandzo.entity.Manutencao;
import com.lirandzo.entity.Viatura;
import com.lirandzo.repository.ManutencaoRepository;
import com.lirandzo.repository.ViaturaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ManutencaoService {

    private final ManutencaoRepository repository;
    private final ViaturaRepository viaturaRepository;

    public ManutencaoService(ManutencaoRepository repository, ViaturaRepository viaturaRepository) {
        this.repository = repository;
        this.viaturaRepository = viaturaRepository;
    }

    @Transactional(readOnly = true)
    public List<ManutencaoResponseDTO> findAll() {
        return repository.findAllByOrderByDataManutencaoDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<ManutencaoResponseDTO> findById(Long id) {
        return repository.findById(id).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public List<ManutencaoResponseDTO> findByVehicleId(Long vehicleId) {
        return repository.findByViaturaIdOrderByDataManutencaoDesc(vehicleId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ManutencaoResponseDTO create(ManutencaoRequestDTO dto) {
        Viatura viatura = viaturaRepository.findById(dto.vehicleId())
                .orElseThrow(() -> new IllegalArgumentException("Viatura não encontrada: " + dto.vehicleId()));

        Manutencao m = new Manutencao();
        m.setViatura(viatura);
        m.setDataManutencao(dto.maintenanceDate());
        m.setTipo(mapTipo(dto.type()));
        m.setDescricao(dto.description());
        m.setCusto(dto.cost());
        m.setPecasSubstituidas(dto.partsReplaced());
        m.setOficina(dto.workshop());
        m.setQuilometragem(dto.kmReading());
        m.setStatus(mapStatus(dto.status()));

        return toDTO(repository.save(m));
    }

    @Transactional
    public Optional<ManutencaoResponseDTO> update(Long id, ManutencaoRequestDTO dto) {
        return repository.findById(id).map(m -> {
            m.setDataManutencao(dto.maintenanceDate());
            m.setTipo(mapTipo(dto.type()));
            m.setDescricao(dto.description());
            m.setCusto(dto.cost());
            m.setPecasSubstituidas(dto.partsReplaced());
            m.setOficina(dto.workshop());
            m.setQuilometragem(dto.kmReading());
            m.setStatus(mapStatus(dto.status()));
            if (dto.vehicleId() != null) {
                viaturaRepository.findById(dto.vehicleId()).ifPresent(m::setViatura);
            }
            return toDTO(repository.save(m));
        });
    }

    @Transactional
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    private Manutencao.TipoManutencao mapTipo(String s) {
        if (s == null || s.isBlank()) return Manutencao.TipoManutencao.CORRETIVA;
        return switch (s.toUpperCase()) {
            case "PREVENTIVA" -> Manutencao.TipoManutencao.PREVENTIVA;
            case "INSPECAO", "INSPEÇÃO" -> Manutencao.TipoManutencao.INSPECAO;
            case "REVISAO", "REVISÃO" -> Manutencao.TipoManutencao.REVISAO;
            default -> Manutencao.TipoManutencao.CORRETIVA;
        };
    }

    private Manutencao.StatusManutencao mapStatus(String s) {
        if (s == null || s.isBlank()) return Manutencao.StatusManutencao.CONCLUIDA;
        return switch (s.toUpperCase().replace(" ", "_")) {
            case "AGENDADA" -> Manutencao.StatusManutencao.AGENDADA;
            case "EM_CURSO" -> Manutencao.StatusManutencao.EM_CURSO;
            case "ADIADA" -> Manutencao.StatusManutencao.ADIADA;
            default -> Manutencao.StatusManutencao.CONCLUIDA;
        };
    }

    private ManutencaoResponseDTO toDTO(Manutencao m) {
        Viatura v = m.getViatura();
        return new ManutencaoResponseDTO(
                m.getId(),
                m.getDataManutencao(),
                v.getId(),
                v.getMatricula(),
                v.getMarca() + " " + v.getModelo(),
                m.getTipo().name(),
                m.getDescricao(),
                m.getCusto(),
                m.getPecasSubstituidas(),
                m.getOficina(),
                m.getQuilometragem(),
                m.getStatus().name()
        );
    }
}
