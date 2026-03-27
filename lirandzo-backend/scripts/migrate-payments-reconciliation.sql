-- Pagamentos: método e estado de verificação (conciliação manual com extrato / M-Pesa)
-- CONFIRMED = contabiliza na dívida; PENDING_BANK = registado, aguarda confirmação no banco

ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS verification_status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED';

UPDATE payments SET verification_status = 'CONFIRMED' WHERE verification_status IS NULL OR verification_status = '';

CREATE INDEX IF NOT EXISTS idx_payments_verification_status ON payments(verification_status);
