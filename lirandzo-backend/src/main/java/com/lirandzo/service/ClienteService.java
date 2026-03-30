package com.lirandzo.service;

import com.lirandzo.entity.Cliente;
import com.lirandzo.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    public List<Cliente> findAll() {
        return clienteRepository.findAll();
    }

    public Optional<Cliente> findById(Long id) {
        return clienteRepository.findById(id);
    }

    public Cliente save(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    public Optional<Cliente> update(Long id, Cliente clienteAtualizado) {
        return clienteRepository.findById(id)
                .map(cliente -> {
                    cliente.setNome(clienteAtualizado.getNome());
                    cliente.setTelefone(clienteAtualizado.getTelefone());
                    cliente.setEmail(clienteAtualizado.getEmail());
                    cliente.setEndereco(clienteAtualizado.getEndereco());
                    cliente.setNif(clienteAtualizado.getNif());
                    cliente.setProvincia(clienteAtualizado.getProvincia());
                    cliente.setPessoaContacto(clienteAtualizado.getPessoaContacto());
                    return clienteRepository.save(cliente);
                });
    }

    public void deleteById(Long id) {
        clienteRepository.deleteById(id);
    }

    public List<Cliente> search(String nome, String telefone) {
        if (nome != null && !nome.isEmpty()) {
            return clienteRepository.findByNomeContainingIgnoreCase(nome);
        }
        if (telefone != null && !telefone.isEmpty()) {
            return clienteRepository.findByTelefoneContaining(telefone);
        }
        return findAll();
    }

    public Optional<Cliente> findByEmail(String email) {
        return clienteRepository.findByEmailIgnoreCase(email);
    }

    public List<Cliente> findClientesComDividas() {
        return clienteRepository.findByValorEmDividaGreaterThan(0.0);
    }
}
