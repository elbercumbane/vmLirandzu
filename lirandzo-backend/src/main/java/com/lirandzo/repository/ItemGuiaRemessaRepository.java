package com.lirandzo.repository;

import com.lirandzo.entity.ItemGuiaRemessa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemGuiaRemessaRepository extends JpaRepository<ItemGuiaRemessa, Long> {
    
    List<ItemGuiaRemessa> findByGuiaRemessaId(Long guiaRemessaId);
}
