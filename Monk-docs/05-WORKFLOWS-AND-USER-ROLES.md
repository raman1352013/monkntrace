# Platform Workflows & User Roles
## Step-by-Step Journeys for Admin, Vendor, and Reviewer
**Document Version:** 1.0.0  
**Date:** August 26, 2026  

---

## 1. End-to-End Workflow Diagram

```
 +------------------------+
 |     ADMIN PORTAL       |
 | 1. Admin Onboards      |
 |    Vendor & Credentials|
 +-----------+------------+
             |
             v
 +------------------------+
 |     VENDOR PORTAL      |
 | 2. Vendor Logs In      |
 | 3. Fills Multi-Step    |
 |    LCA Questionnaire   |
 | 4. Saves Draft /       |
 |    Submits Project     |
 +-----------+------------+
             |
             v
 +------------------------+
 |    REVIEWER PORTAL     |
 | 5. Reviewer Inspects   |
 |    Field-by-Field Data |
 +-----------+------------+
             |
    +--------+--------+
    |                 |
    v                 v
[Data Incorrect]  [Data Correct]
    |                 |
    v                 v
[Request          [Approve
 Corrections]      Project Data]
    |                 |
    v                 v
[Vendor Edits    [Data Verified &
 & Resubmits]     Ready for LCA/
                      ERD/DPP]
```

---

## 2. Granular User Role Matrix

### 2.1 Admin Workflow Steps
1. **Vendor Onboarding:** Admin navigates to `/vendors`, clicks **"Onboard Vendor"**, fills company details (Name, Contact Email, Assigned Industry Sector, Facility Locations).
2. **Credential Generation:** System auto-generates temporary vendor account credentials or sends email invitation link.
3. **Project Assignment:** Admin creates a new LCA project container for a vendor product and assigns an internal reviewer.
4. **Platform Monitoring:** Admin tracks overall onboarding progress via executive metrics dashboard.

### 2.2 Vendor Workflow Steps
1. **Authentication:** Vendor receives login credentials and logs into `/login`.
2. **Dashboard Overview:** Vendor views assigned LCA projects, current submission statuses, and deadlines.
3. **Multi-Step Form Wizard (`/projects/:id/wizard`):**
   - **Step 1: Product Definition:** Weight, declared unit, annual production volume.
   - **Step 2: Raw Materials:** Itemized breakdown of constituent materials, quantities, origins.
   - **Step 3: Manufacturing & Energy:** Facility electricity (kWh), gas, water consumption.
   - **Step 4: Logistics & Transport:** Transport distance, mode (Truck, Sea, Air) from suppliers to plant.
   - **Step 5: Packaging Materials:** Cardboard, plastic, pallets per unit.
   - **Step 6: Waste & Direct Emissions:** Scrap metal, wastewater, direct emissions.
   - **Step 7: Supporting Verification Docs:** Upload utility invoices, material specification sheets.
4. **Draft vs Submit:**
   - Vendor can click **"Save Draft"** at any time.
   - Upon completion, vendor clicks **"Submit for Review"** (Status transitions from `DRAFT` to `UNDER_REVIEW`).

### 2.3 Reviewer / LCA Auditor Workflow Steps
1. **Audit Queue:** Reviewer logs into `/reviews` and views all projects in `UNDER_REVIEW` status.
2. **Line-Item Inspection:** Reviewer clicks into a project to inspect side-by-side activity data and uploaded supporting documents.
3. **Inline Commenting & Flagging:**
   - Reviewer can flag any line item (e.g. *"Electricity consumption of 5,000 kWh seems unrealistically low for 10 tonnes of steel processing. Upload utility bill or revise."*).
4. **Decision Execution:**
   - **Action A: Request Changes:** Project status changes to `CORRECTIONS_REQUIRED`. Vendor is notified.
   - **Action B: Approve Dataset:** Project status changes to `APPROVED`. Dataset is locked and marked canonical-ready.
