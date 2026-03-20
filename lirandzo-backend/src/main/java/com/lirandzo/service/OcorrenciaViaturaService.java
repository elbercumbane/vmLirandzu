package com.lirandzo.service;

import com.lirandzo.dto.OcorrenciaRequestDTO;
import com.lirandzo.dto.OcorrenciaResponseDTO;
import com.lirandzo.entity.Motorista;
import com.lirandzo.entity.OcorrenciaViatura;
import com.lirandzo.entity.Viatura;
import com.lirandzo.entity.Viatura.StatusViatura;
import com.lirandzo.repository.MotoristaRepository;
import com.lirandzo.repository.OcorrenciaViaturaRepository;
import com.lirandzo.repository.ViaturaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OcorrenciaViaturaService {

    private final OcorrenciaViaturaRepository repository;
    private final ViaturaRepository viaturaRepository;
    private final MotoristaRepository motoristaRepository;

    public OcorrenciaViaturaService(OcorrenciaViaturaRepository repository,
                                    ViaturaRepository viaturaRepository,
                                    MotoristaRepository motoristaRepository) {
        this.repository = repository;
        this.viaturaRepository = viaturaRepository;
        this.motoristaRepository = motoristaRepository;
    }

    @Transactional(readOnly = true)
    public List<OcorrenciaResponseDTO> findAll() {
        return repository.findAllByOrderByDataOcorrenciaDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<OcorrenciaResponseDTO> findById(Long id) {
        return repository.findById(id).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public List<OcorrenciaResponseDTO> findByVehicleId(Long vehicleId) {
        return repository.findByViaturaIdOrderByDataOcorrenciaDesc(vehicleId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OcorrenciaResponseDTO> findByStatus(String status) {
        OcorrenciaViatura.EstadoOcorrencia estado = mapEstado(status);
        return repository.findByEstado(estado).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OcorrenciaResponseDTO create(OcorrenciaRequestDTO dto) {
        if (isAcidente(dto.type()) && dto.driverId() == null) {
            throw new IllegalArgumentException("Motorista é obrigatório para acidentes.");
        }

        Viatura viatura = viaturaRepository.findById(dto.vehicleId())
                .orElseThrow(() -> new IllegalArgumentException("Viatura não encontrada: " + dto.vehicleId()));

        Motorista motorista = null;
        if (dto.driverId() != null) {
            motorista = motoristaRepository.findById(dto.driverId()).orElse(null);
        }

        OcorrenciaViatura.ImpactoVeiculo impacto = mapImpacto(dto.vehicleImpact());
        if (impacto == null) {
            throw new IllegalArgumentException("Estado da viatura após ocorrência é obrigatório (Operacional, Em Reparação ou Perda Total).");
        }

        OcorrenciaViatura oc = new OcorrenciaViatura();
        oc.setDataOcorrencia(dto.occurrenceDate());
        oc.setViatura(viatura);
        oc.setMotorista(motorista);
        oc.setTipo(mapTipo(dto.type()));
        oc.setDescricao(dto.description());
        oc.setGravidade(mapGravidade(dto.severity()));
        oc.setEstado(mapEstado(dto.status() != null ? dto.status() : "ABERTO"));
        oc.setImpactoVeiculo(impacto);
        oc.setCustoEstimado(dto.estimatedCost());

        OcorrenciaViatura saved = repository.save(oc);

        // Actualizar automaticamente o status da viatura conforme o impacto
        StatusViatura novoStatus = toStatusViatura(impacto);
        viatura.setStatus(novoStatus);
        viaturaRepository.save(viatura);

        return toDTO(saved);
    }

    private boolean isAcidente(String type) {
        return type != null && type.toUpperCase().equals("ACIDENTE");
    }

    private OcorrenciaViatura.ImpactoVeiculo mapImpacto(String s) {
        if (s == null || s.isBlank()) return null;
        return switch (s.toUpperCase().replace(" ", "_").replace("ÃO", "AO").replace("Á", "A")) {
            case "OPERACIONAL" -> OcorrenciaViatura.ImpactoVeiculo.OPERACIONAL;
            case "EM_REPARACAO", "EM_REPARAÇÃO" -> OcorrenciaViatura.ImpactoVeiculo.EM_REPARACAO;
            case "PERDA_TOTAL", "PERDATOTAL" -> OcorrenciaViatura.ImpactoVeiculo.PERDA_TOTAL;
            default -> null;
        };
    }

    private StatusViatura toStatusViatura(OcorrenciaViatura.ImpactoVeiculo impacto) {
        return switch (impacto) {
            case OPERACIONAL -> StatusViatura.ACTIVE;
            case EM_REPARACAO -> StatusViatura.UNDER_MAINTENANCE;
            case PERDA_TOTAL -> StatusViatura.INACTIVE;
        };
    }

    @Transactional
    public Optional<OcorrenciaResponseDTO> update(Long id, OcorrenciaRequestDTO dto) {
        if (isAcidente(dto.type()) && dto.driverId() == null) {
            throw new IllegalArgumentException("Motorista é obrigatório para acidentes.");
        }
        return repository.findById(id).map(oc -> {
            oc.setDataOcorrencia(dto.occurrenceDate());
            oc.setDescricao(dto.description());
            oc.setGravidade(mapGravidade(dto.severity()));
            oc.setEstado(mapEstado(dto.status() != null ? dto.status() : oc.getEstado().name()));
            if (dto.vehicleImpact() != null && !dto.vehicleImpact().isBlank()) {
                OcorrenciaViatura.ImpactoVeiculo impacto = mapImpacto(dto.vehicleImpact());
                if (impacto != null) {
                    oc.setImpactoVeiculo(impacto);
                    Viatura v = oc.getViatura();
                    v.setStatus(toStatusViatura(impacto));
                    viaturaRepository.save(v);
                }
            }
            oc.setCustoEstimado(dto.estimatedCost());

            if (dto.vehicleId() != null) {
                viaturaRepository.findById(dto.vehicleId()).ifPresent(oc::setViatura);
            }
            if (dto.driverId() != null) {
                oc.setMotorista(motoristaRepository.findById(dto.driverId()).orElse(null));
            } else if (dto.driverId() == null && !isAcidente(dto.type())) {
                oc.setMotorista(null);
            }

            return toDTO(repository.save(oc));
        });
    }

    @Transactional
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    private OcorrenciaResponseDTO toDTO(OcorrenciaViatura oc) {
        String driverName = oc.getMotorista() != null ? oc.getMotorista().getNome() : null;
        String vehicleImpact = oc.getImpactoVeiculo() != null ? mapImpactoToDisplay(oc.getImpactoVeiculo()) : null;
        return new OcorrenciaResponseDTO(
                oc.getId(),
                oc.getDataOcorrencia(),
                oc.getViatura().getId(),
                oc.getViatura().getMatricula(),
                oc.getViatura().getMarca() + " " + oc.getViatura().getModelo(),
                oc.getMotorista() != null ? oc.getMotorista().getId() : null,
                driverName,
                oc.getTipo().name(),
                oc.getDescricao(),
                oc.getGravidade() != null ? oc.getGravidade().name() : null,
                mapEstadoToDisplay(oc.getEstado()),
                vehicleImpact,
                oc.getCustoEstimado()
        );
    }

    private String mapImpactoToDisplay(OcorrenciaViatura.ImpactoVeiculo i) {
        return switch (i) {
            case OPERACIONAL -> "OPERACIONAL";
            case EM_REPARACAO -> "EM REPARAÇÃO";
            case PERDA_TOTAL -> "PERDA TOTAL";
        };
    }

    private OcorrenciaViatura.TipoOcorrencia mapTipo(String s) {
        if (s == null) return OcorrenciaViatura.TipoOcorrencia.AVARIA;
        return switch (s.toUpperCase()) {
            case "ACIDENTE" -> OcorrenciaViatura.TipoOcorrencia.ACIDENTE;
            case "MANUTENÇÃO", "MANUTENCAO" -> OcorrenciaViatura.TipoOcorrencia.MANUTENCAO;
            default -> OcorrenciaViatura.TipoOcorrencia.AVARIA;
        };
    }

    private OcorrenciaViatura.Gravidade mapGravidade(String s) {
        if (s == null || s.isBlank()) return null;
        return switch (s.toUpperCase().replace("É", "E")) {
            case "BAIXA" -> OcorrenciaViatura.Gravidade.BAIXA;
            case "MEDIA", "MÉDIA" -> OcorrenciaViatura.Gravidade.MEDIA;
            case "ALTA" -> OcorrenciaViatura.Gravidade.ALTA;
            case "CRITICA", "CRÍTICA" -> OcorrenciaViatura.Gravidade.CRITICA;
            default -> null;
        };
    }

    private OcorrenciaViatura.EstadoOcorrencia mapEstado(String s) {
        if (s == null || s.isBlank()) return OcorrenciaViatura.EstadoOcorrencia.ABERTO;
        return switch (s.toUpperCase().replace(" ", "_").replace("ÃO", "AO").replace("Á", "A")) {
            case "EM_REPARACAO", "EM_REPARAÇÃO" -> OcorrenciaViatura.EstadoOcorrencia.EM_REPARACAO;
            case "RESOLVIDO" -> OcorrenciaViatura.EstadoOcorrencia.RESOLVIDO;
            default -> OcorrenciaViatura.EstadoOcorrencia.ABERTO;
        };
    }

    private String mapEstadoToDisplay(OcorrenciaViatura.EstadoOcorrencia e) {
        return switch (e) {
            case ABERTO -> "ABERTO";
            case EM_REPARACAO -> "EM REPARAÇÃO";
            case RESOLVIDO -> "RESOLVIDO";
        };
    }
}
