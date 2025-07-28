# Market Awareness - Claude Development Notes

## Project Overview
A comprehensive market awareness web application for retail investors featuring real-time stock/futures search, personal watchlists, and multi-timeframe sentiment analysis.

**Repository**: https://github.com/mcm612/market-awareness  
**Technology Stack**: Next.js 14, TypeScript, Supabase, CSS Modules, Yahoo Finance API

## Current Status ✅

### Completed Features
- ✅ **Authentication System**: Complete Supabase auth with email confirmation
- ✅ **Stock/Futures Search**: Real-time search with Yahoo Finance API integration
- ✅ **Watchlist Management**: Add/remove assets with live price updates
- ✅ **Professional UI Components**: Modal dialogs and toast notifications
- ✅ **Multi-timeframe Sentiment Display**: UI framework for 1D, 1W, 1M, 3M, 6M analysis
- ✅ **Database Schema**: Complete with RLS policies and sample data
- ✅ **Automatic Refresh**: Watchlist updates immediately when assets are added
- ✅ **Error Handling**: Professional user feedback for all operations
- ✅ **Fintech UI Styling**: Modern glassmorphism effects, gradients, professional design
- ✅ **Production Deployment**: Live on Vercel at https://market-awareness.vercel.app
- ✅ **Modal System**: Portal-based rendering with proper z-index management
- ✅ **Cross-browser Compatibility**: Fixed placeholder text visibility issues

### Technical Architecture

#### Core Components
- `StockSearch`: Debounced search with keyboard navigation and futures support
- `WatchlistDisplay`: Live price updates with sentiment analysis display
- `Notification`: Toast-style notifications (success/error/warning/info)
- `ConfirmModal`: Professional confirmation dialogs
- `AuthContext`: Centralized authentication state management

#### API Integration
- `/api/search`: Server-side proxy for Yahoo Finance search (CORS bypass)
- `/api/quote`: Server-side proxy for real-time price data
- Market data service with futures, crypto, and options support
- Automatic fallback to mock data on API failures

#### Database Schema
```sql
-- Key tables with RLS enabled
- watchlists: User assets with asset_type constraints
- sentiment_data: Multi-timeframe analysis storage
- market_data: Price data caching
- user_preferences: User settings and notifications
```

#### Key Technical Decisions
- **CSS Modules** preferred over inline Tailwind for better maintainability
- **Server-side API routes** to handle CORS restrictions
- **Proper asset type mapping**: equity→stock, future→future, cryptocurrency→crypto
- **Professional UI patterns** replacing basic browser alerts
- **Real-time data** preferred over mock data where possible

## Development Environment Setup

### Prerequisites
- Node.js 18.18.0+ (user had 18.12.1, upgraded to Node 20)
- Supabase project with environment variables
- GitHub repository configured

### Local Development
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run typecheck  # TypeScript checking
```

### Environment Variables Required
```
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://bpupjzbxiwerqinlgwls.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Sentiment Analysis APIs (In Progress)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
OPENAI_API_KEY=sk-your_openai_key_here
```

## Current Todo List 📋

### 🔥 In Progress (Current Session)
- ⏳ **Sentiment Reasoning System**: Adding "WHY" explanations for bullish/bearish/neutral states
  - ✅ Database schema updated (reasoning, news_sources, last_updated columns)
  - ⏳ Getting API keys: Alpha Vantage (free news) + OpenAI (cheap analysis)
  - ⏳ API implementation: `/api/sentiment-analysis` endpoint
  - ⏳ UI components: Expandable "Why?" buttons with cited news sources
  - ⏳ Smart caching: 24hr cache to maximize free API usage (25 calls/day limit)

### High Priority
- ✅ **Deploy to Vercel**: Live at https://market-awareness.vercel.app
- [ ] **Complete Sentiment Reasoning**: Finish current implementation

### Medium Priority  
- [ ] **Add Technical Indicators**: RSI, MACD, Moving Averages, etc.
- [ ] **Enhanced Asset Support**: ETFs, bonds, more commodity futures
- [ ] **Price Alerts**: User-configurable notifications
- [ ] **Charts and Visualizations**: Price history and technical analysis charts

### Low Priority
- [ ] **Portfolio Tracking**: P&L calculations and performance metrics
- [ ] **Advanced Analytics**: Correlation analysis, sector performance
- [ ] **Mobile App**: React Native or PWA version
- [ ] **Social Features**: Share watchlists, community sentiment

## Known Issues & Fixes Applied

### Resolved Issues
1. **Node.js Version**: Upgraded from 18.12.1 to Node 20 via nvm
2. **Email Confirmation**: User clicked confirmation link to activate account
3. **CORS Errors**: Fixed with server-side API proxy routes
4. **Database Constraints**: Fixed asset_type mapping (was using 'other', now uses valid values)
5. **Watchlist Auto-refresh**: Implemented callback system between components
6. **UI/UX**: Replaced browser alerts with professional modal components

## Deployment Notes

### Vercel Setup (Next Steps)
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set up custom domain if desired
4. Configure build settings for optimal performance

### Production Considerations
- Environment variable management
- Error logging and monitoring
- Performance optimization
- Security headers and CORS policies

## Code Patterns & Conventions

### Component Structure
```
src/components/
├── auth/          # Authentication components
├── search/        # Search functionality
├── ui/           # Reusable UI components
└── watchlist/    # Watchlist management
```

### Styling Approach
- CSS Modules for component-specific styles
- Tailwind utility classes for layout and spacing
- Consistent design tokens across components
- Mobile-responsive design patterns

### State Management
- React Context for authentication
- Local component state for UI interactions
- Supabase for persistent data
- Real-time updates via API polling

## Future Development Guidelines

### When Starting New Session
1. Review this CLAUDE.md file first
2. Check current branch status and recent commits
3. Verify development environment is running
4. Review any open issues or TODOs
5. Test current functionality before adding features

### Code Quality Standards
- TypeScript for all new code
- Comprehensive error handling
- User-friendly feedback messages
- Mobile-responsive design
- Proper accessibility features

## Resources & References

### Documentation
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Yahoo Finance API](https://rapidapi.com/apidojo/api/yahoo-finance1/)

### Project Files
- Database schema: `/docs/database-schema-fixed.sql`
- Requirements: `/docs/requirements/project-requirements.md`
- Mock plans: `/docs/mockups/mockup-plan.md`

---

## Sentiment Reasoning Implementation Plan 🧠

### Free Tier Strategy (Current)
- **Alpha Vantage News API**: 25 calls/day free tier
- **OpenAI GPT-3.5-turbo**: ~$0.002/1K tokens (very cheap)
- **Smart Usage**: Update 2-3 symbols daily, 24hr caching
- **User Control**: Manual refresh option for priority symbols

### Database Schema Changes Applied
```sql
-- Run in Supabase SQL Editor
ALTER TABLE sentiment_data 
ADD COLUMN IF NOT EXISTS reasoning TEXT,
ADD COLUMN IF NOT EXISTS news_sources JSONB,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP DEFAULT NOW();
```

### API Flow Design
1. User clicks "Why?" → Check cache (24hr)
2. If stale → Fetch news (Alpha Vantage)
3. Analyze with OpenAI → Generate reasoning
4. Store with citations → Display to user

### UI Component Structure
```
Sentiment Badge: 🟢 Bullish [Why?] ← Expandable
  ↓ Expands to show:
📰 Reasoning: "Bullish due to..."
📎 Sources: • "News headline" - Reuters
```

---

**Last Updated**: Current session - Implementing sentiment reasoning system  
**Next Session Goal**: Complete sentiment reasoning with API integration  
**Current Status**: Getting API keys for Alpha Vantage + OpenAI  
**Contact**: michael.manguart@gmail.com (GitHub: mcm612)

### 🚨 Session Handoff Notes
If this session closes before completion:
1. **API Keys Needed**: Alpha Vantage (free) + OpenAI ($5 credit)
2. **Database Updated**: Schema ready for reasoning storage
3. **Files Created**: `/docs/sentiment-reasoning-schema.sql`
4. **Next Steps**: Build `/api/sentiment-analysis` endpoint + UI components

---

🤖 *This file was generated with Claude Code to maintain development continuity across sessions*