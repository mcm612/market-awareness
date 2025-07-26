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
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Current Todo List 📋

### High Priority
- [ ] **Deploy to Vercel**: Get app live for real-world testing
- [ ] **Implement Real Sentiment Analysis**: Replace mock sentiment data with actual analysis

### Medium Priority  
- [ ] **Complete Sentiment Analysis**: Integrate real sentiment API (Alpha Vantage, Finnhub, etc.)
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

**Last Updated**: Created during initial development session  
**Next Session Goal**: Deploy to Vercel and implement real sentiment analysis  
**Contact**: michael.manguart@gmail.com (GitHub: mcm612)

---

🤖 *This file was generated with Claude Code to maintain development continuity across sessions*