# Bitcoin Cloud Mining Simulator

## Overview

A full-stack Bitcoin cloud mining simulator that allows users to rent virtual mining hardware, track profits in real-time, and earn referral commissions. The platform features JWT-based authentication, live Bitcoin market data integration, and comprehensive profit calculations based on actual network metrics.

**Tech Stack:**
- **Backend**: Flask (Python) REST API
- **Frontend**: React with TailwindCSS
- **Database**: PostgreSQL (with SQLAlchemy ORM)
- **Authentication**: JWT tokens via Flask-JWT-Extended
- **Deployment**: Render-ready with Gunicorn

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture

**Framework & Structure:**
- Flask application with blueprint-based modular routing
- Six main route modules: auth, miners, rentals, referrals, payments, stats
- Centralized database models with relationship management
- Factory pattern for app creation (`create_app()`)

**Authentication & Security:**
- JWT-based authentication with 24-hour token expiration
- Password hashing using Werkzeug's security utilities
- CORS enabled for cross-origin frontend requests
- Protected routes using `@jwt_required()` decorator

**Database Schema:**
- **Users**: Email/password auth, referral codes, admin flags
- **Miners**: Hardware specs (hashrate, power, efficiency, pricing)
- **Rentals**: User mining contracts with duration and profit tracking
- **Referrals**: Commission tracking between users
- **Payments**: Transaction records for rental purchases

All models use SQLAlchemy ORM with foreign key relationships and lazy loading for related data.

**Business Logic:**
- Real-time Bitcoin metrics fetched from public APIs (CoinDesk, Blockchain.info, Mempool.space)
- 5-minute caching layer to reduce API calls
- Profit calculations based on actual network hashrate and difficulty
- Maintenance fee system (5% default) and referral commissions (3% default)
- ROI calculations considering block rewards and network share

### Frontend Architecture

**Framework & Tooling:**
- React 18 with React Router for SPA navigation
- Vite as build tool and development server
- TailwindCSS for styling with custom dark theme
- Axios for HTTP requests to backend API

**Development Setup:**
- Vite dev server proxies `/api` requests to Flask backend (port 3000)
- Hot module replacement for rapid development
- PWA-ready configuration for mobile app export via Capacitor

**UI/UX Design:**
- Dark theme with gradient accents (purple/blue gradients)
- Glass morphism effects for cards
- Recharts for data visualization
- React Icons for UI elements
- Date-fns for date formatting

### External Dependencies

**Third-Party APIs:**
- **CoinDesk API**: Real-time Bitcoin price data
- **Blockchain.info API**: Network hashrate metrics
- **Mempool.space API**: Mining difficulty data
- All APIs have fallback values for resilience

**Database:**
- PostgreSQL as primary production database
- SQLite supported for local development
- Flask-Migrate for database version control
- Connection via `DATABASE_URL` environment variable

**Python Packages:**
- Flask ecosystem: SQLAlchemy, Migrate, JWT-Extended, CORS
- psycopg2-binary for PostgreSQL connectivity
- Requests library for external API calls
- Werkzeug for security utilities
- Gunicorn for production WSGI server

**Node.js Packages:**
- React Router DOM for client-side routing
- Axios for API communication
- Recharts for charts and graphs
- React Icons for iconography
- date-fns for date manipulation
- Autoprefixer & PostCSS for CSS processing

**Configuration:**
- Environment-based configuration via `Config` class
- Supports `SECRET_KEY`, `JWT_SECRET_KEY`, `DATABASE_URL`
- Configurable maintenance fees and referral percentages
- Bitcoin constants (block reward: 3.125 BTC, blocks per day: 144)

**Logging:**
- Rotating file handler (10MB max, 10 backups)
- Console and file logging with detailed formatting
- Debug mode logging for development
- Request/response logging throughout API routes

## Recent Changes

**December 5, 2025:**
- Completed Phase 6 (Admin Panel): Full admin dashboard with stats, miner CRUD management, user management with search/pagination
  - Admin-only route protection with `@admin_required` decorator
  - Dashboard stats: total users, miners, rentals, revenue, active hashrate
  - Miner management: create, update, delete miners with full form
  - User management: list all users, view details, toggle admin status
  - Admin navigation in sidebar (visible only to admin users)
- Completed Phase 3 (Frontend Dashboard): Added Sidebar navigation, Footer, UserStats cards, PriceChart, EarningsChart, and Miners filter bar with duration/hashrate/sorting controls
- Completed Phase 4 (Referral System): Implemented referral tracking, commission display, and shareable referral code generation
- Fixed Layout component for proper flex row display of sidebar and main content
- Added null check for user in referral stats endpoint
- Seeded database with 6 mining plans and admin user

## Development Notes

**Running the Application:**
- Frontend: Vite dev server on port 5000 (proxies /api to backend)
- Backend: Flask dev server on port 3000
- Start both: `cd backend && python run.py & cd frontend && npm run dev`

**Test Credentials:**
- Admin: admin@cloudminer.com / admin123

**Admin Panel Routes:**
- `/admin` - Admin Dashboard with stats overview
- `/admin/miners` - Miner management (CRUD)
- `/admin/users` - User management with search

**Admin API Endpoints:**
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - List all users (paginated)
- `GET /api/admin/users/:id` - User details
- `PUT /api/admin/users/:id/toggle-admin` - Toggle admin status
- `GET /api/admin/miners` - List miners with rental stats
- `POST /api/admin/miners` - Create miner
- `PUT /api/admin/miners/:id` - Update miner
- `DELETE /api/admin/miners/:id` - Delete miner
- `GET /api/admin/rentals` - List all rentals
- `GET /api/admin/payments` - List all payments

**Next Phases:**
- Phase 5: Payment Integration (Stripe/Crypto)
- Phase 7: Advanced Features (Maintenance windows, notifications)
- Phase 8: Deployment