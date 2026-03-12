# CRUD Completo para Cotações, Viagens e Guias de Remessa

## ✅ Concluído

### Backend
1. **Entidades criadas:**
   - `Cotacao.java` - Entidade para cotações
   - `GuiaRemessa.java` - Entidade para guias de remessa
   - `ItemGuiaRemessa.java` - Entidade para itens de guia

2. **Repositories criados:**
   - `CotacaoRepository.java` - Com `@EntityGraph` para carregar cliente
   - `GuiaRemessaRepository.java` - Com `@EntityGraph` para carregar relacionamentos
   - `ItemGuiaRemessaRepository.java`
   - `ViagemRepository.java` - Atualizado com `@EntityGraph`

3. **Services criados:**
   - `CotacaoService.java` - CRUD completo
   - `GuiaRemessaService.java` - CRUD completo
   - `ViagemService.java` - Atualizado para usar EntityGraph

4. **Controllers criados:**
   - `CotacaoController.java` - Endpoints REST completos
   - `GuiaRemessaController.java` - Endpoints REST completos
   - `ViagemController.java` - Já existia, mantido

5. **Base de dados:**
   - Script SQL atualizado (`create-tables-only.sql`) com tabelas para `cotacoes`, `guias_remessa` e `itens_guia_remessa`

### Frontend
1. **Serviços Angular criados:**
   - `cotacao.service.ts` - Serviço para API de cotações
   - `viagem.service.ts` - Serviço para API de viagens
   - `guia-remessa.service.ts` - Serviço para API de guias

2. **Componentes atualizados:**
   - `viagens-lista.component.ts` - Atualizado para usar API

## 🔄 Em Progresso

### Frontend - Componentes de Lista
- [x] Viagens - Atualizado para usar API
- [ ] Cotações - Precisa atualizar para usar API
- [ ] Guias - Precisa atualizar para usar API

### Frontend - Componentes de Detalhe
- [ ] Viagens - Criar componente de detalhe
- [ ] Cotações - Criar componente de detalhe
- [ ] Guias - Criar componente de detalhe

### Frontend - Componentes de Edição
- [ ] Viagens - Criar componente de edição
- [ ] Cotações - Criar componente de edição
- [ ] Guias - Criar componente de edição

### Rotas
- [ ] Adicionar rotas para detalhe e edição de Viagens
- [ ] Adicionar rotas para detalhe e edição de Cotações
- [ ] Adicionar rotas para detalhe e edição de Guias

## 📝 Notas

- Todos os endpoints seguem o padrão REST: GET, POST, PUT, DELETE
- EntityGraph usado para evitar problemas de lazy loading
- Serviços Angular seguem o mesmo padrão de `EncomendaService`
- Componentes seguem o padrão de `EncomendasListaComponent`, `EncomendasDetalheComponent` e `EncomendasEditarComponent`

## 🚀 Próximos Passos

1. Atualizar componentes de lista de Cotações e Guias para usar API
2. Criar componentes de detalhe para os três módulos
3. Criar componentes de edição para os três módulos
4. Adicionar rotas no `app.routes.ts`
5. Testar integração completa
