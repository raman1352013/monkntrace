# Product Requirement Document (PRD)
## Project: Centralized Environmental Data Platform & Multi-Regulation Compliance Engine (LCA / ERD / DPP / PPWR)
**Document Version:** 1.1.0  
**Date:** August 26, 2026  
**Status:** Approved Architecture & Roadmap  

---

## 1. Executive Summary & Vision

### 1.1 Problem Statement
Manufacturers and brands across India and global supply chains face huge compliance pressures from international environmental regulations — including **LCA (ISO 14040/44)**, **ERD/EPD (ISO 14025)**, **DPP (Digital Product Passport)**, and **PPWR (EU Packaging and Packaging Waste Regulation)**. Vendors currently submit data via chaotic spreadsheets, leading to compliance bottlenecks, audit failures, and data duplication.

### 1.2 Product Vision
Build a **Self-Service Centralized Environmental Data Platform**. Suppliers and manufacturers across India can log in, register their company, and enter structured product life cycle data. Internal environmental auditors inspect and verify the submitted activity data once. That single verified canonical dataset is then automatically consumed to generate:
1. **LCA** — Life Cycle Assessment Impact Studies ($\text{kg CO}_2\text{e}$ Carbon Footprint, Water Scarcity).
2. **ERD / EPD** — Environmental Product Declarations (B2B EPD compliance).
3. **DPP** — Digital Product Passport (Consumer QR Codes).
4. **PPWR** — Packaging and Packaging Waste Regulation Compliance (Recyclability grades, Post-Consumer Recycled PCR %, Packaging Weight Minimization).

---

## 2. Universal Data Engine Architecture

```
                       ALL INDIA / GLOBAL VENDORS & MANUFACTURERS
                                          │
                                          ▼
                         Self-Service Signup & Data Entry
                                          │
                                          ▼
                          Internal Review & Audit Loop
                                (Verification)
                                          │
                                          ▼
                        Canonical Environmental Data Core
                                          │
        ┌───────────────────┬─────────────┴─────┬───────────────────┐
        ▼                   ▼                   ▼                   ▼
   LCA Module           ERD Module          DPP Module          PPWR Module
 (Life Cycle Assessment) (EPD Declarations) (Digital Passport) (Packaging Regulation)
```

---

## 3. Platform Capabilities & Scope

### 3.1 Self-Service Onboarding & Dynamic Questionnaire
- **Self-Service Registration:** Suppliers across India can register, set up company profiles, and start submitting product data.
- **Flexible Industry Fields:** Dynamic questionnaires adapted for diverse sectors (Metals/Steel, Plastics/Packaging, Textiles, Electronics, Chemicals, FMCG).

### 3.2 Verification & Auditor Correction Loop
- Internal LCA team audits every submitted line item (Raw materials, energy kWh, transport legs, packaging PCR %, waste).
- Line-item comment flagging (`CORRECTIONS_REQUIRED`) with instant vendor notification and resubmission.

### 3.3 Multi-Compliance Output Engine
- **LCA:** Calculates GWP ($\text{kg CO}_2\text{e}$), Water Footprint, Acidification, Eutrophication.
- **ERD / EPD:** Formats environmental declarations for ISO 14025 compliance.
- **DPP:** Generates public QR Codes for product passports.
- **PPWR:** Evaluates packaging recyclability classes (Grade A to D), post-consumer recycled (PCR) content percentage, and packaging-to-product weight ratio.

---

## 4. Lifecycle Status Machine

```
[ SELF_REGISTERED / INVITED ] ──► [ DRAFT ] ──► [ SUBMITTED / UNDER_REVIEW ]
                                                        │                ▲
                                                        ▼                │
                                             [ CORRECTIONS_REQUIRED ] ───┘
                                                        │
                                                        ▼
                                                   [ APPROVED ]
                                                        │
                      ┌─────────────────────────────────┼─────────────────────────────────┐
                      ▼                                 ▼                                 ▼
              [ LCA COMPLETED ]                 [ ERD / EPD READY ]             [ DPP / PPWR ACTIVE ]
```
