# Canonical Data Model & MongoDB Schemas
## LCA Environmental Platform Data Architecture
**Document Version:** 1.0.0  
**Date:** August 26, 2026  

---

## 1. Entity Relationship Diagram (Conceptual)

```
Organization (Vendor / Client Company)
   │
   ├── Users (Admin, Vendor Reps)
   │
   └── Products (Finished Products / Parts)
          │
          └── LcaProjects (LCA Studies / Submissions)
                │
                ├── Raw Materials Input (Sub-document / Collection)
                ├── Manufacturing Processes (Utilities, Fuels)
                ├── Transport & Distribution (Inbound / Outbound legs)
                ├── Packaging Materials
                ├── Waste & Direct Emissions
                ├── Supporting Documents (Certificates, Invoices)
                └── Reviews & Field Comments
```

---

## 2. Mongo Collection Specifications

### 2.1 Organization Collection (`organizations`)
```js
{
  name: String,               // e.g., "Apex Steel Industries"
  code: String,               // Unique code, e.g., "APEX-001"
  orgType: String,            // 'CLIENT', 'VENDOR', 'AUDITOR_FIRM'
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  contactEmail: String,
  contactPhone: String,
  status: String,             // 'ACTIVE', 'INACTIVE', 'PENDING'
  createdAt: Date,
  updatedAt: Date
}
```

### 2.2 Product Collection (`products`)
```js
{
  organizationId: ObjectId,  // Reference to Organization
  name: String,            // e.g., "Stainless Steel Water Bottle 750ml"
  sku: String,             // Stock Keeping Unit / Part Number
  category: String,        // e.g., "Consumer Goods / Drinkware"
  description: String,
  weightKg: Number,        // Weight per unit in kilograms
  functionalUnit: String,  // e.g., "1 bottle over 5 year lifetime"
  declaredUnit: String,    // e.g., "1 kg of product"
  productionVolumeAnnual: Number,
  manufacturingLocation: {
    facilityName: String,
    country: String,
    city: String
  },
  status: String,          // 'ACTIVE', 'ARCHIVED'
  createdAt: Date,
  updatedAt: Date
}
```

### 2.3 LCA Project Collection (`lcaprojects`)
```js
{
  title: String,           // e.g., "LCA Study - Steel Bottle 2026 Q3"
  productId: ObjectId,     // Ref to Product
  vendorId: ObjectId,      // Ref to Organization (Vendor)
  assignedReviewerId: ObjectId, // Ref to User (Reviewer)
  systemBoundary: String,  // 'CRADLE_TO_GATE', 'CRADLE_TO_GRAVE', 'GATE_TO_GATE'
  dataPeriodStart: Date,
  dataPeriodEnd: Date,
  status: String,          // 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CORRECTIONS_REQUIRED', 'APPROVED', 'LCA_COMPLETED'
  currentStep: Number,     // 1 to 7 (Wizard progress)
  
  // Section 1: Raw Materials
  materials: [{
    materialName: String,     // e.g., "Stainless Steel 304"
    quantity: Number,
    unit: String,             // 'kg', 'g', 'tonne'
    recycledContentPct: Number, // 0 - 100%
    supplierName: String,
    originCountry: String,
    transportDistanceKm: Number,
    verificationDocId: ObjectId
  }],

  // Section 2: Manufacturing & Utility Consumption
  manufacturing: {
    electricityKwh: Number,
    electricitySource: String, // 'GRID_MIX', 'SOLAR_ON_SITE', 'WIND_PPA'
    naturalGasM3: Number,
    dieselLiters: Number,
    waterConsumptionLiters: Number,
    processWastewaterLiters: Number
  },

  // Section 3: Transport & Logistics
  transportation: [{
    legType: String,          // 'RAW_MATERIAL_INBOUND', 'FINISHED_GOODS_OUTBOUND'
    mode: String,             // 'TRUCK_DIESEL', 'CONTAINER_SHIP', 'AIR_FREIGHT', 'RAIL'
    distanceKm: Number,
    weightTons: Number
  }],

  // Section 4: Packaging
  packaging: [{
    packagingType: String,    // 'CARDBOARD_BOX', 'PLASTIC_FILM', 'WOODEN_PALLET'
    weightGramsPerUnit: Number,
    recycledContentPct: Number,
    disposalRoute: String     // 'RECYCLED', 'LANDFILL', 'INCINERATION'
  }],

  // Section 5: Waste & Direct Emissions
  wasteEmissions: [{
    wasteType: String,        // 'HAZARDOUS_SLUDGE', 'SCRAP_METAL', 'GENERAL_TRASH'
    quantityKg: Number,
    treatmentMethod: String,  // 'RECYCLING', 'LANDFILL', 'INCINERATION_WITH_ENERGY_RECOVERY'
    directCo2eKg: Number      // Optional direct stack emissions if measured
  }],

  // Section 6: Documents
  documents: [{
    fileName: String,
    fileUrl: String,
    fileType: String,         // 'UTILITY_BILL', 'MATERIAL_CERTIFICATE', 'TEST_REPORT'
    uploadedAt: Date
  }],

  submittedAt: Date,
  approvedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 2.4 Review & Comments Collection (`reviewcomments`)
```js
{
  projectId: ObjectId,       // Ref to LcaProject
  reviewerId: ObjectId,      // Ref to User
  section: String,           // 'MATERIALS', 'MANUFACTURING', 'TRANSPORT', 'PACKAGING', 'WASTE', 'GENERAL'
  fieldKey: String,          // Specific field key if applicable, e.g. "materials[0].quantity"
  comment: String,           // Reviewer text note, e.g., "Please upload utility bill to verify 500 kWh electricity figure."
  status: String,            // 'OPEN', 'RESOLVED', 'REJECTED'
  vendorResponse: String,    // Text entered by vendor during correction
  createdAt: Date,
  updatedAt: Date
}
```
