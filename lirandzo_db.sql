-- Migração: Cotações - adicionar fonte do pedido, tipo de serviço e suporte a revisões
-- Executar em bases de dados existentes (não faz parte do init-database.sql)

-- Fonte do pedido: PORTAL, WHATSAPP, TELEFONE, EMAIL, MANUAL
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS request_source VARCHAR(50) DEFAULT 'MANUAL';

-- Tipo de serviço: TRANSPORTE ou COMPRA_TRANSPORTE
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS tipo_servico VARCHAR(50) DEFAULT 'TRANSPORTE';

-- Suporte a revisões (nova cotação ligada à original)
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS revisao_de_id BIGINT REFERENCES quotations(id) ON DELETE SET NULL;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS revisao_numero INTEGER DEFAULT 1;

-- Preencher request_source para cotações existentes com observações "Pedido vindo do portal"
UPDATE quotations SET request_source = 'PORTAL' 
WHERE notes LIKE '%portal%' OR notes LIKE '%Portal%';

-- Índice para buscas por fonte e tipo de serviço
CREATE INDEX IF NOT EXISTS idx_quotations_request_source ON quotations(request_source);
CREATE INDEX IF NOT EXISTS idx_quotations_tipo_servico ON quotations(tipo_servico);
CREATE INDEX IF NOT EXISTS idx_quotations_revisao_de ON quotations(revisao_de_id);
