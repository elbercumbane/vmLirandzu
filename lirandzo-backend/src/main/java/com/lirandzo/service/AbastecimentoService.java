package com.lirandzo.service;

import com.lirandzo.dto.AbastecimentoRequestDTO;
import com.lirandzo.dto.AbastecimentoResponseDTO;
import com.lirandzo.entity.Abastecimento;
import com.lirandzo.entity.Viatura;
import com.lirandzo.repository.AbastecimentoRepository;
import com.lirandzo.repository.ViaturaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AbastecimentoService {

    private final AbastecimentoRepository repository;
    private final ViaturaRepository viaturaRepository;

    public AbastecimentoService(AbastecimentoRepository repository, ViaturaRepository viaturaRepository) {
        this.repository = repository;
        this.viaturaRepository = viaturaRepository;
    }

    @Transactional(readOnly = true)
    public List<AbastecimentoResponseDTO> findAll() {
        return repository.findAllByOrderByDataAbastecimentoDesc().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<AbastecimentoResponseDTO> findById(Long id) {
        return repository.findById(id).map(this::toDTO);
    }

    @Transactional(readOnly = true)
    public List<AbastecimentoResponseDTO> findByVehicleId(Long vehicleId) {
        return repository.findByViaturaIdOrderByDataAbastecimentoDesc(vehicleId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AbastecimentoResponseDTO create(AbastecimentoRequestDTO dto) {
        Viatura viatura = viaturaRepository.findById(dto.vehicleId())
                .orElseThrow(() -> new IllegalArgumentException("Viatura não encontrada: " + dto.vehicleId()));

        Abastecimento ab = new Abastecimento();
        ab.setViatura(viatura);
        ab.setDataAbastecimento(dto.refuelDate());
        ab.setLitros(dto.liters());
        ab.setCusto(dto.cost());
        ab.setQuilometragem(dto.kmReading());
        ab.setPosto(dto.station());
        ab.setNotas(dto.notes());

        return toDTO(repository.save(ab));
    }

    @Transactional
    public Optional<AbastecimentoResponseDTO> update(Long id, AbastecimentoRequestDTO dto) {
        return repository.findById(id).map(ab -> {
            ab.setDataAbastecimento(dto.refuelDate());
            ab.setLitros(dto.liters());
            ab.setCusto(dto.cost());
            ab.setQuilometragem(dto.kmReading());
            ab.setPosto(dto.station());
            ab.setNotas(dto.notes());
            if (dto.vehicleId() != null) {
                viaturaRepository.findById(dto.vehicleId()).ifPresent(ab::setViatura);
            }
            return toDTO(repository.save(ab));
        });
    }

    @Transactional
    public void deleteById(Long id) {
        repository.deleteById(id);
    }

    private AbastecimentoResponseDTO toDTO(Abastecimento ab) {
        Viatura v = ab.getViatura();
        return new AbastecimentoResponseDTO(
                ab.getId(),
                ab.getDataAbastecimento(),
                v.getId(),
                v.getMatricula(),
                v.getMarca() + " " + v.getModelo(),
                ab.getLitros(),
                ab.getCusto(),
                ab.getQuilometragem(),
                ab.getPosto(),
                ab.getNotas()
        );
    }
}
