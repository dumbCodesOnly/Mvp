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
- Real-time Bitcoin metrics fetched from public APIs (CoinGecko, Blockchain.info, Mempool.space)
- 5-minute caching layer to reduce API calls
- Circuit breaker pattern for API resilience:
  - Opens after 3 consecutive failures
  - CoinGecko: 120s recovery timeout (rate limiting protection)
  - Other APIs: 60s recovery timeout
  - Returns cached/fallback values when circuit is open
  - Half-open state for gradual recovery
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
- psycopg for PostgreSQL connectivity (Python 3.13 compatible)
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

**December 7, 2025:**
- Added auto-create admin user feature for easier deployment
  - Admin user is automatically created on first login if ADMIN_EMAIL and ADMIN_PASSWORD env vars are set
  - No database seeding required for admin access
  - Works on Render, Replit, and other platforms without needing to run seed scripts

**December 5, 2025 (Phase 7 - Advanced Features):**
- Added CSS animations and transitions for better UX
  - Fade-in animations on page load (animate-fade-in, animate-fade-in-up, animate-fade-in-down)
  - Slide animations for modals and dropdowns
  - Smooth hover effects (hover-scale, hover-glow, btn-transition)
  - Skeleton loading animations for loading states
  - Slow bounce animation for decorative elements (animate-bounce-slow)
- Implemented Toast notification system
  - ToastProvider context for global toast access
  - Support for success, error, warning, and info toasts
  - Auto-dismiss with configurable duration
  - Animated entrance/exit with progress bar
  - Used in Login, Register pages for user feedback
- Added LoadingSpinner component with multiple variants
  - Size options: sm, md, lg, xl
  - CardSkeleton for loading placeholder content
  - Integrates with existing pages for consistent loading UX
- Fixed BTC price API by switching from CoinDesk to CoinGecko
  - api.coindesk.com was returning 404 errors
  - Now using api.coingecko.com for reliable price data
- Updated Login/Register pages with animations and toast notifications
- Dashboard now uses skeleton loading states and staggered animations

**December 5, 2025 (Earlier):**
- Completed Phase 4 (Referral System): Added automated commission payout logic
  - New Payout model for tracking referral commissions
  - Automatic commission crediting when rentals are activated
  - Admin payout management routes (view, process individual, process all)
  - User payout viewing in referral stats
- Completed Phase 5 (Payment Integration): Full checkout flow
  - POST `/api/payments/checkout` - Create rental and payment order
  - PUT `/api/payments/:id/simulate-confirm` - Simulate payment confirmation for testing
  - Checkout page with miner details, crypto selection, order confirmation
  - Payments page showing payment history with status badges
  - Auto-activate rentals and credit referral commission on payment confirmation
- Completed Phase 8 (Deployment): Production configuration
  - Created `render.yaml` for Render deployment
  - Created `Procfile` for gunicorn production server
- Fixed database initialization: Tables now created on app startup via gunicorn
- Added Payments link to sidebar navigation

**December 5, 2025 (Earlier):**
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

## Replit Setup Guide

Follow these steps when importing this project into Replit:

### Step 1: Create PostgreSQL Database
- Use Replit's built-in PostgreSQL database tool to create a database
- This automatically sets `DATABASE_URL` and related environment variables

### Step 2: Set Required Secrets
Add the following secrets in Replit's Secrets tab:
- `SECRET_KEY` - Flask session secret (generate a random string)
- `JWT_SECRET_KEY` - JWT token secret (can be same as SECRET_KEY)
- `ADMIN_EMAIL` - Admin user email (auto-creates admin on first login)
- `ADMIN_PASSWORD` - Admin user password

Optional secrets:
- `MAINTENANCE_FEE_PERCENT` - Default: 5.0
- `REFERRAL_PERCENT` - Default: 3.0

### Step 3: Install Dependencies

**Python packages** (run in Shell):
```bash
pip install Flask Flask-SQLAlchemy Flask-Migrate Flask-JWT-Extended Flask-CORS psycopg2-binary python-dotenv requests gunicorn Werkzeug email-validator
```

**Node.js packages** (run in Shell):
```bash
cd frontend && npm install
```

### Step 4: Configure Workflows (IMPORTANT)

Set up **two separate workflows** to avoid restart issues:

1. **Backend API** workflow:
   - Command: `cd backend && gunicorn --bind 0.0.0.0:3000 --reuse-port --reload run:app`
   - Output type: Console
   - Port: 3000

2. **Frontend** workflow:
   - Command: `cd frontend && npm run dev`
   - Output type: Webview
   - Port: 5000

**Do NOT combine both servers into a single workflow with background processes** (using `&`). This causes restart issues where processes don't get properly terminated.

### Step 5: Seed Database (Optional)
To populate the database with sample miners and an admin user, first set the required environment variables:
```bash
export ADMIN_EMAIL="your-admin-email@example.com"
export ADMIN_PASSWORD="your-secure-password"
cd backend && python seed_data.py
```

**Important**: The `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables are required. The script will fail if they are not set, preventing insecure default credentials.

This creates:
- 6 mining hardware plans
- Admin user with your specified credentials

---

## Development Notes

**Running the Application:**
- Frontend: Vite dev server on port 5000 (proxies /api to backend)
- Backend: Flask dev server on port 3000

**Admin Access (Auto-Create Feature):**
- The admin user is automatically created on first login if `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables are set
- No database seeding required - just set the environment variables and log in
- The system will create the admin user with the specified credentials on first login attempt

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
- `GET /api/admin/payouts` - List all payouts with pending total
- `PUT /api/admin/payouts/:id/process` - Process individual payout
- `PUT /api/admin/payouts/process-all` - Process all pending payouts

**Payment API Endpoints:**
- `POST /api/payments/checkout` - Create rental order with payment
- `PUT /api/payments/:id/simulate-confirm` - Simulate payment confirmation
- `GET /api/payments/user` - Get user's payment history
- `GET /api/payments/:id` - Get payment details

**Referral API Endpoints:**
- `GET /api/referrals/` - Get user's referrals
- `GET /api/referrals/stats` - Get referral stats with pending/paid amounts
- `GET /api/referrals/payouts` - Get user's payout history

**Completed Phases:**
- Phase 1-6: Core functionality (Auth, Miners, Rentals, Referrals, Payments, Admin)
- Phase 7: Advanced Features (Animations, Toast notifications, Loading states)
- Phase 8: Deployment configuration (Render, Gunicorn)
- Phase 9: Production deployment and Android app setup (Capacitor)

## Android App (Capacitor)

The project is configured to build an Android APK using Capacitor.

**Setup:**
- Capacitor is installed and configured in `frontend/`
- Android platform added at `frontend/android/`
- App ID: `com.cloudminer.app`
- App Name: CloudMiner

**Building the Android APK:**
1. Set the production API URL: `export VITE_API_URL=https://your-deployed-url`
2. Build the web app: `cd frontend && npm run build`
3. Sync with Android: `npx cap sync android`
4. Open in Android Studio: `npx cap open android`
5. Build APK: Build → Build Bundle(s) / APK(s) → Build APK(s)

See `ANDROID_BUILD.md` for detailed instructions.

## Production Deployment (Replit)

The app is configured for Replit autoscale deployment:
- Build command: `cd frontend && npm run build`
- Run command: `cd backend && gunicorn --bind 0.0.0.0:5000 --reuse-port run:app`

Click "Publish" in Replit to deploy the production app.