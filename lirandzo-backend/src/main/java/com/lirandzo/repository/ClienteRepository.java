package com.lirandzo.repository;

import com.lirandzo.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    
    Optional<Cliente> findByNif(String nif);
    
    List<Cliente> findByNomeContainingIgnoreCase(String nome);
    
    List<Cliente> findByTelefoneContaining(String telefone);
    
    List<Cliente> findByValorEmDividaGreaterThan(Double valor);
}
