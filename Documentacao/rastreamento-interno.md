# Rastreio interno (facturação)

## O que foi implementado

- **Base de dados:** coluna `tracking_code` na tabela `orders` (único quando preenchido), gerada automaticamente ao gravar encomendas e preenchida em falta ao abrir `GET /encomendas/{id}`.
- **API:** `GET /api/rastreamento/encomenda/{numero}` devolve a linha temporal (`RastreamentoTimelineDTO`): cotação → proposta → aceitação (quando aplicável) → factura → pagamentos (confirmados / pendentes de extrato) → viagem (planeada, trânsito, entrega).
- **Frontend (billing):** na página **Detalhes da encomenda** (`/billing/encomendas/:id`) aparecem o **código TRK-…** e a **linha temporal** com barra de progresso.

## Portal público (`/rastreio`)

Por decisão de produto, **não há endpoint público** ainda: a página continua com dados de exemplo. Quando existir API pública, poderá usar `tracking_code` ou número de factura.

## Migração em produção

Se `spring.jpa.hibernate.ddl-auto=validate`, executar antes do deploy:

`lirandzo-backend/scripts/migration-add-tracking-code.sql`
