# Correção Password Docker PostgreSQL

**Data:** 2025-01-08  
**Tipo:** Correção  
**Status:** ✅ Resolvido

## Problema

Backend não conseguia conectar ao PostgreSQL Docker:
```
FATAL: password authentication failed for user "postgres"
```

## Causa

O container Docker foi criado antes de atualizarmos a password no `docker-compose.yml` para "admin". O volume Docker mantinha a password antiga.

## Solução Aplicada

1. ✅ Password alterada dentro do container:
   ```powershell
   docker exec -e PGPASSWORD=admin lirandzo-postgres psql -U postgres -d postgres -c "ALTER USER postgres WITH PASSWORD 'admin';"
   ```

2. ✅ Verificação bem-sucedida:
   - Conexão funciona
   - Base de dados existe
   - 9 tabelas criadas

## Configuração Atual

- **Container:** lirandzo-postgres
- **Porta:** 5433 (host) -> 5432 (container)
- **Usuário:** postgres
- **Password:** admin
- **Base de dados:** lirandzo_db

## Se Problema Persistir

Execute o script de correção:
```powershell
.\scripts\fix-docker-password.ps1
```

Ou recrie o container manualmente:
```powershell
docker stop lirandzo-postgres
docker rm lirandzo-postgres
docker-compose up postgres -d
```

## Próximo Passo

Iniciar backend:
```powershell
cd lirandzo-backend
mvn spring-boot:run
```
