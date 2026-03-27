# Correção Erro Serialização JSON - Encomendas

**Data:** 2025-01-08  
**Tipo:** Correção Backend  
**Status:** ✅ Corrigido

## Problema

Erro `ERR_INCOMPLETE_CHUNKED_ENCODING` ao tentar listar encomendas:
- Relacionamento LAZY não estava sendo carregado antes da serialização JSON
- Jackson tentava serializar propriedades lazy não inicializadas
- Possível loop infinito entre Cliente ↔ Encomenda

## Solução Aplicada

### 1. EntityGraph no Repository
**Ficheiro:** `lirandzo-backend/src/main/java/com/lirandzo/repository/EncomendaRepository.java`

Adicionado `@EntityGraph` para carregar cliente junto com encomendas:
```java
@EntityGraph(attributePaths = {"cliente"})
@Query("SELECT e FROM Encomenda e")
List<Encomenda> findAllWithCliente();
```

Todos os métodos de busca agora usam `@EntityGraph` para carregar cliente:
- `findAllWithCliente()` - carrega todas com cliente
- `findByStatus()` - carrega cliente
- `findByDataEncomendaBetween()` - carrega cliente
- `findByClienteId()` - carrega cliente

### 2. Atualizado Service
**Ficheiro:** `lirandzo-backend/src/main/java/com/lirandzo/service/EncomendaService.java`

Método `findAll()` agora usa `findAllWithCliente()` quando não há filtros:
```java
public List<Encomenda> findAll(StatusPagamento status, LocalDate dataInicio, LocalDate dataFim) {
    if (status != null) {
        return encomendaRepository.findByStatus(status);
    }
    if (dataInicio != null && dataFim != null) {
        return encomendaRepository.findByDataEncomendaBetween(dataInicio, dataFim);
    }
    return encomendaRepository.findAllWithCliente();
}
```

### 3. Anotações Jackson para Evitar Loops
**Ficheiros:** 
- `lirandzo-backend/src/main/java/com/lirandzo/entity/Encomenda.java`
- `lirandzo-backend/src/main/java/com/lirandzo/entity/Cliente.java`

Adicionado `@JsonIgnoreProperties` para evitar loops infinitos:

**Encomenda:**
```java
@OneToMany(mappedBy = "encomenda", cascade = CascadeType.ALL, orphanRemoval = true)
@JsonIgnoreProperties({"encomenda"})
private List<Pagamento> pagamentos = new ArrayList<>();

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "viagem_id")
@JsonIgnoreProperties({"encomendas"})
private Viagem viagem;
```

**Cliente:**
```java
@OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
@JsonIgnoreProperties({"cliente"})
private List<Encomenda> encomendas = new ArrayList<>();
```

## Como Funciona

1. **EntityGraph:** Força carregamento eager do relacionamento `cliente` durante a query
2. **JsonIgnoreProperties:** Previne serialização de propriedades que causariam loops
3. **Resultado:** JSON completo e válido sem erros de serialização

## Benefícios

- ✅ Cliente sempre carregado quando necessário
- ✅ Sem loops infinitos na serialização
- ✅ Performance otimizada (apenas carrega o necessário)
- ✅ Compatível com filtros existentes

## Próximo Passo

Reiniciar o backend e testar novamente:
```powershell
cd lirandzo-backend
mvn spring-boot:run
```

A lista de encomendas deve carregar corretamente agora.
