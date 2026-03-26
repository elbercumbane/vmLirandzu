# Nota: Geração de Hash BCrypt para Senhas

**Data:** 2025-01-08  
**Tipo:** Nota Técnica

## Importante

O hash BCrypt no script SQL (`init-database.sql`) é um exemplo. Para gerar o hash correto da senha `admin123`, use uma das seguintes opções:

## Opção 1: Usando Spring Boot (Recomendado)

Criar uma classe utilitária ou usar no código:

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
String hash = encoder.encode("admin123");
System.out.println(hash);
```

## Opção 2: Online (Apenas para desenvolvimento)

Usar ferramenta online como: https://bcrypt-generator.com/

**⚠️ NUNCA use ferramentas online em produção!**

## Opção 3: Linha de Comando

```bash
# Com bcrypt-cli (instalar via npm)
npm install -g bcrypt-cli
bcrypt-cli admin123
```

## Atualizar Script SQL

Após gerar o hash, substituir no `init-database.sql`:

```sql
INSERT INTO usuarios (username, password, nome, email, ...) VALUES
    ('admin', 'HASH_GERADO_AQUI', 'Administrador', 'admin@lirandzo.co.mz', ...)
```

## Alternativa: Criar Usuário via API

Após implementar endpoints de registro, criar o usuário admin via API:

```http
POST /api/auth/register
{
  "username": "admin",
  "password": "admin123",
  "nome": "Administrador",
  "email": "admin@lirandzo.co.mz",
  "roles": ["ROLE_ADMIN"]
}
```

O sistema encriptará automaticamente a senha.
