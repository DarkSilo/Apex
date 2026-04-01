# Apex - Sports Club Management System

A centralized web platform for Sri Lankan sports clubs to manage members, inventory, training sessions, and payments with role-based access.

## Stack

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS v3, Framer Motion, Lucide, Recharts
- Backend: Express.js, TypeScript, Mongoose, JWT auth, Zod validation
- Database: MongoDB Atlas

## Monorepo Structure

- `client/` - Next.js frontend
- `server/` - Express REST API
- `install-deps.bat` - Windows batch script to install all dependencies
- `run-dev.bat` - Windows batch script to run both services in separate terminals

## Implemented Features

- JWT auth (`/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/me`)
- RBAC for `admin`, `coach`, `member`
- Members module with profile update, status toggle, attendance log and dashboard stats
- Inventory CRUD with low-stock alerts (`currentStock <= minThreshold`)
- Sessions CRUD with coach conflict detection and cancel action
- Payments CRUD, monthly reporting, printable receipt data
- Attendance prediction API using linear regression (`y = beta0 + beta1*x`)
- Seed script with realistic demo data (members, coaches, equipment, sessions, payments)
- Animated dashboard/pages (metrics, charts, table/list transitions)

## Quick Start (Windows Development)

### 1. Configure MongoDB Atlas

Update `server/.env` with your MongoDB Atlas credentials:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/apex?retryWrites=true&w=majority
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
```

Update `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. Run Install Script

Double-click `install-deps.bat` in the root directory. This will:
- Install all backend dependencies
- Install all frontend dependencies
- Display setup confirmation and next steps

### 3. Seed Database (Optional but recommended)

```bash
cd server
npm run seed
```

### 4. Run Services

Double-click `run-dev.bat` in the root directory. This will:
- Launch backend (Express) on a new terminal window at http://localhost:5000
- Launch frontend (Next.js) on a new terminal window at http://localhost:3000

Close either terminal window to stop that service.

### Alternative: Manual Setup

If you prefer to run services manually:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

## Demo Credentials (after seed)

- Admin: `admin@apex.lk` / `password123`
- Coach: `nimal.coach@apex.lk` / `password123`
- Member: `dinesh@apex.lk` / `password123`

## API Modules

- `/api/auth`
- `/api/members`
- `/api/inventory`
- `/api/sessions`
- `/api/payments`

Prediction endpoint:
- `GET /api/payments/prediction`

## Notes

- MongoDB Atlas is required for all deployments.
- Email notifications are not wired yet; low-stock and schedule warnings are currently UI/API driven.
- This project uses Windows batch files for local development convenience. For other operating systems, run the npm commands manually in separate terminal sessions.
