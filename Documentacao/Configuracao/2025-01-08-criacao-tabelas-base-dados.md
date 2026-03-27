# Criação das Tabelas da Base de Dados

**Data:** 2025-01-08  
**Tipo:** Configuração/Setup  
**Prioridade:** Alta

## O que foi feito

Criação completa do script SQL para inicialização da base de dados PostgreSQL, incluindo sistema de autenticação/login e todas as tabelas do sistema de facturação e gestão de transportes.

## Onde foi modificado

### Ficheiros criados:
- `lirandzo-backend/src/main/java/com/lirandzo/entity/Usuario.java` - Entidade de usuários
- `lirandzo-backend/src/main/java/com/lirandzo/entity/Role.java` - Entidade de roles/permissões

### Ficheiros modificados:
- `lirandzo-backend/scripts/init-database.sql` - Script SQL completo reescrito

## Porquê foi modificado

**Problema identificado:**
- Não existia sistema de autenticação/login
- Script SQL não estava completo
- Tabelas não estavam na ordem correta (dependências)
- Faltavam índices importantes
- Não havia dados iniciais (seeds)

**Solução:**
- Criar entidades Usuario e Role para autenticação
- Reescrever script SQL completo com todas as tabelas
- Organizar tabelas na ordem correta (começando com login)
- Adicionar todos os índices necessários
- Incluir dados iniciais (roles padrão e usuário admin)

## Como foi implementado

### 1. Entidade Role (Papéis/Permissões)

**Localização:** `lirandzo-backend/src/main/java/com/lirandzo/entity/Role.java`

**Código:**

```1:47:lirandzo-backend/src/main/java/com/lirandzo/entity/Role.java
package com.lirandzo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String nome; // ROLE_ADMIN, ROLE_USER, ROLE_GERENTE, etc.

    @Column(length = 200)
    private String descricao;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @ManyToMany(mappedBy = "roles")
    private List<Usuario> usuarios = new ArrayList<>();

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
```

**Explicação:**
- **Linha 22:** `nome` - Nome único da role (ex: ROLE_ADMIN, ROLE_USER)
- **Linha 25:** `descricao` - Descrição da role
- **Linha 35:** `usuarios` - Relação ManyToMany com Usuario (mappedBy indica que Usuario é o dono da relação)

### 2. Entidade Usuario (Sistema de Login)

**Localização:** `lirandzo-backend/src/main/java/com/lirandzo/entity/Usuario.java`

**Código:**

```1:70:lirandzo-backend/src/main/java/com/lirandzo/entity/Usuario.java
package com.lirandzo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuarios")
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
    private String password; // Será encriptado com BCrypt

    @Column(nullable = false, length = 200)
    private String nome;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(length = 50)
    private String telefone;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @Column(name = "conta_nao_expirada", nullable = false)
    private Boolean contaNaoExpirada = true;

    @Column(name = "credenciais_nao_expiradas", nullable = false)
    private Boolean credenciaisNaoExpiradas = true;

    @Column(name = "conta_nao_bloqueada", nullable = false)
    private Boolean contaNaoBloqueada = true;

    @Column(name = "ultimo_login")
    private LocalDateTime ultimoLogin;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "usuarios_roles",
        joinColumns = @JoinColumn(name = "usuario_id"),
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
```

**Explicação das partes chave:**

- **Linha 22:** `username` - Nome de usuário único para login
- **Linha 25:** `password` - Senha encriptada com BCrypt (255 caracteres para hash)
- **Linha 34:** `email` - Email único do usuário
- **Linhas 38-47:** Campos de controle de conta (ativo, não expirada, não bloqueada) - compatível com Spring Security
- **Linhas 56-61:** Relação ManyToMany com Role através de tabela de junção `usuarios_roles`
  - `fetch = FetchType.EAGER` - Carrega roles automaticamente (importante para autenticação)

### 3. Script SQL Completo

**Localização:** `lirandzo-backend/scripts/init-database.sql`

**Estrutura do script:**

#### Ordem das Tabelas (respeitando dependências):

1. **roles** - Sem dependências
2. **usuarios** - Sem dependências (roles via tabela de junção)
3. **usuarios_roles** - Tabela de junção (depende de usuarios e roles)
4. **clientes** - Sem dependências
5. **viaturas** - Sem dependências
6. **motoristas** - Sem dependências
7. **viagens** - Depende de motoristas e viaturas
8. **encomendas** - Depende de clientes e viagens
9. **pagamentos** - Depende de encomendas

#### Código das Tabelas Principais:

**Tabela roles:**

```sql
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(200),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tabela usuarios:**

```sql
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(50),
    ativo BOOLEAN NOT NULL DEFAULT true,
    conta_nao_expirada BOOLEAN NOT NULL DEFAULT true,
    credenciais_nao_expiradas BOOLEAN NOT NULL DEFAULT true,
    conta_nao_bloqueada BOOLEAN NOT NULL DEFAULT true,
    ultimo_login TIMESTAMP,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Tabela usuarios_roles (junção):**

```sql
CREATE TABLE IF NOT EXISTS usuarios_roles (
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, role_id)
);
```

#### Índices Criados:

**Para autenticação:**
- `idx_usuarios_username` - Busca rápida por username
- `idx_usuarios_email` - Busca rápida por email
- `idx_usuarios_ativo` - Filtro de usuários ativos
- `idx_roles_nome` - Busca rápida por nome da role
- `idx_usuarios_roles_usuario` - Join eficiente
- `idx_usuarios_roles_role` - Join eficiente

**Para outras tabelas:**
- Índices em foreign keys (clientes, viagens, encomendas, etc.)
- Índices em campos de busca frequente (status, datas, etc.)

#### Dados Iniciais (Seeds):

**Roles padrão:**
```sql
INSERT INTO roles (nome, descricao) VALUES
    ('ROLE_ADMIN', 'Administrador do sistema com acesso total'),
    ('ROLE_GERENTE', 'Gerente com acesso a gestão completa'),
    ('ROLE_USER', 'Utilizador padrão com acesso limitado')
ON CONFLICT (nome) DO NOTHING;
```

**Usuário admin padrão:**
```sql
INSERT INTO usuarios (username, password, nome, email, ...) VALUES
    ('admin', '$2a$10$...', 'Administrador', 'admin@lirandzo.co.mz', ...)
ON CONFLICT (username) DO NOTHING;
```

**Senha padrão:** `admin123` (deve ser alterada após primeiro login)

## Estrutura Completa da Base de Dados

### Tabelas de Autenticação:
1. **roles** - Papéis/permissões do sistema
2. **usuarios** - Usuários do sistema
3. **usuarios_roles** - Associação usuário-role (Many-to-Many)

### Tabelas de Negócio:
4. **clientes** - Clientes da empresa
5. **viaturas** - Veículos da frota
6. **motoristas** - Motoristas
7. **viagens** - Viagens realizadas
8. **encomendas** - Encomendas de clientes
9. **pagamentos** - Pagamentos de encomendas

### Relações:

```
usuarios ←→ roles (Many-to-Many via usuarios_roles)
clientes ←→ encomendas (One-to-Many)
motoristas ←→ viagens (One-to-Many)
viaturas ←→ viagens (One-to-Many)
viagens ←→ encomendas (One-to-Many)
encomendas ←→ pagamentos (One-to-Many)
```

## Como usar

### Opção 1: Executar Script SQL Manualmente

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Executar script
\i lirandzo-backend/scripts/init-database.sql
```

### Opção 2: Usar Docker Compose

```bash
# Copiar script para container
docker cp lirandzo-backend/scripts/init-database.sql lirandzo-postgres:/tmp/

# Executar no container
docker exec -i lirandzo-postgres psql -U postgres < lirandzo-backend/scripts/init-database.sql
```

### Opção 3: Hibernate Auto-Create (Desenvolvimento)

O Hibernate criará automaticamente as tabelas se:
- `spring.jpa.hibernate.ddl-auto=update` estiver configurado
- As entidades JPA estiverem corretas

**Nota:** Em produção, usar `validate` e executar scripts SQL manualmente.

## Credenciais Padrão

**Usuário Admin:**
- Username: `admin`
- Password: `admin123`
- Email: `admin@lirandzo.co.mz`
- Role: `ROLE_ADMIN`

**⚠️ IMPORTANTE:** Alterar a senha após primeiro login!

## Impacto

### Antes:
- ❌ Sem sistema de autenticação
- ❌ Script SQL incompleto
- ❌ Tabelas sem ordem lógica
- ❌ Faltavam índices importantes
- ❌ Sem dados iniciais

### Depois:
- ✅ Sistema completo de autenticação (Usuario + Role)
- ✅ Script SQL completo e organizado
- ✅ Tabelas na ordem correta (dependências respeitadas)
- ✅ Índices otimizados para performance
- ✅ Dados iniciais (roles e usuário admin)
- ✅ Estrutura pronta para Spring Security

## Próximos passos

- [ ] Implementar UserDetailsService para autenticação
- [ ] Criar endpoints de login/registro
- [ ] Configurar JWT para autenticação stateless
- [ ] Atualizar SecurityConfig para usar autenticação real
- [ ] Criar testes para autenticação

## Referências

- Ver `lirandzo-backend/scripts/init-database.sql` para script completo
- Ver `lirandzo-backend/src/main/java/com/lirandzo/entity/Usuario.java` para entidade Usuario
- Ver `lirandzo-backend/src/main/java/com/lirandzo/entity/Role.java` para entidade Role
