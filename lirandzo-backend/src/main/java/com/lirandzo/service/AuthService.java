package com.lirandzo.service;

import com.lirandzo.dto.AuthResponseDTO;
import com.lirandzo.entity.Role;
import com.lirandzo.entity.Usuario;
import com.lirandzo.repository.UsuarioRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Optional<AuthResponseDTO> login(String username, String password) {
        return usuarioRepository.findByUsernameAndAtivoTrue(username)
                .filter(this::isAccountValid)
                .filter(usuario -> passwordEncoder.matches(password, usuario.getPassword()))
                .map(this::toAuthResponse);
    }

    private boolean isAccountValid(Usuario usuario) {
        return Boolean.TRUE.equals(usuario.getContaNaoExpirada())
                && Boolean.TRUE.equals(usuario.getCredenciaisNaoExpiradas())
                && Boolean.TRUE.equals(usuario.getContaNaoBloqueada());
    }

    private AuthResponseDTO toAuthResponse(Usuario usuario) {
        String role = mapRolesToFrontendLabel(usuario);
        return new AuthResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                role
        );
    }

    public List<Map<String, Object>> listarUsuariosAtivos() {
        return usuarioRepository.findAll().stream()
                .filter(u -> Boolean.TRUE.equals(u.getAtivo()))
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "nome", u.getNome(),
                        "role", mapRolesToFrontendLabel(u)
                ))
                .collect(Collectors.toList());
    }

    private String mapRolesToFrontendLabel(Usuario usuario) {
        if (usuario.getRoles() == null) {
            return "tecnico";
        }

        boolean isAdmin = usuario.getRoles().stream()
                .map(Role::getName)
                .anyMatch("ROLE_ADMIN"::equals);

        if (isAdmin) {
            return "admin";
        }

        boolean isGestor = usuario.getRoles().stream()
                .map(Role::getName)
                .anyMatch("ROLE_MANAGER"::equals);

        if (isGestor) {
            return "gestor";
        }

        return "tecnico";
    }
}

