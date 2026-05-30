# MediCore Hospital Management System

A full-featured hospital management system built with **Next.js 13+ (App Router)**, **Prisma ORM**, and **PostgreSQL**. Designed for multi-role hospital staff with role-based dashboards, patient management, appointments, IPD/OPD tracking, pharmacy, laboratory, billing, and reporting.

## Roles

| Role            | Access Area      |
| --------------- | ---------------- |
| Admin           | `/admin`         |
| Doctor          | `/doctor`        |
| Nurse           | `/nurse`         |
| Receptionist    | `/receptionist`  |
| Pharmacist      | `/pharmacist`    |
| Accountant      | `/accountant`    |
| Lab Technician  | `/lab-technician`|

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT (HS256, `jose`) + bcrypt
- **Styling**: Tailwind CSS
- **UI**: Custom component library (Button, Input, Card, Table, Modal, Badge, etc.)

## Features

- **Authentication & Authorization** – JWT-based login with role-based route protection (middleware)
- **Dashboard** – Role-specific dashboards with key metrics and quick actions
- **Patient Management** – Register, search, view, and edit patient records
- **Doctor Management** – Manage doctors, specializations, schedules
- **Appointments** – Schedule, confirm, check-in, complete, cancel
- **OPD Records** – Out-patient consultation records
- **IPD Records** – In-patient admission, ward/bed assignment, discharge
- **Nurse Records** – Vitals, observations, medications, diet tracking
- **Pharmacy** – Medicine catalog, stock management, prescription dispensing
- **Laboratory** – Lab test catalog, request management, result entry
- **Billing & Invoicing** – Invoice generation, partial/full payments, multiple payment modes
- **Inventory** – Item tracking, reorder levels, supplier info
- **User Management** – Admin CRUD for all staff users
- **Reports & Analytics** – Aggregated statistics and exportable reports

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (local or remote)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd hospital-management-system

# Install dependencies
npm install

# Set up environment variables
cp .env.local .env
# Edit .env with your PostgreSQL connection string and a secure JWT secret

# Push database schema
npm run db:push

# Seed initial data (admin user + demo data)
npm run db:seed

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

| Variable       | Description                      |
| -------------- | -------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string     |
| `JWT_SECRET`   | Secret key for signing JWT tokens|

### Scripts

| Command            | Description                        |
| ------------------ | ---------------------------------- |
| `npm run dev`      | Start development server           |
| `npm run build`    | Build for production               |
| `npm run start`    | Start production server            |
| `npm run lint`     | Run ESLint                         |
| `npm run db:push`  | Push Prisma schema to database     |
| `npm run db:seed`  | Seed database with initial data    |
| `npm run db:studio`| Open Prisma Studio (data browser)  |

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Authenticated pages (role-based)
│   │   ├── admin/
│   │   ├── doctor/
│   │   ├── nurse/
│   │   ├── receptionist/
│   │   ├── pharmacist/
│   │   ├── accountant/
│   │   ├── lab-technician/
│   │   ├── appointments/
│   │   ├── patients/
│   │   ├── doctors/
│   │   ├── pharmacy/
│   │   ├── laboratory/
│   │   ├── inventory/
│   │   ├── billing/
│   │   └── reports/
│   ├── api/                  # REST API routes
│   ├── login/                # Login page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Root redirect
├── components/
│   ├── layouts/              # Sidebar, Header
│   └── ui/                   # Reusable UI primitives
├── lib/
│   ├── auth.ts               # JWT + bcrypt utilities
│   ├── api-utils.ts          # API helper utilities
│   ├── prisma.ts             # Prisma client singleton
│   └── utils.ts              # General utilities
├── types/                    # TypeScript type definitions
└── middleware.ts             # Edge auth middleware
```

## Database Schema

The Prisma schema defines the following core models:

- **User** – Staff accounts (all roles)
- **Doctor** – Doctor profiles linked to users
- **Patient** – Patient registration records
- **Appointment** – Scheduled appointments
- **OPDRecord** – Out-patient department records
- **IPDRecord** – In-patient department records
- **NurseRecord** – Daily nurse observations for IPD patients
- **Medicine** – Pharmacy medicine catalog
- **Prescription** / **PrescriptionItem** – Doctor prescriptions
- **LabTest** – Available lab tests
- **LabRequest** – Lab test requests and results
- **Invoice** / **Payment** – Billing and payment tracking
- **InventoryItem** – Hospital inventory management

## License

MIT
