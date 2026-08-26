# Development Roadmap & Milestone Ticket Breakdown
## Centralized Environmental Data Platform & LCA Digitization
**Document Version:** 1.0.0  
**Date:** August 26, 2026  

---

## 1. Roadmap Overview

```
Phase 1: Milestone 1 (Current Focus)
┌─────────────────────────────────────────────────────────┐
│ User Management & LCA Data Entry Workflow Foundation    │
│ (Admin Onboarding -> Vendor Entry -> Review Loop)       │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
Phase 2: Calculation Engine & Impact Reporting
┌─────────────────────────────────────────────────────────┐
│ Emission Factor Database Integration & LCIA Engine     │
│ (Automated GWP kg CO2e, Water, Acidification Reports)   │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
Phase 3: ERD & DPP Extensions
┌─────────────────────────────────────────────────────────┐
│ EPD / ERD Compliance Export & Digital Product Passport   │
│ (QR code generation, public product passport views)     │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Milestone 1 Ticket Breakdown (Sprint Tasks)

### Epic 1: Database Schemas & Core Data Models
- **T-101:** Refactor existing backend to remove obsolete ERP models and establish clean Mongoose schemas (`Organization`, `User`, `Product`, `LcaProject`, `ReviewComment`).
- **T-102:** Implement RBAC middleware supporting roles (`SuperAdmin`, `Admin`, `Vendor`, `Reviewer`).

### Epic 2: Vendor Onboarding & User Management
- **T-201:** Build Backend API for Admin vendor creation (`POST /api/v1/vendors`), auto-generating vendor user account & temporary credentials.
- **T-202:** Build Frontend Vendor Management page (`/vendors`) with filterable list, status badges, and "Onboard New Vendor" modal.
- **T-203:** Build User Access Management page (`/users`) for assigning roles and updating credentials.

### Epic 3: Multi-Step LCA Questionnaire & Form Wizard
- **T-301:** Implement Backend API endpoints for LCA Project CRUD (`GET/POST/PUT /api/v1/lca-projects`).
- **T-302:** Build Frontend Multi-Step LCA Form Wizard (`/projects/:id/wizard`):
  - Step 1: Product & Project Basic Setup.
  - Step 2: Raw Materials & Weight Breakdown.
  - Step 3: Manufacturing, Electricity, Gas & Utilities.
  - Step 4: Transport & Supply Chain Logistics.
  - Step 5: Packaging Components.
  - Step 6: Waste & Direct Facility Emissions.
  - Step 7: Document Uploads & Proof Verification.
- **T-303:** Implement auto-save draft functionality (`status: DRAFT`) and validation before final submit (`status: SUBMITTED`).

### Epic 4: Reviewer Verification & Correction Loop
- **T-401:** Build Backend API for Reviewer feedback (`POST /api/v1/lca-projects/:id/review-comments`), status transition triggers (`CORRECTIONS_REQUIRED`, `APPROVED`).
- **T-402:** Build Frontend Reviewer Audit Dashboard (`/reviews`):
  - Item-by-item data viewer with line-item comment inputs.
  - Action buttons: "Request Changes with Notes" vs "Approve Verified Data".
- **T-403:** Build Vendor Correction View displaying open reviewer flags, inline edit inputs, and "Resubmit Corrected Data" button.

### Epic 5: Executive Dashboards & Verification Audit Trail
- **T-501:** Build role-aware Main Dashboard (`/`):
  - Admin view: Onboarded vendors counter, project status breakdown pie chart, recent audit activities.
  - Vendor view: Action items, draft projects, reviewer comment notifications.
  - Reviewer view: Pending audit queue, approved projects count.
