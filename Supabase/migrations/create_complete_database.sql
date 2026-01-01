-- ============================================
-- SWIFTRIDE - Estrutura Completa do Banco de Dados
-- Data: 2026-01-01
-- Descrição: Cria todas as tabelas necessárias para o sistema
-- ============================================

-- 1. Tabela de Ônibus
CREATE TABLE IF NOT EXISTS buses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plate TEXT NOT NULL UNIQUE,
    bus_number TEXT,
    model TEXT,
    capacity INTEGER,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Motoristas
CREATE TABLE IF NOT EXISTS drivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    license_number TEXT UNIQUE,
    phone TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Rotas
CREATE TABLE IF NOT EXISTS routes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    origin TEXT,
    destination TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Escalas/Registros (Relaciona Ônibus + Motorista + Rota)
CREATE TABLE IF NOT EXISTS registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bus_id UUID REFERENCES buses(id) ON DELETE CASCADE,
    driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    location TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Leituras (QR Code Scans) - COM SUPORTE A DIVERGÊNCIAS
CREATE TABLE IF NOT EXISTS readings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    registration_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
    driver_name TEXT NOT NULL,
    bus_number TEXT NOT NULL,
    bus_plate TEXT NOT NULL,
    route_name TEXT NOT NULL,
    location TEXT,
    reading_location TEXT,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Campos de Divergência
    has_divergence BOOLEAN DEFAULT FALSE,
    real_driver_name TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índice para buscar leituras por placa
CREATE INDEX IF NOT EXISTS idx_readings_bus_plate ON readings(bus_plate);

-- Índice para buscar leituras por motorista
CREATE INDEX IF NOT EXISTS idx_readings_driver_name ON readings(driver_name);

-- Índice para buscar leituras por data
CREATE INDEX IF NOT EXISTS idx_readings_read_at ON readings(read_at DESC);

-- Índice para buscar divergências
CREATE INDEX IF NOT EXISTS idx_readings_divergence ON readings(has_divergence) WHERE has_divergence = TRUE;

-- ============================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================

COMMENT ON TABLE buses IS 'Cadastro de ônibus da frota';
COMMENT ON TABLE drivers IS 'Cadastro de motoristas';
COMMENT ON TABLE routes IS 'Cadastro de rotas/linhas';
COMMENT ON TABLE registrations IS 'Escalas ativas (relaciona ônibus + motorista + rota)';
COMMENT ON TABLE readings IS 'Leituras de QR Code realizadas pelos fiscais';

COMMENT ON COLUMN readings.has_divergence IS 'Indica se há divergência entre o motorista no banco e o motorista real';
COMMENT ON COLUMN readings.real_driver_name IS 'Nome do motorista real digitado pelo fiscal quando há divergência';

-- ============================================
-- HABILITAR REALTIME (para sincronização automática)
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE readings;
ALTER PUBLICATION supabase_realtime ADD TABLE registrations;

-- ============================================
-- FIM DO SCRIPT
-- ============================================
