# Motorsports Management - Frontend

React + TypeScript + Vite frontend application for the Motorsports Management system.

## Features

- **Vehicle Management**: View, create, edit, and delete vehicles
- **Responsive Design**: Mobile-friendly interface
- **API Integration**: Axios-based API client with interceptors
- **Routing**: React Router for navigation

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for routing
- **Axios** for API requests

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm

### Installation

```bash
# Install dependencies
pnpm install
```

### Environment Variables

Create a `.env` file in the frontend directory:

```
VITE_API_BASE_URL=http://localhost:3000
```

### Development

```bash
# Start development server
pnpm dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
# Build for production
pnpm build
```

### Preview Production Build

```bash
# Preview production build
pnpm preview
```

## Project Structure

```
frontend/
├── src/
│   ├── pages/           # Page components
│   │   └── VehicleListPage.tsx
│   ├── services/        # API services
│   │   ├── api.ts
│   │   └── vehicleService.ts
│   ├── types/           # TypeScript types
│   │   └── vehicle.ts
│   ├── App.tsx          # Main app component with routing
│   ├── App.css          # Global styles
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── .env                 # Environment variables
└── package.json
```

## API Integration

The frontend communicates with the backend API at `http://localhost:3000` by default. All API calls are made through the `vehicleService` which uses Axios with interceptors for:

- Adding JWT tokens to requests
- Handling 401 unauthorized responses
- Centralized error handling

## Available Routes

- `/` - Redirects to vehicles list
- `/vehicles` - List all vehicles
- `/vehicles/:id` - View vehicle details (coming soon)
- `/vehicles/:id/edit` - Edit vehicle (coming soon)
- `/vehicles/new` - Create new vehicle (coming soon)

## Development Notes

- The application uses TypeScript for type safety
- Axios interceptors handle authentication tokens automatically
- React Router v6 is used for client-side routing
- CSS uses CSS custom properties (variables) for theming
