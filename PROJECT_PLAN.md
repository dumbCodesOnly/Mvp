# Bitcoin Cloud Mining Simulator - Project Plan

## 🎯 Project Overview

A full-stack Bitcoin cloud mining simulator inspired by [Bitdeer](https://www.bitdeer.com/cloud-mining/btc), featuring:
- **Backend**: Flask (Python) RESTful API with PostgreSQL
- **Frontend**: React + TailwindCSS with modern dark theme
- **Real-time Data**: Live Bitcoin metrics from public APIs
- **Authentication**: JWT-based email/password system
- **Deployment**: Ready for Render deployment
- **Mobile**: PWA-ready for Capacitor APK export

---

## 📋 Implementation Phases

### ✅ PHASE 1: Backend Foundation (STEP 1)
**Goal**: Set up Flask API with modular architecture, database models, and JWT authentication

#### 1.1 Project Structure Setup
- [x] Create backend folder structure
  - `backend/app/` - Main application code
  - `backend/app/routes/` - API route modules
  - `backend/app/utils/` - Helper utilities
  - `backend/migrations/` - Database migrations
- [x] Install Python dependencies
  - Flask, Flask-SQLAlchemy, Flask-Migrate
  - Flask-JWT-Extended, Flask-CORS
  - psycopg2-binary, python-dotenv, requests
  - gunicorn (for production)

#### 1.2 Database Models (PostgreSQL)
- [x] **User Model**
  - id, email, password_hash, created_at
  - referral_code (unique), referred_by (foreign key)
  - is_admin (boolean)
- [x] **Miner Model**
  - id, name, hashrate_th (terahash/s), price_usd
  - efficiency (W/TH), power_watts, available_units
  - description, image_url
- [x] **Rental Model**
  - id, user_id (FK), miner_id (FK)
  - hashrate_allocated, start_date, end_date
  - is_active, total_profit_btc, monthly_fee_usd
- [x] **Referral Model**
  - id, referrer_id (FK), referred_id (FK)
  - commission_earned_usd, created_at
- [x] **Payment Model**
  - id, user_id (FK), rental_id (FK)
  - amount_usd, crypto_type, tx_hash
  - status (pending/confirmed/failed), confirmed_at

#### 1.3 Authentication Routes (`/api/auth`)
- [x] POST `/register` - Create new user with hashed password
- [x] POST `/login` - Return JWT access token
- [x] GET `/profile` - Get current user info (protected)
- [x] Helper: Generate unique referral codes

#### 1.4 Configuration
- [x] Create `config.py` with environment-based settings
- [x] Set up `.env.example` template
- [x] Configure PostgreSQL connection via DATABASE_URL
- [x] Set SECRET_KEY, JWT_SECRET_KEY

**Status**: ✅ COMPLETE

---

### ✅ PHASE 2: Real Data Integration (STEP 2)
**Goal**: Fetch live Bitcoin metrics and implement profit calculation engine

#### 2.1 Bitcoin API Data Fetchers (`backend/app/utils/api_fetcher.py`)
- [x] **get_btc_price()** - CoinDesk API
  - Endpoint: `https://api.coindesk.com/v1/bpi/currentprice.json`
  - Returns: Current BTC price in USD
- [x] **get_network_hashrate()** - Blockchain.info
  - Endpoint: `https://blockchain.info/q/hashrate`
  - Returns: Global network hashrate (in EH/s or TH/s)
- [x] **get_mining_difficulty()** - Mempool.space
  - Endpoint: `https://mempool.space/api/v1/mining/hashrate/difficulty`
  - Returns: Current difficulty and block reward
- [x] Error handling and caching (5-minute cache)

#### 2.2 Profit Calculator (`backend/app/utils/profit_calculator.py`)
- [x] **calculate_daily_btc()**
  - Formula: `(user_hashrate / global_hashrate) * block_reward * blocks_per_day`
  - Blocks per day: 144 (Bitcoin avg)
  - Current block reward: 3.125 BTC
- [x] **calculate_monthly_profit()**
  - Daily BTC × 30 days
  - Deduct maintenance fee (MAINTENANCE_FEE_PERCENT)
  - Convert to USD using current BTC price
- [x] **estimate_roi()**
  - Calculate break-even time
  - Account for difficulty adjustments (optional)

#### 2.3 Miner Routes (`/api/miners`)
- [x] GET `/` - List all available miners
- [x] GET `/:id` - Get miner details with profit preview
- [x] GET `/:id/estimate` - Calculate profit for custom hashrate
- [x] POST `/` - Create new miner (admin only)
- [x] PUT `/:id` - Update miner (admin only)

#### 2.4 Rental Routes (`/api/rentals`)
- [x] POST `/` - Create new rental (checkout)
- [x] GET `/user/:userId` - Get user's active rentals
- [x] GET `/:id` - Get rental details with profit history
- [x] PUT `/:id/activate` - Activate rental after payment

**Status**: ✅ COMPLETE

---

### ✅ PHASE 3: Frontend Dashboard (STEP 3)
**Goal**: Build React UI with Bitdeer-inspired dark theme and core pages

#### 3.1 React Project Setup
- [x] Initialize React app with Vite
- [x] Install dependencies
  - TailwindCSS, PostCSS, Autoprefixer
  - React Router DOM
  - Axios for API calls
  - Chart.js or Recharts
  - React Icons
  - date-fns
- [x] Configure Tailwind with dark theme
- [x] Set up custom gradient colors (purple/blue/cyan)

#### 3.2 Layout & Navigation
- [x] **Header Component**
  - Logo, navigation menu
  - User profile dropdown
  - Login/Register buttons (when logged out)
- [x] **Sidebar Navigation**
  - Dashboard, Miners, My Rentals, Referrals, Admin
  - Active state highlighting
- [x] **Footer** - Links, copyright

#### 3.3 Dashboard Page (`/`)
- [x] **Hero Section**
  - Live BTC price ticker (updates every 30s)
  - Network hashrate display
  - Current difficulty
- [x] **User Stats Cards** (if logged in)
  - Total hashrate rented
  - Monthly earnings (BTC + USD)
  - Active contracts count
- [x] **Quick Actions**
  - Browse miners CTA
  - View rentals button
- [x] **Network Stats Chart**
  - Line chart: BTC price over 7 days (placeholder)

#### 3.4 Miners Catalog Page (`/miners`)
- [x] **Filter Bar**
  - Duration: 30/90/180 days
  - Hashrate range slider
  - Sort by: Price, Hashrate, Efficiency
- [x] **Miner Card Grid**
  - Miner image, name, model
  - Hashrate, price, efficiency
  - "Estimated Earnings" display
  - "Rent Now" button
- [x] **Miner Detail Modal/Page**
  - Full specs, profit calculator
  - Hashrate allocation slider (fractional rental)
  - Real-time profit preview
  - Checkout button

#### 3.5 My Rentals Page (`/rentals`)
- [x] **Active Rentals Table**
  - Miner name, hashrate, start date, end date
  - Total profit earned, status
- [x] **Earnings Chart**
  - Bar chart: Monthly BTC earnings
  - Line overlay: USD equivalent
- [x] **Empty State** (no rentals)
  - "Start mining" CTA

#### 3.6 Styling & Theme
- [x] Dark background (#0a0e1a, #0f1419)
- [x] Gradient accents (purple → blue → cyan)
- [x] Glassmorphism cards (backdrop-blur)
- [x] Smooth hover transitions
- [x] Responsive design (mobile, tablet, desktop)

**Status**: ✅ COMPLETE

---

## 🚀 Future Phases (Post-MVP)

### ✅ PHASE 4: Referral System
- [x] Referral routes (`/api/referrals`)
- [x] Generate unique referral links
- [x] Track referred users and commissions
- [x] Referrals page in frontend
- [ ] Commission payout logic (automated monthly)

### PHASE 5: Payment Integration (FinalGateway)
- [ ] FinalGateway API integration
- [ ] Payment routes (`/api/payments`)
- [ ] Webhook handler for transaction confirmation
- [ ] Auto-activate rentals on payment
- [ ] Payment history page

### PHASE 6: Admin Panel
- [ ] Admin dashboard with stats
- [ ] Manage miners (CRUD)
- [ ] View all users and rentals
- [ ] Configure maintenance/referral fees
- [ ] Payment transaction logs

### PHASE 7: Advanced Features
- [ ] Automated monthly profit distribution
- [ ] Email notifications (rental activation, payouts)
- [ ] Historical earnings charts (6-month view)
- [ ] Light/dark theme toggle
- [ ] Framer Motion animations

### PHASE 8: Deployment & Mobile
- [ ] Create `render.yaml` for Render deployment
- [ ] Create `Procfile` for gunicorn
- [ ] PWA manifest and service worker
- [ ] Capacitor configuration for APK export
- [ ] Production environment setup

---

## 🛠️ Tech Stack Summary

### Backend
- **Framework**: Flask 3.x
- **Database**: PostgreSQL (via SQLAlchemy ORM)
- **Authentication**: Flask-JWT-Extended
- **Migrations**: Flask-Migrate (Alembic)
- **Server**: Gunicorn (production)

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS 3.x
- **Charts**: Chart.js / Recharts
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Icons**: React Icons

### External APIs
- CoinDesk (BTC price)
- Blockchain.info (network hashrate)
- Mempool.space (difficulty, block reward)
- FinalGateway (crypto payments - Phase 5)

---

## 📝 Progress Tracking

| Phase | Status | Completion | Notes |
|-------|--------|------------|-------|
| Phase 1: Backend Foundation | ✅ Complete | 100% | Full-stack API with auth, models, routes |
| Phase 2: Real Data Integration | ✅ Complete | 100% | Live BTC APIs, profit calculator |
| Phase 3: Frontend Dashboard | ✅ Complete | 100% | React + TailwindCSS, dark theme |
| Phase 4: Referral System | ✅ Complete | 90% | Referral page, routes, tracking implemented |
| Phase 5: Payment Integration | ⏸️ Planned | 0% | Future |
| Phase 6: Admin Panel | ⏸️ Planned | 0% | Future |
| Phase 7: Advanced Features | ⏸️ Planned | 0% | Future |
| Phase 8: Deployment & Mobile | ⏸️ Planned | 0% | Future |

**Legend**: ✅ Complete | 🟡 In Progress | 🔴 Not Started | ⏸️ Planned

---

## 🎯 Current Status: MVP Complete (First 4 Phases)

**Completed**:
1. ✅ Backend Foundation - Flask API with PostgreSQL, JWT auth, all models and routes
2. ✅ Real Data Integration - Live Bitcoin APIs, profit calculator engine  
3. ✅ Frontend Dashboard - React + TailwindCSS, Bitdeer-inspired design
   - Sidebar navigation
   - Footer component
   - User stats cards (when logged in)
   - 7-day BTC price chart
   - Miners filter bar (duration, hashrate, sorting)
   - Earnings chart on My Rentals page
4. ✅ Referral System - Full referral tracking with commission display

**Running**:
- Backend API: http://localhost:3000 
- Frontend: http://localhost:5000
- Database: PostgreSQL (seeded with 6 miners + admin user)

**Next Steps (Future Phases)**:
- Implement automated commission payout logic
- Integrate FinalGateway payment processing
- Build admin panel for miner management
- Add deployment configs for Render
- PWA and Capacitor setup for mobile

Last Updated: 2025-12-05
