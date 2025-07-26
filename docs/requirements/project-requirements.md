# Market Awareness App - Requirements

## Project Overview
A web application for retail investors to track stocks and futures with sentiment analysis across multiple timeframes.

## Target Users
- Retail investors
- Individual traders
- People wanting market insights

## Core Features

### 1. Stock/Futures Search
- Search functionality similar to Tasty Trade lookup
- Support for stocks and futures
- Auto-complete/suggestions
- Real-time search results

### 2. Watchlist Management
- Add stocks/futures to personal watchlist
- Remove items from watchlist
- Organize watchlist items
- Persistent storage per user

### 3. Sentiment Analysis
- Multi-timeframe sentiment: 1D, 1W, 1M, 3M, 6M
- Visual indicators: Bullish, Bearish, Neutral
- Clear visual representation for each timeframe

### 4. Market Data & Analytics
- Real-time price data
- Price targets from analysts
- Volume analysis
- Technical indicators (RSI, MACD, SMA, etc.)
- News sentiment
- Options flow data
- Earnings calendar
- Sector/industry trends

### 5. User Authentication
- User accounts and login
- Secure authentication
- Personal watchlists per user

## Technical Requirements

### Platform
- Web application (responsive design)
- Future mobile consideration

### Technology Stack
- Next.js 14 with TypeScript
- Tailwind CSS with CSS Modules
- Supabase (PostgreSQL + Auth)
- Recharts for financial charts

### Data Sources
- Primary: Polygon.io or Alpha Vantage
- Real-time market data
- News sentiment data
- Technical indicator calculations

### Performance Requirements
- Fast search (< 500ms)
- Real-time data updates
- Responsive design for all devices
- Efficient data caching

## User Flow
1. User registers/logs in
2. User searches for stocks/futures
3. User adds items to watchlist
4. User views sentiment analysis across timeframes
5. User accesses detailed analytics and market data

## Success Metrics
- Fast, intuitive stock search
- Clear sentiment visualization
- Comprehensive market data presentation
- Reliable real-time updates