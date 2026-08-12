# Mini ERP + CRM Operations Portal

A full-stack operations portal built as a developer case study, demonstrating ERP and CRM capabilities with clean architecture, proper authentication, and role-based access control.

## Tech Stack

| Layer          | Technology                        |
| -------------- | --------------------------------- |
| Frontend       | React 19 + TypeScript (Vite)      |
| Styling        | Tailwind CSS v4                   |
| Backend        | Node.js + TypeScript + Express.js |
| Database       | PostgreSQL                        |
| ORM            | Prisma                            |
| Authentication | JWT & bcrypt                      |
| API Style      | REST                              |
| Containerization | Docker & Docker Compose         |
| CI/CD          | GitHub Actions                    |
| PDF Engine     | PDFKit                            |
| Cloud Storage  | AWS S3 (via `@aws-sdk/client-s3`) |

## Project Structure

```
mini-erp-crm/
├── .github/
│   └── workflows/
│       ├── ci.yml            # CI workflow: verifies TypeScript builds
│       └── deploy.yml        # CD workflow: builds & pushes Docker image to GHCR
├── backend/                  # Express.js API server
│   ├── prisma/               # Database schema and seed scripts
│   ├── src/                  # Controllers, Services, Repositories, Routes, Utils
│   ├── .env.example          # Environment variable template
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # React SPA
│   ├── src/                  # Components, Pages, API integrations, Context
│   ├── package.json
│   └── tsconfig.json
├── Dockerfile                # Multi-stage Docker production image
├── docker-compose.yml        # Docker Compose configuration (PostgreSQL + App)
├── .dockerignore
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
   - Manage products with SKU, categories, warehouse locations, and low stock alerts.
   - Stock Movement log (IN/OUT) tracking quantity changes, reasons, and user timestamps.

4. **Sales Delivery Challan Module**
   - Generate DRAFT or CONFIRMED Delivery Challans.
   - Multi-product line items with stock validations (prevents negative stock).
   - Confirmed challans automatically deduct stock from inventory and record movements.

5. **Bonus Features Implemented**
   - 🐳 **Docker Setup**: Production multi-stage `Dockerfile` and `docker-compose.yml` (PostgreSQL + App).
   - ⚙️ **GitHub Actions CI/CD**: Automatic build verification on PRs (`ci.yml`) and container deployment to GitHub Container Registry (`deploy.yml`).
   - 📄 **PDF Invoice Export**: Generate and stream PDF invoices directly from delivery challans using PDFKit.
   - ☁️ **AWS S3 Image Upload**: Upload product image assets to AWS S3 using Multer & AWS SDK v3 with thumbnail preview in product catalog.

---

## Production Deployment & Docker Setup

### Option 1: One-Command Run via Docker Compose (Recommended)

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd mini-erp-crm
   ```

2. Start the full application stack (PostgreSQL + Web App):
   ```bash
   docker-compose up --build -d
   ```
   The application will be accessible at **http://localhost:3001**.

3. Seed initial test data (Optional):
   ```bash
   docker-compose exec app npm run prisma:seed
   ```

4. Stop the stack:
   ```bash
   docker-compose down
   ```

---

## Local Development Setup

### Prerequisites
- Node.js >= 18
- npm >= 9
- PostgreSQL >= 14 (Running locally on default port 5432)

### 1. Environment Variables

**Backend (`backend/.env`)**
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:your_password_here@localhost:5432/mini_erp_crm?schema=public
JWT_SECRET=change_this_to_a_random_secret
JWT_EXPIRES_IN=24h
CORS_ORIGIN=*

# AWS S3 (Optional for product image uploads)
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket-name
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

**Frontend (`frontend/.env`)**
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### 2. Database & Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed   # Seeds the database with Admin user and test data
npm run dev
```
API server running at **http://localhost:3001**.

### 3. Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend running at **http://localhost:5173**.

---

## Verification & Build Commands

Before deploying to production, run verification builds:

```bash
# Backend TypeScript check & build
cd backend && npm run build

# Frontend Vite build check
cd frontend && npm run build
```

Default login credentials (after running seed):
- **Email**: `admin@minierp.com`
- **Password**: `Password123!`

