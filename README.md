# Mini ERP + CRM Operations Portal

A full-stack operations portal built as a developer case study, demonstrating ERP and CRM capabilities with clean architecture and proper authentication.

## Tech Stack

| Layer          | Technology                        |
| -------------- | --------------------------------- |
| Frontend       | React + TypeScript (Vite)         |
| Backend        | Node.js + TypeScript + Express.js |
| Database       | PostgreSQL                        |
| Authentication | JWT                               |
| API Style      | REST                              |

## Project Structure

```
mini-erp-crm/
├── backend/          # Express.js API server
│   ├── src/
│   │   └── index.ts  # Entry point with health-check endpoint
│   ├── .env.example  # Environment variable template
│   ├── package.json
│   └── tsconfig.json
├── frontend/         # React SPA
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js >= 18
- npm >= 9
- PostgreSQL >= 14 (required in later phases)

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd mini-erp-crm
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The API server starts at **http://localhost:3001**.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at **http://localhost:5173**.

### 4. Verify

- Backend health check: `GET http://localhost:3001/api/health`
- Frontend: Open `http://localhost:5173` in a browser

## Available Scripts

### Backend

| Command         | Description                         |
| --------------- | ----------------------------------- |
| `npm run dev`   | Start dev server with hot reload    |
| `npm run build` | Compile TypeScript to `dist/`       |
| `npm start`     | Run compiled output from `dist/`    |

### Frontend

| Command         | Description                         |
| --------------- | ----------------------------------- |
| `npm run dev`   | Start Vite dev server               |
| `npm run build` | Build for production                |
| `npm run preview`| Preview production build           |

## Architecture Decisions

- **No ORM**: Raw SQL via `pg` to demonstrate SQL proficiency and keep dependencies minimal.
- **No CSS framework**: Vanilla CSS with custom properties for full control.
- **Monorepo layout**: Frontend and backend in the same repo, separately runnable.

## Assumptions & Limitations

_To be expanded as the project progresses._

- This is a case-study project, not a production system.
- Single-tenant design.
- No file upload support.
- No email/notification system.
