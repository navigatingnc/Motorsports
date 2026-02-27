# Project Plan: Motorsports Management Web App

## 1. Technology Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React (with Vite) + TypeScript |
| **Backend** | Node.js with Express.js + TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | JSON Web Tokens (JWT) |
| **File Storage** | Amazon S3 (or compatible) |
| **Deployment** | Docker & Vercel/AWS |
| **Data Visualization**| Recharts |

## 2. Development Phases

| Phase | Task Description | Status |
| :--- | :--- | :--- |
| **1** | **Backend: Project & DB Setup**<br>1. Init Node.js/TypeScript project.<br>2. Install Express, Prisma.<br>3. Docker Compose for PostgreSQL.<br>4. Init Prisma & connect to DB. | Done |
| **2** | **Backend: `Vehicle` Model & API**<br>1. Define `Vehicle` model in `schema.prisma`.<br>2. Run `prisma migrate` to create table.<br>3. Create controller & router for `/api/vehicles` CRUD. | Done |
| **3** | **Frontend: Project Setup & Vehicle List**<br>1. Init React project (Vite/TypeScript).<br>2. Install Axios, React Router.<br>3. Create `VehicleListPage.tsx` to fetch & display vehicles. | Done |
| **4** | **Backend: `Event` Model & API**<br>1. Define `Event` model in `schema.prisma`.<br>2. Run migration.<br>3. Create controller & router for `/api/events` CRUD. | Done |
| **5** | **Frontend: Event List & Detail View**<br>1. Create `EventListPage.tsx` to display events.<br>2. Implement routing to `EventDetailPage.tsx`.<br>3. Detail page shows single event info. | Done |
| **6** | **Backend: `User` & `Driver` Models & Auth**<br>1. Define `User`/`Driver` models in Prisma.<br>2. Implement `/api/auth/register` & `/api/auth/login` endpoints.<br>3. Use bcrypt for hashing & JWT for tokens. | Done |
| **7** | **Frontend: Authentication Flow**<br>1. Create `LoginPage.tsx` & `RegisterPage.tsx`.<br>2. Store JWT securely on login.<br>3. Set up Axios interceptor to add auth token to requests. | Done |
| **8** | **Backend: `SetupSheet` Model & Relations**<br>1. Define `SetupSheet` model in Prisma.<br>2. Create relations to `Vehicle` and `Event`.<br>3. Build protected `/api/setups` endpoints. | Done |
| **9** | **Frontend: Digital Setup Sheet Form**<br>1. Create `SetupSheetForm.tsx` component.<br>2. Form POSTs data to `/api/setups`.<br>3. Display setups on `EventDetailPage`. | Done |
| **10** | **Frontend + Backend: Performance Analytics Dashboard**<br>1. Define `LapTime` model in Prisma with relations to `Driver`, `Vehicle`, and `Event`.<br>2. Run `prisma migrate` to create table.<br>3. Build `/api/analytics/laptimes` endpoints (POST to record, GET to retrieve by event/driver/vehicle).<br>4. Create `AnalyticsDashboardPage.tsx` with Recharts line and bar charts for lap time trends, driver comparisons, and vehicle performance. | Done |
| **11** | **Frontend: Vehicle Detail, Create & Edit Pages + Driver Roster**<br>1. Create `VehicleDetailPage.tsx` with specs, performance summary (best lap, total laps), and full lap time history table.<br>2. Create `VehicleFormPage.tsx` as a shared create/edit form with validation and category dropdown.<br>3. Create `DriversPage.tsx` as a driver roster with profile cards, role badges, and key stats.<br>4. Add `driverService.ts` and `driver.ts` types to the frontend.<br>5. Update `App.tsx` routing to wire all new pages and add Drivers nav link. | Done |
| **12** | **Backend + Frontend: Role-Based Access Control (RBAC)**<br>1. Create flexible `requireRole(...roles)` middleware for route-level authorization.<br>2. Protect all backend routes: viewers = read-only, users = read/write, admins = full access + user management.<br>3. Build admin-only `/api/admin/users` endpoints (list, update role, activate/deactivate).<br>4. Create `AdminPanelPage.tsx` with user management table (role editing, status toggling).<br>5. Add role-based nav visibility and route guards on the frontend. | Done |
| **13** | **Backend + Frontend: Weather Integration for Events**<br>1. Integrate a weather API (e.g., Open-Meteo) to fetch forecasts by event venue/date.<br>2. Build `/api/events/:id/weather` endpoint to return weather data.<br>3. Display weather widget on `EventDetailPage` with temperature, conditions, and wind. | Done |
| **14** | **Backend + Frontend: Parts & Inventory Management**<br>1. Define `Part` model in Prisma with fields for name, category, quantity, cost, and vehicle relation.<br>2. Run migration and build `/api/parts` CRUD endpoints.<br>3. Create `PartsPage.tsx` with inventory table, search/filter, and low-stock alerts. | Done |
| **15** | **Backend + Frontend: Photo & Document Uploads (S3)**<br>1. Configure S3-compatible storage with presigned upload URLs.<br>2. Build `/api/uploads` endpoints for file management.<br>3. Add photo galleries to Vehicle and Event detail pages with drag-and-drop upload UI. | Done |
| **16** | **Frontend: Responsive UI Polish & Dark Mode**<br>1. Implement CSS custom-property-based dark mode with toggle in navbar.<br>2. Audit and fix all responsive breakpoints for mobile, tablet, and desktop.<br>3. Add skeleton loading states and micro-animations for improved UX. | Not Started |
| **17** | **DevOps: Docker Deployment Configuration**<br>1. Create multi-stage `Dockerfile` for backend (build + production).<br>2. Create `Dockerfile` for frontend (Vite build + nginx serve).<br>3. Update `docker-compose.yml` to orchestrate backend, frontend, and PostgreSQL.<br>4. Add health checks, environment variable management, and production-ready configs. | Not Started |
