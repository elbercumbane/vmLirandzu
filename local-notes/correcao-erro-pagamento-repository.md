# Correção Erro PagamentoRepository

**Data:** 2025-01-08  
**Tipo:** Correção  
**Status:** ✅ Corrigido

## Problema

Erro ao iniciar backend:
```
No property 'id' found for type 'Encomenda'; Traversed path: Pagamento.encomenda
```

**Causa:** O método `findByEncomendaId` estava tentando acessar `encomenda.id`, mas a entidade `Encomenda` usa `numeroEncomenda` como chave primária, não `id`.

## Solução

### 1. Corrigido PagamentoRepository
**Antes:**
```java
List<Pagamento> findByEncomendaId(Long encomendaId);
```

**Depois:**
```java
List<Pagamento> findByEncomendaNumeroEncomenda(Long numeroEncomenda);
```

### 2. Atualizado PagamentoService
Todas as chamadas foram atualizadas para usar o método correto:
- `findByEncomendaId()` → `findByEncomendaNumeroEncomenda()`

### 3. Removido Import Não Usado
- Removido `import java.util.stream.Collectors;`

## Estrutura da Entidade Encomenda

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
@Column(name = "numero_encomenda")
private Long numeroEncomenda;  // ← Este é o campo correto
```

## Ficheiros Modificados

- `lirandzo-backend/src/main/java/com/lirandzo/repository/PagamentoRepository.java`
- `lirandzo-backend/src/main/java/com/lirandzo/service/PagamentoService.java`

## Próximo Passo

Reiniciar o backend:
```powershell
cd lirandzo-backend
mvn spring-boot:run
```

O backend deve iniciar corretamente agora.
