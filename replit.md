# Bitcoin Cloud Mining Simulator

## Overview

A full-stack Bitcoin cloud mining simulator enabling users to rent virtual mining hardware, track real-time profits, and earn referral commissions. It features JWT authentication, live Bitcoin market data integration, and comprehensive profit calculations based on actual network metrics. The platform aims to provide an immersive and realistic cloud mining experience with a focus on user engagement and financial tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture

The backend is a Flask REST API organized into modular blueprints for authentication, miners, rentals, referrals, payments, and stats. It uses SQLAlchemy ORM for database interactions with PostgreSQL, managing `Users`, `Miners`, `Rentals`, `Referrals`, and `Payments` models. Security is handled via JWT-based authentication with password hashing and CORS enabled.

Key business logic includes real-time Bitcoin metrics fetched from public APIs (CoinGecko, Blockchain.info, Mempool.space) with a 5-minute caching layer and a circuit breaker pattern for resilience. Profit calculations consider network hashrate, difficulty, maintenance fees (5% default), and referral commissions (3% default). The system also includes an extensive admin panel for managing users, miners, rentals, payments, and system settings, with an auto-create admin user feature for ease of deployment.

### Frontend Architecture

The frontend is built with React 18 and uses React Router for single-page application navigation. Vite serves as the build tool, and TailwindCSS is used for styling, featuring a dark theme with glass morphism effects and gradient accents. Data visualization is handled by Recharts, and React Icons provide UI elements.

UI/UX emphasizes a modern, responsive design with animations for page loads, modals, and hover effects, along with skeleton loading states and a Toast notification system for user feedback.

### System Design Choices

- **Modularity**: Blueprint-based Flask backend and component-driven React frontend.
- **Resilience**: API caching and circuit breaker pattern for external API integrations.
- **Security**: JWT authentication, password hashing, and role-based access control.
- **Scalability**: PostgreSQL database and Gunicorn for production deployment.
- **User Experience**: Responsive design, dark theme, animations, and real-time data.
- **Admin Functionality**: Comprehensive admin panel for system and user management, including configurable system parameters and database cleanup tools.

## External Dependencies

### Third-Party APIs

- **CoinGecko API**: Real-time Bitcoin price data.
- **Blockchain.info API**: Network hashrate metrics.
- **Mempool.space API**: Mining difficulty data.

### Database

- **PostgreSQL**: Primary production database.
- **SQLite**: Supported for local development.
- **Flask-Migrate**: For database schema version control.

### Python Packages

- **Flask**: Web framework.
- **Flask-SQLAlchemy**: ORM for database interaction.
- **Flask-Migrate**: Database migrations.
- **Flask-JWT-Extended**: JWT authentication.
- **Flask-CORS**: Cross-origin resource sharing.
- **psycopg2-binary**: PostgreSQL adapter.
- **requests**: HTTP client for external API calls.
- **Werkzeug**: Security utilities.
- **Gunicorn**: Production WSGI server.

### Node.js Packages

- **React**: Frontend library.
- **React Router DOM**: Client-side routing.
- **Axios**: HTTP client for API communication.
- **Recharts**: Charting library.
- **React Icons**: Icon library.
- **date-fns**: Date manipulation utility.
- **TailwindCSS**: Utility-first CSS framework.
- **Vite**: Frontend build tool.
- **Capacitor**: For building cross-platform native apps (e.g., Android APK).