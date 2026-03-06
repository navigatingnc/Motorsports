# Phase 9: Frontend: Digital Setup Sheet Form

**Date:** February 23, 2026  
**Status:** ✅ Completed

---

### Summary
Implemented the complete frontend digital setup sheet feature. Created TypeScript type definitions and a service layer for communicating with the protected `/api/setups` backend endpoints. Built a full-featured `SetupSheetForm.tsx` modal component that allows users to record all vehicle setup parameters — tyres, suspension, aerodynamics, brakes, engine/drivetrain, and notes — and POST them to the API. Created a `SetupSheetCard.tsx` component that renders each setup sheet with a collapsible detail view. Updated `EventDetailPage.tsx` to fetch and display all setup sheets associated with an event, with a count badge and an inline "New Setup Sheet" button that opens the form modal. Added a dedicated `setup.css` stylesheet for all new UI elements.

### Work Performed

1. **Type Definitions** — `frontend/src/types/setup.ts`
   - Defined `SetupSheet` interface mirroring the Prisma `SetupSheet` model with all 30+ fields and populated relation types for `vehicle`, `event`, and `createdBy`
   - Defined `CreateSetupSheetDto` interface for POST/PUT payloads
   - Exported `SESSION_TYPES` and `DOWNFORCE_LEVELS` constant arrays matching backend validation enums
   - Exported `SessionType` and `DownforceLevel` derived union types

2. **Setup Service** — `frontend/src/services/setupService.ts`
   - `getAllSetups(params?)` — GET `/api/setups` with optional `eventId` and `vehicleId` query filters
   - `getSetupById(id)` — GET `/api/setups/:id`
   - `createSetup(data)` — POST `/api/setups`
   - `updateSetup(id, data)` — PUT `/api/setups/:id`
   - `deleteSetup(id)` — DELETE `/api/setups/:id`
   - Properly handles the `{ success, data, count }` wrapped API response format

3. **SetupSheetForm Component** — `frontend/src/components/SetupSheetForm.tsx`
   - Full-screen overlay modal with a scrollable form
   - Six sectioned fieldsets: Session Context, Tyre Setup, Suspension, Aerodynamics, Brakes, Engine & Drivetrain, Notes & Feedback
   - Vehicle selector populated from `/api/vehicles`, session type selector with all valid options
   - Numeric inputs with appropriate step values and units for all measurement fields
   - Strips empty string values to `undefined` before submission to keep API payloads clean
   - Loading and error states with inline error banner
   - Cancel and Save actions; calls `onSuccess` callback to trigger parent refresh

4. **SetupSheetCard Component** — `frontend/src/components/SetupSheetCard.tsx`
   - Collapsible card with a header showing session badge and vehicle label
   - Collapsed summary view showing key chips (tyre compound, pressures, brake bias, fuel load, downforce level) and a driver feedback preview
   - Expanded detail view with sectioned grids for all setup parameters — only renders fields that have values
   - Delete action with confirmation dialog and `onDeleted` callback
   - Footer showing creator name and creation date

5. **EventDetailPage Update** — `frontend/src/pages/EventDetailPage.tsx`
   - Added state management for setup sheets and vehicles
   - Fetches setup sheets on mount via `setupService.getAllSetups({ eventId })`
   - Fetches vehicles on mount for the form's vehicle selector
   - Renders a "Setup Sheets" section below the event info grid with a count badge
   - Empty state with a call-to-action button when no setups exist
   - List of `SetupSheetCard` components, each with a delete callback that re-fetches the list
   - Conditionally renders the `SetupSheetForm` modal when "New Setup Sheet" is clicked

6. **Styles** — `frontend/src/setup.css`
   - Setup sheets section header and count badge
   - Setup card with header, collapsed summary chips, and expanded detail grid
   - Form modal overlay, modal container, section headers, and responsive grid layouts
   - Responsive breakpoints for 768px and 480px viewports

### Code Generated

#### `frontend/src/types/setup.ts`
```typescript
export interface SetupSheet {
  id: string;
  vehicleId: string;
  eventId: string;
  createdById: string;
  sessionType: string;
  sessionNumber?: number;
  tyreFrontLeft?: string;
  tyreFrontRight?: string;
  tyreRearLeft?: string;
  tyreRearRight?: string;
  tyrePressureFrontLeft?: number;
  tyrePressureFrontRight?: number;
  tyrePressureRearLeft?: number;
  tyrePressureRearRight?: number;
  rideHeightFront?: number;
  rideHeightRear?: number;
  springRateFront?: number;
  springRateRear?: number;
  damperFront?: string;
  damperRear?: string;
  camberFront?: number;
  camberRear?: number;
  toeInFront?: number;
  toeInRear?: number;
  frontWingAngle?: number;
  rearWingAngle?: number;
  downforceLevel?: string;
  brakeBias?: number;
  brakeCompound?: string;
  engineMap?: string;
  differentialEntry?: number;
  differentialMid?: number;
  differentialExit?: number;
  fuelLoad?: number;
  notes?: string;
  driverFeedback?: string;
  createdAt: string;
  updatedAt: string;
  vehicle?: { id: string; make: string; model: string; year: number; number?: string; };
  event?: { id: string; name: string; type: string; };
  createdBy?: { id: string; firstName: string; lastName: string; email: string; };
}

export interface CreateSetupSheetDto {
  vehicleId: string;
  eventId: string;
  sessionType: string;
  sessionNumber?: number;
  tyreFrontLeft?: string; tyreFrontRight?: string; tyreRearLeft?: string; tyreRearRight?: string;
  tyrePressureFrontLeft?: number; tyrePressureFrontRight?: number;
  tyrePressureRearLeft?: number; tyrePressureRearRight?: number;
  rideHeightFront?: number; rideHeightRear?: number;
  springRateFront?: number; springRateRear?: number;
  damperFront?: string; damperRear?: string;
  camberFront?: number; camberRear?: number;
  toeInFront?: number; toeInRear?: number;
  frontWingAngle?: number; rearWingAngle?: number; downforceLevel?: string;
  brakeBias?: number; brakeCompound?: string;
  engineMap?: string;
  differentialEntry?: number; differentialMid?: number; differentialExit?: number;
  fuelLoad?: number;
  notes?: string; driverFeedback?: string;
}

export const SESSION_TYPES = ['Practice', 'Qualifying', 'Race', 'Test', 'Warm-Up', 'Other'] as const;
export const DOWNFORCE_LEVELS = ['Low', 'Medium', 'High'] as const;
export type SessionType = (typeof SESSION_TYPES)[number];
export type DownforceLevel = (typeof DOWNFORCE_LEVELS)[number];
```

#### `frontend/src/services/setupService.ts`
```typescript
import api from './api';
import type { SetupSheet, CreateSetupSheetDto } from '../types/setup';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

export const setupService = {
  getAllSetups: async (params?: { eventId?: string; vehicleId?: string }): Promise<SetupSheet[]> => {
    const response = await api.get<ApiResponse<SetupSheet[]>>('/api/setups', { params });
    return response.data.data;
  },
  getSetupById: async (id: string): Promise<SetupSheet> => {
    const response = await api.get<ApiResponse<SetupSheet>>(`/api/setups/${id}`);
    return response.data.data;
  },
  createSetup: async (data: CreateSetupSheetDto): Promise<SetupSheet> => {
    const response = await api.post<ApiResponse<SetupSheet>>('/api/setups', data);
    return response.data.data;
  },
  updateSetup: async (id: string, data: Partial<CreateSetupSheetDto>): Promise<SetupSheet> => {
    const response = await api.put<ApiResponse<SetupSheet>>(`/api/setups/${id}`, data);
    return response.data.data;
  },
  deleteSetup: async (id: string): Promise<void> => {
    await api.delete(`/api/setups/${id}`);
  },
};
```

#### `frontend/src/components/SetupSheetForm.tsx`
See full file at `frontend/src/components/SetupSheetForm.tsx` (619 lines). Key structure:
- Modal overlay with scrollable form container
- Six setup sections: Session Context, Tyre Setup, Suspension, Aerodynamics, Brakes, Engine & Drivetrain, Notes & Feedback
- Controlled form state with `handleChange` normalising numeric inputs
- `handleSubmit` strips empty strings, calls `setupService.createSetup`, invokes `onSuccess` callback

#### `frontend/src/components/SetupSheetCard.tsx`
See full file at `frontend/src/components/SetupSheetCard.tsx` (217 lines). Key structure:
- Collapsible card: header with session badge, vehicle label, expand/delete buttons
- Collapsed summary: key value chips + driver feedback preview
- Expanded detail: sectioned grids for all parameters, only renders non-null fields via `SetupField` helper
- Delete with confirmation and `onDeleted` callback

#### `frontend/src/pages/EventDetailPage.tsx` (updated)
Key additions:
```typescript
// New state
const [setups, setSetups] = useState<SetupSheet[]>([]);
const [setupsLoading, setSetupsLoading] = useState<boolean>(false);
const [vehicles, setVehicles] = useState<Vehicle[]>([]);
const [showSetupForm, setShowSetupForm] = useState<boolean>(false);

// Fetch on mount
void fetchSetups(id);
void fetchVehicles();

// Setup Sheets section renders SetupSheetCard list + SetupSheetForm modal
```

#### `frontend/src/setup.css`
New dedicated stylesheet (280+ lines) covering:
- `.setup-sheets-section`, `.setup-sheets-header`, `.setup-sheets-count`, `.setup-sheets-empty`, `.setup-sheets-list`
- `.setup-card`, `.setup-card-header`, `.setup-session-badge`, `.setup-vehicle-label`
- `.setup-card-summary`, `.setup-summary-chip`, `.setup-feedback-preview`
- `.setup-card-detail`, `.setup-detail-section`, `.setup-detail-grid`, `.setup-detail-field`
- `.setup-form-overlay`, `.setup-form-modal`, `.setup-form-header`, `.setup-section`, `.setup-grid--{1,2,3,4}`
- Responsive breakpoints at 768px and 480px

### Build Verification
Frontend TypeScript compilation and Vite production build pass with zero errors. Bundle size: 305 KB JS, 15.4 KB CSS.

### Next Phase Preview
There are no further phases defined in `project_plan.md`. Phase 9 is the final planned phase of the Motorsports Management Web App.

---
