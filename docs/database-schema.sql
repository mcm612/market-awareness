-- Market Awareness Database Schema
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(20) DEFAULT 'stock' CHECK (asset_type IN ('stock', 'future', 'option', 'crypto')),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicate symbols per user
  UNIQUE(user_id, symbol)
);

-- Create sentiment_data table for storing sentiment analysis
CREATE TABLE IF NOT EXISTS sentiment_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  timeframe VARCHAR(10) NOT NULL CHECK (timeframe IN ('1D', '1W', '1M', '3M', '6M')),
  sentiment VARCHAR(10) NOT NULL CHECK (sentiment IN ('bullish', 'bearish', 'neutral')),
  confidence DECIMAL(5,2) DEFAULT 0.0 CHECK (confidence >= 0 AND confidence <= 100),
  data_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicate sentiment data
  UNIQUE(symbol, timeframe, data_date)
);

-- Create market_data table for caching market information
CREATE TABLE IF NOT EXISTS market_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255),
  price DECIMAL(12,4),
  change_amount DECIMAL(12,4),
  change_percent DECIMAL(8,4),
  volume BIGINT,
  market_cap BIGINT,
  pe_ratio DECIMAL(8,4),
  beta DECIMAL(8,4),
  high_52w DECIMAL(12,4),
  low_52w DECIMAL(12,4),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  currency VARCHAR(3) DEFAULT 'USD',
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  notifications JSONB DEFAULT '{"price_alerts": true, "sentiment_changes": true, "earnings": false, "news": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for watchlists
CREATE POLICY "Users can view own watchlists" ON watchlists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlists" ON watchlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlists" ON watchlists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlists" ON watchlists
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlists_symbol ON watchlists(symbol);
CREATE INDEX IF NOT EXISTS idx_sentiment_symbol ON sentiment_data(symbol);
CREATE INDEX IF NOT EXISTS idx_sentiment_timeframe ON sentiment_data(timeframe, data_date);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data(symbol);
CREATE INDEX IF NOT EXISTS idx_market_data_updated ON market_data(last_updated);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_watchlists_updated_at BEFORE UPDATE ON watchlists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sentiment_data_updated_at BEFORE UPDATE ON sentiment_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample sentiment data for testing
INSERT INTO sentiment_data (symbol, timeframe, sentiment, confidence, data_date) VALUES
('AAPL', '1D', 'bullish', 85.0, CURRENT_DATE),
('AAPL', '1W', 'bullish', 78.0, CURRENT_DATE),
('AAPL', '1M', 'neutral', 65.0, CURRENT_DATE),
('AAPL', '3M', 'bearish', 72.0, CURRENT_DATE),
('AAPL', '6M', 'neutral', 58.0, CURRENT_DATE),
('TSLA', '1D', 'bearish', 88.0, CURRENT_DATE),
('TSLA', '1W', 'bearish', 82.0, CURRENT_DATE),
('TSLA', '1M', 'bearish', 75.0, CURRENT_DATE),
('TSLA', '3M', 'neutral', 60.0, CURRENT_DATE),
('TSLA', '6M', 'bullish', 70.0, CURRENT_DATE),
('NVDA', '1D', 'bullish', 92.0, CURRENT_DATE),
('NVDA', '1W', 'bullish', 89.0, CURRENT_DATE),
('NVDA', '1M', 'bullish', 85.0, CURRENT_DATE),
('NVDA', '3M', 'bullish', 80.0, CURRENT_DATE),
('NVDA', '6M', 'bullish', 75.0, CURRENT_DATE)
ON CONFLICT (symbol, timeframe, data_date) DO NOTHING;