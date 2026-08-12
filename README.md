# Mini ERP + CRM Operations Portal

A full-stack operations portal built as a developer case study, demonstrating ERP and CRM capabilities with clean architecture, proper authentication, and role-based access control.

## Tech Stack

| Layer          | Technology                        |
| -------------- | --------------------------------- |
| Frontend       | React + TypeScript (Vite)         |
| Styling        | Tailwind CSS                      |
| Backend        | Node.js + TypeScript + Express.js |
| Database       | PostgreSQL                        |
| ORM            | Prisma                            |
| Authentication | JWT & bcrypt                      |
| API Style      | REST                              |

## Project Structure

```
mini-erp-crm/
├── backend/          # Express.js API server
│   ├── prisma/       # Database schema and seed scripts
│   ├── src/          # Controllers, Services, Repositories, Routes
│   ├── .env.example  # Environment variable template
│   ├── package.json
│   └── tsconfig.json
├── frontend/         # React SPA
│   ├── src/          # Components, Pages, API integrations
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Features Checklist

1. **Authentication and Roles**
   - JWT-based login and registration.
   - 4 required roles implemented: Admin, Sales, Warehouse, Accounts.
   - Role-based route protection on both frontend and backend.

2. **Customer CRM Module**
   - Manage customers (Lead, Active, Inactive) with fields for Business Name, GST, Address, etc.
   - Features: Add, Edit, Search, View Details.
   - Follow-up Notes system integrated into Customer details.

3. **Product and Inventory Module**
   - Manage products (Safety Equipment, Electronics, Lighting, etc.) with SKU, categories, and min stock alerts.
   - Stock Movement log (IN/OUT) tracking quantity changes, reasons, and timestamps.

4. **Sales Challan Module**
   - Generate DRAFT or CONFIRMED Delivery Challans.
   - Multi-product line items with stock validations (prevents negative stock).
   - Confirmed challans automatically deduct stock from inventory and record movements.

5. **Clean REST APIs**
   - Separated by concerns (`/auth`, `/customers`, `/products`, `/challans`).
   - Uses layered architecture (Router -> Controller -> Service -> Repository).
   - Strong input validation, proper HTTP codes, unified error handler, and pagination metadata.

## Local Server Setup & Installation

### Prerequisites
- Node.js >= 18
- npm >= 9
- PostgreSQL >= 14 (Running locally on default port 5432)

### 1. Clone the Repository
```bash
git clone <repo-url>
cd mini-erp-crm
```

### 2. Environment Variables
You must set up `.env` files for both the frontend and backend.

**Backend (`backend/.env`)**
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:your_password_here@localhost:5432/mini_erp_crm?schema=public
JWT_SECRET=change_this_to_a_random_secret
JWT_EXPIRES_IN=24h
```
*Note: Update `your_password_here` with your local Postgres password.*

**Frontend (`frontend/.env`)**
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### 3. Database & Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed   # Seeds the database with Admin user and realistic test data
npm run dev
```
The API server will start at **http://localhost:3001**.

### 4. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The frontend will start at **http://localhost:5173**. 
You can log in using `admin@minierp.com` with password `Password123!` (or the default test accounts).

## Deployment Instructions

This project is configured to be easily deployed on free tier platforms like Vercel (Frontend) and Render (Backend/Database).

### Step 1: Database Deployment (Render / Neon / Supabase)
1. Create a free PostgreSQL database on Render or Neon.tech.
2. Copy the provided connection string (e.g., `postgresql://...`).

### Step 2: Backend Deployment (Render)
1. Create a new "Web Service" on Render.
2. Connect your GitHub repository.
3. Set the Root Directory to `backend`.
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. **Environment Variables**:
   - `DATABASE_URL`: (Paste your DB connection string here)
   - `JWT_SECRET`: (Generate a secure random string)
   - `NODE_ENV`: `production`
7. Once deployed, Render will provide a URL (e.g., `https://mini-erp-api.onrender.com`).

### Step 3: Frontend Deployment (Vercel / Netlify)
1. Create a new Project on Vercel and import your repository.
2. Set the Framework Preset to `Vite`.
3. Set the Root Directory to `frontend`.
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. **Environment Variables**:
   - `VITE_API_BASE_URL`: (Paste your Render Backend URL here, e.g., `https://mini-erp-api.onrender.com/api`)
7. Click Deploy.

## Assumptions Made

- **Authentication**: A single `users` table manages all staff. For simplicity, users can be generated via a `/register` endpoint or seeded manually.
- **Stock Movement**: Challan creation directly acts on stock levels. When a Challan is created and immediately set to `CONFIRMED`, it will instantly check for adequate stock and deduct it. Draft challans do not hold inventory.
- **Architecture**: A Monorepo structure is utilized for developer convenience. `pg` raw SQL was swapped out for **Prisma ORM** for better type-safety, rapid development, and cleaner repository patterns.
- **Frontend State**: React Context API is used for global auth state instead of complex stores like Redux, matching the scale of the application perfectly.
