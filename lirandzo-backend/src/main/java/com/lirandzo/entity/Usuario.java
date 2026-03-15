package com.lirandzo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false, length = 255)
    private String password;  // BCrypt encrypted

    @Column(name = "name", nullable = false, length = 200)
    private String nome;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "phone", length = 50)
    private String telefone;

    @Column(name = "active", nullable = false)
    private Boolean ativo = true;

    @Column(name = "account_non_expired", nullable = false)
    private Boolean contaNaoExpirada = true;

    @Column(name = "credentials_non_expired", nullable = false)
    private Boolean credenciaisNaoExpiradas = true;

    @Column(name = "account_non_locked", nullable = false)
    private Boolean contaNaoBloqueada = true;

    @Column(name = "last_login")
    private LocalDateTime ultimoLogin;

    @Column(name = "created_at")
    private LocalDateTime dataCriacao;

    @Column(name = "updated_at")
    private LocalDateTime dataAtualizacao;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private List<Role> roles = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        dataCriacao = LocalDateTime.now();
        dataAtualizacao = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dataAtualizacao = LocalDateTime.now();
    }
}
