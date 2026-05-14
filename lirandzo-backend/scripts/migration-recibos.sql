-- Recibos emitidos automaticamente por pagamento confirmado (baixa na factura).
-- Executar na base existente após deploy do backend.

CREATE TABLE IF NOT EXISTS recibos (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL UNIQUE REFERENCES payments(id) ON DELETE CASCADE,
    public_number VARCHAR(32) NOT NULL UNIQUE,
    ano INTEGER NOT NULL,
    sequencia INTEGER NOT NULL,
    issued_at TIMESTAMP NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    customer_name VARCHAR(200),
    invoice_number VARCHAR(80),
    payment_reference VARCHAR(100),
    payment_method VARCHAR(50)
);


CREATE INDEX IF NOT EXISTS idx_recibos_issued ON recibos(issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_recibos_ano_seq ON recibos(ano, sequencia);
