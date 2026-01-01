-- Migração: Adicionar colunas de divergência na tabela readings
-- Data: 2026-01-01
-- Descrição: Adiciona suporte para detecção de divergências entre o motorista no banco e o motorista real

-- Adicionar coluna has_divergence (boolean)
ALTER TABLE readings 
ADD COLUMN IF NOT EXISTS has_divergence BOOLEAN DEFAULT FALSE;

-- Adicionar coluna real_driver_name (texto opcional)
ALTER TABLE readings 
ADD COLUMN IF NOT EXISTS real_driver_name TEXT;

-- Criar índice para facilitar consultas de divergências
CREATE INDEX IF NOT EXISTS idx_readings_divergence 
ON readings(has_divergence) 
WHERE has_divergence = TRUE;

-- Comentários para documentação
COMMENT ON COLUMN readings.has_divergence IS 'Indica se há divergência entre o motorista no banco e o motorista real';
COMMENT ON COLUMN readings.real_driver_name IS 'Nome do motorista real digitado pelo fiscal quando há divergência';
