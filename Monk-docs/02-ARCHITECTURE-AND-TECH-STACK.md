# Architecture & Technology Strategy
## Centralized Environmental Data Platform (LCA / ERD / DPP)
**Document Version:** 1.0.0  
**Date:** August 26, 2026  

---

## 1. Architectural Strategy: Modular Monolith vs Microfrontend

### Decision Overview
For the current validation and MVP stage, we adopt a **Modular Monolith** architecture. Microfrontends are deliberately deferred to later phases when multiple distinct sub-teams emerge.

```
                           +-----------------------------------+
                           |        PLATFORM FRONTEND          |
                           |   (React / TanStack Start / Vite) |
                           +-----------------------------------+
                                             |
                                             v
                           +-----------------------------------+
                           |        MODULAR BACKEND            |
                           |      (Node.js + Express.js)       |
                           +-----------------------------------+
                                 |         |         |
                  +--------------+         |         +--------------+
                  v                        v                        v
            +-----------+            +-----------+            +-----------+
            | Auth &    |            | Vendor &  |            | LCA Data  |
            | Users     |            | Products  |            | Collection|
            +-----------+            +-----------+            +-----------+
                                             |
                                             v
                           +-----------------------------------+
                           |         MONGODB DATABASE          |
                           |   (Canonical Schemas & Relations) |
                           +-----------------------------------+
```

### Why Modular Monolith over Microfrontend at this stage?
1. **Speed to Market:** Microfrontends introduce cross-app routing overhead, shared state synchronisation issues, build pipeline friction, and complex shell integrations.
2. **Data Consistency:** The core value proposition is a single canonical data structure. Enforcing this is far simpler within a unified domain layer.
3. **Future Extensibility:** By enforcing strict folder boundaries (`src/features/lca`, `src/features/vendors`, `src/features/erd`), migrating to separate microfrontends or microservices later requires minimal refactoring.

---

## 2. Technology Stack Selection

| Tier | Recommended Technology | Justification |
| :--- | :--- | :--- |
| **Backend Framework** | Node.js + Express.js | Reuses existing MEAN/MERN backend foundation. Lightweight, high throughput, async I/O suited for multi-step workflow APIs. |
| **Database** | MongoDB (via Mongoose) | Schema flexibility allows handling diverse material types, process configurations, and custom activity attributes while keeping structured sub-documents. |
| **Frontend Framework** | React 19 + TanStack Router / TanStack Start | Modern reactive UI, type-safe routing, optimal for complex wizard forms, tables, and workflow status displays. |
| **UI & Styling** | Tailwind CSS v4 + Radix UI / Shadcn UI | Delivers modern dark/light mode aesthetics, accessible dialogs, accordions, and custom form wizards. |
| **State & API Handling**| TanStack Query (React Query) | Handles server state management, automated refetching on reviewer updates, and optimistic caching. |
| **Storage & Documents** | Cloudinary / AWS S3 + Multer | Secure document uploads for vendor verification certificates and utility bills. |
| **Auth & Security** | JWT + bcryptjs + Express Middleware | Secure role-based access control (RBAC), token refresh, and tenant isolation. |

---

## 3. Backend Modular Directory Structure

```
monk-Backend/
├── src/
│   ├── config/             # DB & App configuration
│   ├── middleware/         # Auth, RBAC, error handling, validation
│   ├── models/             # Mongoose schemas (Canonical Data Models)
│   │   ├── User.js
│   │   ├── Role.js
│   │   ├── Organization.js
│   │   ├── Product.js
│   │   ├── LcaProject.js
│   │   ├── ReviewComment.js
│   │   └── AuditLog.js
│   ├── modules/
│   │   ├── auth/           # Login, Token Refresh, Password Reset
│   │   ├── users/          # User management, Role assignment
│   │   ├── vendors/        # Vendor onboarding, company details
│   │   ├── products/       # Product setup & specifications
│   │   ├── lca/            # Multi-step LCA questionnaire & activity data
│   │   ├── reviews/        # Reviewer feedback, comments, status transitions
│   │   └── upload/         # Supporting document handler
│   └── server.js
```

---

## 4. Canonical Data Core vs Feature Modules

The database is structured around a **Canonical Product Dataset**. Life Cycle Assessment (LCA), Environmental Requirement Declarations (ERD), and Digital Product Passports (DPP) are **view consumers** of this canonical dataset.

```
                           Canonical Dataset
                    (Product, Materials, Energy,
                     Logistics, Direct Emissions)
                                 │
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
   LCA Module               ERD Module               DPP Module
(ISO 14040/44 LCIA)     (EPD EN 15804/ISO 14025)   (EU Battery/Textile Reg)
```
