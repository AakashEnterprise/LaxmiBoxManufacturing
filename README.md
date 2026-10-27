# PackFlow ERP — Corrugated Box Manufacturing Platform

> *"One platform. Complete packaging operations."*

**PackFlow ERP** is a complete, enterprise-grade, fully functional frontend demonstration of an Enterprise Resource Planning (ERP) platform purpose-built for corrugated packaging and paper box manufacturing plants.

- **Manufacturing Company**: Shree Pack Industries Pvt. Ltd.
- **Factory Location**: Unit 1: Sanand Industrial Estate, Ahmedabad, Gujarat, India.
- **Currency**: Indian Rupee (₹).
- **Date Format**: DD MMM YYYY.
- **Dimensional Units**: millimeters (mm).
- **Weight Units**: kilograms (kg) and metric tonnes (MT).
- **Standard Tax Code**: GST 12% on Corrugated Paper Boxes (HSN `48191010`).

---

## 1. Technology Stack & Architectural Principles

- **Frontend Core**: HTML5, CSS3, Vanilla JavaScript (ES6+).
- **Zero Node.js / NPM**: No Node.js runtime, no NPM/yarn dependencies, no bundlers, no build steps.
- **Zero Frontend Frameworks**: No React, Next.js, Vue, Angular, Svelte, or TypeScript.
- **Zero CSS Frameworks**: 100% custom, reusable Enterprise Design System (no Bootstrap, no Tailwind CSS).
- **Persistence**: Reactive browser `localStorage` layer (`PACKFLOW_ERP_STATE_V1`) with automated state synchronization and one-click factory seed reset.
- **Icons**: Google Material Symbols Outlined.
- **Typography**: Inter with OpenType tabular figures (`font-feature-settings: "tnum" 1`).

---

## 2. Quick Start & How to Run

To run the application locally, use Python's built-in HTTP server:

```bash
# 1. Open PowerShell / Command Prompt and navigate to the project directory:
cd C:\Users\KK\.gemini\antigravity\scratch\packflow-erp

# 2. Start the local development server:
python -m http.server 8000

# 3. Open your browser and visit:
http://localhost:8000
```

*Note: You can also open `index.html` directly in Google Chrome, Microsoft Edge, Mozilla Firefox, or Apple Safari.*

---

## 3. Project Directory Structure

```
packflow-erp/
│
├── index.html                           # Single-Page Application Shell & Navigation
├── README.md                            # Comprehensive Architecture & User Guide
├── assets/                              # Brand and visual assets
│
├── css/
│   ├── tokens.css                       # Colors, typography, elevations, radii, CSS variables
│   ├── base.css                         # Reset, typographic scales, flex/grid utilities, animations
│   ├── layout.css                       # Sidebar navigation, topbar header, responsive grid shell
│   ├── components.css                   # Buttons, badges, spec chips, cards, modals, drawers, toasts
│   ├── forms.css                        # Inputs, selects, number steppers, dynamic line item tables
│   ├── tables.css                       # High-density data tables, pagination, sorting, row action menus
│   ├── dashboard.css                    # 10 KPI grid, machine telemetry cards, 6-stage kanban, deckle visualizer
│   └── print.css                        # Clean print stylesheets for Quotations, Invoices, Challans & Job Cards
│
├── js/
│   ├── data.js                          # Authentic manufacturing seed dataset (Shree Pack Industries)
│   ├── store.js                         # Centralized reactive state store, pub/sub, localStorage persistence
│   ├── calculations.js                  # Box costing engine, multi-ply GSM formulas, deckle trim optimizer, GST
│   ├── components.js                    # Modals, slide-out drawer, toast alerts, confirmations, CSV export, print
│   ├── router.js                        # Hash-based client router (#/dashboard, #/sales-orders, etc.)
│   ├── app.js                           # Master bootstrapper, global search (Ctrl+K), quick launcher, role switch
│   └── pages/
│       ├── dashboard.js                 # Executive Dashboard & Factory Floor Live operations
│       ├── sales.js                     # Customers & Accounts, Box Quotation Calculator, Sales Orders & Drawer
│       ├── production.js                # Job Cards / Work Orders, Stage Updates, MRP Material Requirements
│       ├── inventory.js                 # Paper Reel Inventory (Deckle/GSM), Deckle Slitting Trim Minimizer, FG
│       ├── procurement_quality_dispatch.js # Purchase Orders, Lab QC Testing (BS/ECT/Moisture), Dispatches
│       ├── finance.js                   # Invoices & GST Breakup, Payment Receipts, Receivables & Ageing
│       ├── people_maintenance.js        # Workforce Directory, Machine Register, Preventive Maint., Scrap Waste
│       └── reports_admin.js             # Reports Center (CSV Downloads), Approvals Inbox, Settings & Portals
│
└── tests/
    └── smoke-test.md                    # 12-scenario QA test protocol and verification matrix
```

---

## 4. Complete Module Overview

### 4.1 Overview & Cockpit
- **Executive Dashboard (`#/dashboard`)**:
  - Live plant telemetry status banner with time and active shift indicator.
  - 10 Enterprise KPI cards: Today's Dispatched Value, Monthly Net Revenue MTD, Plant Output Today MT, Outstanding Receivables, Active Work Orders, Corrugation OEE %, Kraft Reel Inventory, FG Boxes Ready for Dispatch, Trim Scrap %, and Critical Pending Approvals.
  - Live Corrugation & Converting Machine Telemetry matrix (speeds, active jobs, flute setups, operator tags, boiler pressure).
  - High-priority work orders table with progress bars.
  - Urgent Approvals drawer card with instant `Approve` and `Reject` buttons.
  - Raw Material Paper Reel Radar (GSM buffers for 120, 150, 180, 230 GSM).
  - Today's Dispatch Fleet schedule.
  - Financial ageing buckets (0-30 days, 31-45 days, >45 days overdue).
- **Factory Floor Live (`#/factory`)**:
  - 15-second heartbeat telemetry stream.
  - 6-Stage Kanban Production Routing Matrix:
    1. *Queued / Staged*
    2. *Corrugation (5P/3P)*
    3. *Flexo Printing & Slotting*
    4. *Die-Cut & Creasing*
    5. *Folding & Stitching*
    6. *QC & Bundling*
  - Unplanned Micro-Stoppage Downtime Log stream (Web breaks, ink pH/viscosity calibration, die jams) with "Log Micro-Stop" button.
- **Approvals Inbox (`#/approvals`)**:
  - 4 Critical pending governance actions:
    1. PO-2026-0071: Century Pulp & Paper (80 MT Kraft, ₹35,20,000).
    2. UrbanKart Credit Limit Override: Dispatch Release (₹4.2L exceeded).
    3. Western Foods Margin Approval: 11.2% commercial deviation.
    4. Damaged Moisture Reel Write-Off: REEL-25-0893 (₹33,582).
  - Approving or Rejecting updates state immediately and decrements badge counts.

### 4.2 Sales & CRM
- **Customers & Accounts (`#/customers`)**:
  - Master CRM registry with GSTINs, contact persons, credit limits, outstanding ledgers.
  - `+ Add Customer` modal with immediate selector availability across the platform.
  - Live search and category filters (FMCG, E-Commerce, Food, Dairy, Pharma).
  - Native CSV export.
- **Box Quotation Calculator & Costing (`#/quotations`)**:
  - Live parametric input modeling: Length, Width, Height (mm), Plies (3, 5, 7), Flute (B, C, E, B+C), Paper GSMs, Paper rate ₹/kg, Conversion cost, Printing colors, Wastage %, Margin %.
  - Algorithmic sheet size computation: `(2*(L+W) + 45mm)` × `(W + H + 20mm)`.
  - Board area (m²), finished box weight (kg), factory cost, unit selling price, 12% GST, and gross profit margin %.
  - "Save Official Quotation" and "Convert to Confirmed Sales Order (SO)" actions.
- **Sales Orders (`#/sales-orders`)**:
  - High-density master order table with live progress bars, balance quantities, payment status, and promised delivery dates.
  - Slide-out Quick Inspection Drawer:
    - Target specifications summary.
    - 5-Ply Structure & Paper Recipe blueprint with colored ply indicators.
    - Linked shop-floor work orders.
    - Commercial Tax Ledger with CGST + SGST breakup.
    - "Approve Production Release" and printable "Order Ack (PDF)".
- **Box Specification Master (`#/products`)**:
  - Dimensioned isometric SVG carton illustrations, FEFCO styles, flute recipes, burst factor, and ECT strength parameters.

### 4.3 Production & Shop Floor
- **Job Cards / Work Orders (`#/production/jobs`)**:
  - Routing batches across corrugators, flexo printers, die-cutters, and folder-gluers.
  - "Log Shift Output & Scrap" modal with progress advancement.
  - "Complete Job & Release to QC" action putting finished goods into staging.
  - Printable Manufacturing Job Card layout with operator sign-off lines.
- **Material Requirements Planning (`#/mrp`)**:
  - Demand explosion from sales orders against warehouse reel stock.
  - Automatically identifies shortages (e.g. 140 GSM Fluting deficit of 5.70 MT).
  - "+ Generate Purchase Requisitions for Shortages" button creates POs instantly.

### 4.4 Inventory & Paper Store
- **Paper Reel Inventory (`#/inventory/reels`)**:
  - 374 active reels tracked by Reel ID, Paper Grade, Mill, GSM, Burst Factor, Deckle, Weights, Moisture %, Rate ₹/kg, Value, and Bay Location.
  - Critical GSM Buffer Depletion Alert banner (120 GSM fluting).
  - Inward Reel (GRN) weighbridge entry form.
  - Digital moisture probe retesting action.
  - Printable Reel Barcode Tag.
  - Deckle Slitting Trim Waste Minimizer with visual cut bar (Cut 1, Cut 2, Cut 3, Trim Waste % vs optimal 1750mm deckle saving ₹18,400).
- **Finished Goods Warehouse (`#/inventory/fg`)**:
  - Quality-cleared pallet staging, strapped bundles, dock bays, and truck allocation.

### 4.5 Procurement & Vendors
- **Suppliers & Purchase Orders (`#/procurement`)**:
  - Mill directory (Gujarat Kraft, Century Pulp, Western Paper, ITC Bhadrachalam).
  - Purchase order builder.
  - Goods Receipt Note (GRN) inwarding: accepting a PO increases on-hand reel stock immediately.

### 4.6 Quality & Laboratory
- **Quality Control Dashboard (`#/quality`)**:
  - Bursting Strength (BS kg/cm²), Edge Crush Test (ECT kN/m), Cobb sizing, and Moisture % checks.
  - Passing an inspection releases cartons to the Finished Goods Dock.
  - Failing an inspection locks the material in Quarantine Hold.

### 4.7 Dispatch & Logistics
- **Dispatch Planning (`#/dispatch`)**:
  - Schedule truck loading, assign transporter, vehicle number, driver contact, and destination.
  - Validates dispatch quantity against order balance.
  - Automatically generates Delivery Challan and E-Way Bill reference.
  - Printable Delivery Challan layout.

### 4.8 Finance & Accounting
- **Finance Cockpit & Invoices (`#/finance`)**:
  - Customer Tax Invoices with 12% GST breakdown (CGST 6% + SGST 6% / IGST 12%, HSN `48191010`).
  - Printable Tax Invoice layout with bank IFSC/account details.
  - Payment Receipts recording with partial invoice allocation and automatic customer ledger balance reduction.
  - Accounts Receivable Ageing matrix (0-30 days, 31-45 days, >45 days overdue).

### 4.9 Workforce & Maintenance
- **Employees & Shifts (`#/people`)**: Staff directory, shift assignments, and daily attendance.
- **Machine Register & Maintenance (`#/maintenance`)**: Machine cards with OEE %, nominal speeds, and Unplanned Breakdown ticket logger.
- **Scrap & Waste Management (`#/waste`)**: Kraft trim losses, setup waste, baling press compaction, and salvage resale revenue.

### 4.10 Administration & Portals
- **Reports & Analytics (`#/reports`)**: One-click native CSV downloads for Sales, Production, and Reel Inventory.
- **Document Repository (`#/documents`)**: Master print archive for Invoices, Challans, Quotes, and Job Cards.
- **Settings & Demo Reset (`#/settings`)**: Company profile configuration and one-click "Reset Demo Data" to restore pristine factory seed data.
- **Portals (`#/portal/customer`, `#/portal/supplier`)**: Demonstration views for self-service order tracking and vendor delivery acknowledgments.

---

## 5. End-to-End Core Workflow Walkthrough

1. **Create Customer**: Go to `#/customers` → click `+ Add Customer` → enter details → save. Customer is now available across all dropdowns.
2. **Calculate Box Quote**: Go to `#/quotations` → select customer → set dimensions (e.g. 450 × 300 × 280 mm), 5-Ply B+C flute, paper GSMs → inspect live calculated unit price, 12% GST, and margin.
3. **Convert to Sales Order**: Click "Convert to Confirmed Sales Order" → `SO-2026-00146` is generated.
4. **MRP Material Check**: Go to `#/mrp` → select order → inspect required reels vs stock → click "+ Generate Purchase Requisitions for Shortages".
5. **Procurement & GRN Inward**: Go to `#/procurement` → select PO → click "Record GRN Receipt" → on-hand reel stock immediately increases.
6. **Issue & Update Job Card**: Go to `#/production/jobs` → click `+ Issue New Job Card` linked to the SO → click `+` on the job card to log shift output & scrap → finalize job to release to QC.
7. **Quality Inspection**: Go to `#/quality` → inspect BS & ECT test metrics → pass inspection to release to Finished Goods dock.
8. **Schedule Dispatch**: Go to `#/dispatch` → click `+ Create Dispatch & Challan` → enter vehicle no & qty → Delivery Challan & E-Way bill generated; SO remaining balance updates.
9. **Generate Tax Invoice**: Go to `#/finance` → click `+ Generate Tax Invoice` → select SO → form calculates taxable amount + 12% GST → invoice created.
10. **Record Payment**: Click `+ Record Payment` → select customer & amount → allocate to invoice → invoice status updates to Paid / Partially Paid and customer ledger outstanding reduces!
11. **Export & Print**: Click CSV Export on any table or Print on any document to verify production-ready output.

---

## 6. Local Demo Persistence & Reset Policy

- State changes (created customers, sales orders, job updates, reel inwards, dispatches, invoices, payments, approvals) are automatically persisted in `localStorage` under key `PACKFLOW_ERP_STATE_V1`.
- State survives browser tab refresh.
- To restore the original factory demo state at any time, go to **Settings (`#/settings`)** and click **Reset Demo Data (Pristine)**.

---

## 7. Important Disclosure & Simulation Scope

*This software is an advanced, frontend-only browser demonstration designed for stakeholder walkthroughs, sales demonstrations, and user experience evaluation. Business calculations, status transitions, and data persistence run entirely inside the client browser. In an enterprise production deployment, business rules and data authorization must be enforced by a secure backend and relational database.*

---

**PackFlow ERP © 2026 Shree Pack Industries Pvt. Ltd.**
Sanand Industrial Estate, Ahmedabad, Gujarat, India.
