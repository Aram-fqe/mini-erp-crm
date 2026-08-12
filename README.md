# Mini ERP + CRM Operations Portal

A full-stack operations portal built as a developer case study, demonstrating core ERP and CRM capabilities with clean architecture, robust security, role-based access control (RBAC), and containerized deployment.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript | SPA powered by Vite 6 |
| **Styling** | Tailwind CSS v4 + Lucide Icons | Modern dark-mode dashboard theme |
| **Backend** | Node.js + TypeScript + Express.js | Layered REST API server |
| **Database** | PostgreSQL 16 | Relational database with ACID transactions |
| **ORM** | Prisma ORM | Type-safe database access layer |
| **Auth** | JWT & bcrypt | Stateless JWT authentication & password hashing |
| **PDF Engine** | PDFKit | Server-side invoice PDF rendering stream |
| **Cloud Storage** | AWS S3 SDK v3 | Product image storage & upload pipeline |
| **Containerization** | Docker & Docker Compose | Multi-stage Docker production image |
| **CI/CD** | GitHub Actions | Workflows for build verification and GHCR container push |

---

## 📁 Project Structure

```
mini-erp-crm/
├── .github/
│   └── workflows/
│       ├── ci.yml            # CI workflow: verifies backend & frontend TS compilation
│       └── deploy.yml        # CD workflow: builds & pushes multi-stage image to GHCR
├── backend/                  # Express.js API server
│   ├── prisma/
│   │   ├── schema.prisma     # Prisma DB Schema (User, Customer, Product, Challan, etc.)
│   │   └── seed.ts           # Database seeder with realistic test data & role accounts
│   ├── src/
│   │   ├── config/           # Environment configuration & validation
│   │   ├── controllers/      # Route controllers (HTTP request/response handlers)
│   │   ├── db/               # Prisma client instance
│   │   ├── middleware/       # Auth JWT, Role RBAC, Upload (Multer), Error handlers
│   │   ├── repositories/     # Data Access Layer (Prisma queries & ACID transactions)
│   │   ├── routes/           # Express router endpoints
│   │   ├── services/         # Business logic layer (Validations, S3, PDFKit)
│   │   ├── types/            # Express type extensions
│   │   ├── utils/            # Custom ApiError, Logger, Password utilities
│   │   ├── validators/       # Input validation schemas & helper functions
│   │   ├── app.ts            # Express app configuration & static file serving
│   │   └── index.ts          # Server startup & graceful shutdown
│   ├── .env.example          # Backend environment template
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── api/              # Axios client with JWT interceptors & service wrappers
│   │   ├── components/       # Layout, Navbar, Sidebar, Modals, Badges, Loaders
│   │   ├── context/          # Auth Context for global session management
│   │   ├── pages/            # Dashboard, Customers, Products, Inventory, Challans
│   │   ├── types/            # Shared TypeScript interfaces & types
│   │   ├── App.tsx           # Route mapping & ProtectedRoute guards
│   │   └── main.tsx          # React application entry point
│   ├── package.json
│   └── tsconfig.json
├── Dockerfile                # Multi-stage production Dockerfile
├── docker-compose.yml        # Docker Compose configuration (App + PostgreSQL)
├── .dockerignore
└── README.md
```

---

## ✨ Features Breakdown

### 1. Authentication & Role-Based Access Control (RBAC)
- **JWT Authentication**: Secure login and signup with token expiration.
- **4 Granular Roles**:
  - `ADMIN`: Full operational access across all modules.
  - `SALES`: Customer CRM management, follow-ups, creating and confirming sales challans.
  - `WAREHOUSE`: Product catalog management, stock adjustments (IN/OUT), viewing inventory movement.
  - `ACCOUNTS`: Read-only access to customer financial snapshots and sales challans.

#### 🔐 Role Permission Matrix

| Action / Module | ADMIN | SALES | WAREHOUSE | ACCOUNTS |
| :--- | :---: | :---: | :---: | :---: |
| Manage Customers & Follow-ups | ✅ | ✅ | ❌ | 👁️ Read Only |
| Manage Product Catalog | ✅ | 👁️ Read Only | ✅ | 👁️ Read Only |
| Record Stock Adjustments (IN/OUT) | ✅ | ❌ | ✅ | ❌ |
| Create Sales Delivery Challan | ✅ | ✅ | ❌ | ❌ |
| Confirm Sales Challan (Deduct Stock) | ✅ | ✅ | ✅ | ❌ |
| Download Invoice PDF | ✅ | ✅ | ✅ | ✅ |

---

### 2. Customer CRM Module
- **Customer Directory**: Search & filter by name, business name, GST number, mobile, or customer type (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`).
- **Lifecycle Tracking**: Track status (`LEAD`, `ACTIVE`, `INACTIVE`).
- **Follow-up Log System**: Add timestamped follow-up notes with scheduled reminder dates.

---

### 3. Product & Inventory Module
- **SKU Catalog**: Track product SKU, category, unit price, warehouse location, and minimum stock threshold.
- **Stock Movement Log**: Audit trail for all manual and automated inventory movements (`IN` or `OUT`), capturing quantity, reason, timestamp, and responsible user.
- **Low Stock Indicator**: Visual badges alerting when current stock falls below minimum threshold.
- **AWS S3 Product Images**: Upload product photos stored securely in AWS S3 with catalog thumbnail previews.

---

### 4. Sales Delivery Challan & Invoicing Module
- **Sequential Numbering**: Auto-generates unique sequential identifiers (e.g. `CH-2026-0001`).
- **Historical Snapshot Preservation**: Freezes product details (SKU, product name, price at time of order) on line items so historical challan data remains accurate even if catalog items change later.
- **ACID Transaction Stock Verification**: When a Challan status changes from `DRAFT` to `CONFIRMED`, an atomic transaction verifies sufficient stock for all line items, deducts inventory, records `OUT` stock movements, and updates status in a single database transaction.
- **PDF Invoice Export**: Server-side PDFKit engine generates formatted invoices for printing and downloading.

---

### 5. Bonus Technical Implementations
- 🐳 **Docker & Docker Compose**: Multi-stage `Dockerfile` and one-command `docker-compose.yml` environment.
- ⚙️ **GitHub Actions CI/CD**:
  - `ci.yml`: Automated TypeScript build verification on pull requests and pushes to `main`.
  - `deploy.yml`: Automated Docker image build and push to **GitHub Container Registry (`ghcr.io`)**.
- 📄 **Export Invoice as PDF**: Built with PDFKit with client-side blob download support.
- ☁️ **AWS S3 Product Image Upload**: Built with Multer memory storage and AWS SDK v3 `@aws-sdk/client-s3`.

---

## 🚀 Quick Start Guide

### Option A: One-Command Deployment via Docker Compose (Recommended)

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd mini-erp-crm
   ```

2. Spin up the application stack (PostgreSQL 16 + Web Server):
   ```bash
   docker-compose up --build -d
   ```
   The application will automatically initialize the database schema and be accessible at **http://localhost:3001**.

3. Seed initial test accounts & sample data (Optional):
   ```bash
   docker-compose exec app npm run prisma:seed
   ```

4. Tear down the stack:
   ```bash
   docker-compose down
   ```

---

### Option B: Local Server Development Setup

#### Prerequisites
- Node.js >= 18
- npm >= 9
- PostgreSQL >= 14 (Running locally on default port 5432)

#### 1. Environment Configuration

**Backend Environment (`backend/.env`)**
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/mini_erp_crm?schema=public
JWT_SECRET=super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=24h
CORS_ORIGIN=*

# AWS S3 Config (Optional — Image uploads will report a clear error if unconfigured)
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

**Frontend Environment (`frontend/.env`)**
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

#### 2. Start Backend API
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed   # Seeds test accounts and initial data
npm run dev
```
The API server will run at **http://localhost:3001**.

#### 3. Start Frontend SPA
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
The React frontend will run at **http://localhost:5173**.

---

## 🔑 Pre-Configured Test Accounts

After running `npm run prisma:seed`, you can log in with any of these pre-seeded accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **ADMIN** | `admin@minierp.com` | `Password123!` |
| **SALES** | `sales@minierp.com` | `Password123!` |
| **WAREHOUSE** | `warehouse@minierp.com` | `Password123!` |
| **ACCOUNTS** | `accounts@minierp.com` | `Password123!` |

---

## 🌐 API Endpoint Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| **POST** | `/api/auth/register` | Public | Register new user account |
| **GET** | `/api/auth/me` | Authenticated | Retrieve current user profile |
| **GET** | `/api/customers` | Authenticated | List & search customers with pagination |
| **POST** | `/api/customers` | Admin, Sales | Create customer record |
| **POST** | `/api/customers/:id/followups` | Admin, Sales | Add customer follow-up note |
| **GET** | `/api/products` | Authenticated | List product catalog & stock alerts |
| **POST** | `/api/products` | Admin, Warehouse | Add new product to catalog |
| **POST** | `/api/products/:id/stock` | Admin, Warehouse | Record manual stock movement (IN/OUT) |
| **POST** | `/api/products/:id/image` | Admin, Warehouse | Upload product image to AWS S3 |
| **GET** | `/api/challans` | Authenticated | List sales delivery challans |
| **POST** | `/api/challans` | Admin, Sales | Create DRAFT sales challan |
| **PUT** | `/api/challans/:id/confirm` | Admin, Sales, Warehouse | Confirm challan & trigger inventory reduction |
| **GET** | `/api/challans/:id/pdf` | Authenticated | Stream delivery challan PDF invoice |

---

## 🧪 Build & Verification Commands

```bash
# Verify backend TypeScript compilation
cd backend && npm run build

# Verify frontend Vite compilation
cd frontend && npm run build
```
