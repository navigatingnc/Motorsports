# Phase 27: Predictive Performance Modeling

**Date:** 2026-03-10
**Status:** 🚧 Not Started

---

### Summary

This phase will introduce a predictive modeling capability to the platform, allowing teams to forecast lap times and understand the potential impact of setup changes. By building a backend service that leverages a regression model, the system will be able to move beyond historical analysis and provide forward-looking insights. This will empower teams to make more informed, data-driven decisions on vehicle setup and race strategy.

### Work Performed

*   **Backend:**
    *   Develop a new `PredictionService.ts` to house the lap time prediction logic.
    *   Implement a regression model (e.g., using a library like `tensorflow.js` or a Python-based microservice) to predict lap times based on various inputs.
    *   Create a new API endpoint (`/api/predictions`) to handle prediction requests.
*   **Frontend:**
    *   Create a new `PredictionEngine.tsx` component to allow users to input different parameters and see the predicted outcomes.
    *   Integrate the prediction component into relevant pages, such as the `VehicleDetailPage` or a new dedicated `StrategyPage`.

### Generated Code

| File Path | Description |
| :--- | :--- |
| `backend/src/services/PredictionService.ts` | Service to manage the predictive modeling logic. |
| `backend/src/controllers/PredictionController.ts` | API controller for handling prediction-related requests. |
| `backend/src/routes/predictionRoutes.ts` | API routes for the prediction feature. |
| `frontend/src/components/PredictionEngine.tsx` | A component for simulating the impact of setup changes. |

---
