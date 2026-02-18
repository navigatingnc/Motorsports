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
| **4** | **Backend: `Event` Model & API**<br>1. Define `Event` model in `schema.prisma`.<br>2. Run migration.<br>3. Create controller & router for `/api/events` CRUD. | Not Started |
| **5** | **Frontend: Event List & Detail View**<br>1. Create `EventListPage.tsx` to display events.<br>2. Implement routing to `EventDetailPage.tsx`.<br>3. Detail page shows single event info. | Not Started |
| **6** | **Backend: `User` & `Driver` Models & Auth**<br>1. Define `User`/`Driver` models in Prisma.<br>2. Implement `/api/auth/register` & `/api/auth/login` endpoints.<br>3. Use bcrypt for hashing & JWT for tokens. | Not Started |
| **7** | **Frontend: Authentication Flow**<br>1. Create `LoginPage.tsx` & `RegisterPage.tsx`.<br>2. Store JWT securely on login.<br>3. Set up Axios interceptor to add auth token to requests. | Not Started |
| **8** | **Backend: `SetupSheet` Model & Relations**<br>1. Define `SetupSheet` model in Prisma.<br>2. Create relations to `Vehicle` and `Event`.<br>3. Build protected `/api/setups` endpoints. | Not Started |
| **9** | **Frontend: Digital Setup Sheet Form**<br>1. Create `SetupSheetForm.tsx` component.<br>2. Form POSTs data to `/api/setups`.<br>3. Display setups on `EventDetailPage`. | Not Started |
