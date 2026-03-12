# Setup Base de Dados Concluído

**Data:** 2025-01-08  
**Tipo:** Configuração Completa  
**Status:** ✅ Concluído

## O que foi feito

1. ✅ Password PostgreSQL configurada para "admin" (local)
2. ✅ Docker PostgreSQL iniciado e configurado
3. ✅ Base de dados `lirandzo_db` criada
4. ✅ Todas as tabelas criadas (9 tabelas)

## Tabelas Criadas

1. **roles** - Papéis/permissões do sistema
2. **usuarios** - Usuários do sistema
3. **usuarios_roles** - Associação usuário-role (Many-to-Many)
4. **clientes** - Clientes da empresa
5. **viaturas** - Veículos da frota
6. **motoristas** - Motoristas
7. **viagens** - Viagens realizadas
8. **encomendas** - Encomendas de clientes
9. **pagamentos** - Pagamentos de encomendas

## Configuração Final

### Docker PostgreSQL:
- **Container:** lirandzo-postgres
- **Porta Host:** 5433
- **Porta Container:** 5432
- **Usuário:** postgres
- **Password:** admin
- **Base de dados:** lirandzo_db

### PostgreSQL Local:
- **Porta:** 5432
- **Usuário:** postgres
- **Password:** admin
- **Base de dados:** lirandzo_db

## Scripts Criados

- `scripts/setup-database-automatico.ps1` - Script automático que funciona com Docker ou PostgreSQL local
- `scripts/setup-completo-automatico.ps1` - Script completo com Docker
- `scripts/configurar-password-auto.ps1` - Script para configurar password automaticamente

## Como Usar

### Para recriar base de dados e tabelas:

```powershell
cd "C:\Users\Elber Elizio\Desktop\DAP PROJECTOS\vmLirandzu"
.\scripts\setup-database-automatico.ps1
```

### Para testar conexão:

**Via Docker:**
```powershell
docker exec -it lirandzo-postgres psql -U postgres -d lirandzo_db
```

**Via PostgreSQL Local:**
```powershell
$env:PGPASSWORD = "admin"
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h localhost -p 5432 -d lirandzo_db
```

### Para ver tabelas:

```sql
\dt
```

## Próximos Passos

1. ✅ Base de dados criada
2. ✅ Tabelas criadas
3. ⏭️ Iniciar backend Spring Boot
4. ⏭️ Testar endpoints da API
5. ⏭️ Conectar frontend Angular

## Notas

- O aviso sobre collation foi corrigido no script (usa template0)
- Todas as configurações estão prontas para desenvolvimento
- Backend está configurado para conectar automaticamente
