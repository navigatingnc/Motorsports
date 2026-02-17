# Diamond Apex Collective - Backend API

This is the backend API for the Diamond Apex Collective motorsports management application.

## Technology Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (to be implemented)

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- PostgreSQL installed and running
- pnpm package manager

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Generate Prisma Client:
```bash
pnpm prisma:generate
```

4. Push database schema:
```bash
pnpm prisma:push
```

### Development

Start the development server with hot reload:
```bash
pnpm dev
```

The API will be available at `http://localhost:3000`

### Available Scripts

- `pnpm dev` - Start development server with nodemon
- `pnpm build` - Build TypeScript to JavaScript
- `pnpm start` - Run production build
- `pnpm prisma:generate` - Generate Prisma Client
- `pnpm prisma:migrate` - Run database migrations
- `pnpm prisma:push` - Push schema changes to database

## API Endpoints

### Health Check
- `GET /health` - Check API status

### API Info
- `GET /api` - Get API version and info

## Project Structure

```
backend/
├── src/
│   ├── index.ts          # Main entry point
│   ├── prisma.ts         # Prisma client singleton
│   ├── controllers/      # Route controllers (to be added)
│   ├── routes/           # API routes (to be added)
│   └── middleware/       # Express middleware (to be added)
├── prisma/
│   └── schema.prisma     # Database schema
├── docker-compose.yml    # Docker setup for PostgreSQL
└── package.json          # Dependencies and scripts
```

## Database

The application uses PostgreSQL as its database. The schema is managed through Prisma.

### Connection Details (Development)
- Host: localhost
- Port: 5432
- Database: motorsports_db
- User: motorsports
- Password: motorsports_dev_password

## Next Steps

Phase 2 will implement:
- Vehicle model and CRUD API endpoints
- Database migrations
- API route structure
