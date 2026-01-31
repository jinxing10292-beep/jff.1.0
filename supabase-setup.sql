-- Supabase Casino Platform Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    two_factor_secret VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    CONSTRAINT username_length CHECK (char_length(username) >= 3),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    test_money DECIMAL(15, 2) DEFAULT 10000.00,
    real_money DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT positive_test_money CHECK (test_money >= 0),
    CONSTRAINT positive_real_money CHECK (real_money >= 0)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL,
    money_type VARCHAR(10) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    balance_before DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    game_type VARCHAR(50),
    game_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('BET', 'WIN', 'DEPOSIT', 'WITHDRAWAL', 'BONUS')),
    CONSTRAINT valid_money_type CHECK (money_type IN ('T', 'M'))
);

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_type VARCHAR(50) NOT NULL,
    money_type VARCHAR(10) NOT NULL,
    bet_amount DECIMAL(15, 2) NOT NULL,
    win_amount DECIMAL(15, 2) DEFAULT 0,
    game_data JSONB,
    result VARCHAR(20),
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_game_money_type CHECK (money_type IN ('T', 'M')),
    CONSTRAINT valid_result CHECK (result IN ('WIN', 'LOSS', 'DRAW', 'PUSH'))
);

-- Security logs table
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created_at ON game_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip_address ON security_logs(ip_address);

-- Function to update wallet timestamp
CREATE OR REPLACE FUNCTION update_wallet_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for wallet updates
DROP TRIGGER IF EXISTS wallet_update_timestamp ON wallets;
CREATE TRIGGER wallet_update_timestamp
BEFORE UPDATE ON wallets
FOR EACH ROW
EXECUTE FUNCTION update_wallet_timestamp();

-- Function to get game statistics
CREATE OR REPLACE FUNCTION get_game_stats(user_id_param UUID)
RETURNS TABLE (
    game_type VARCHAR,
    games_played BIGINT,
    total_bet DECIMAL,
    total_won DECIMAL,
    net_profit DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        gs.game_type,
        COUNT(*)::BIGINT as games_played,
        SUM(gs.bet_amount) as total_bet,
        SUM(gs.win_amount) as total_won,
        SUM(gs.win_amount - gs.bet_amount) as net_profit
    FROM game_sessions gs
    WHERE gs.user_id = user_id_param
    GROUP BY gs.game_type;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Users can only access their own data)
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own wallet" ON wallets
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own game sessions" ON game_sessions
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Service role can do everything (for backend operations)
CREATE POLICY "Service role full access users" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access wallets" ON wallets
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access transactions" ON transactions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access game_sessions" ON game_sessions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access security_logs" ON security_logs
    FOR ALL USING (auth.role() = 'service_role');
