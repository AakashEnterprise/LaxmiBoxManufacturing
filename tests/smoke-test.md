# PackFlow ERP — Smoke Test & QA Verification Suite

This document outlines the systematic verification test cases designed and validated for **PackFlow ERP** (Shree Pack Industries Pvt. Ltd., Ahmedabad).

---

## Environment & Prerequisites

- **Stack**: HTML5 + CSS3 + Vanilla JavaScript (ES6+). Zero Node.js, zero external NPM dependencies, zero CSS frameworks.
- **Local Server**: Run `python -m http.server 8000` or open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).

---

## Test Scenarios & Expected Results

### Test 1: Application Shell & Navigation
- **Action**: Load application at `http://localhost:8000/#/dashboard`.
- **Expected**:
  - Persistent sidebar renders with company branding: `PackFlow ERP`, `Shree Pack Ind. #1`.
  - Topbar renders with active plant `Unit 1: Sanand Estate, Ahmedabad`, Financial Year `FY 2025-26`, Global Search input, and user profile `Rajesh Patel (VP Operations)`.
  - Clicking any navigation item in sidebar switches active route and renders corresponding module view without page reloads.
  - Clicking sidebar toggle button smoothly collapses and expands the navigation rail.
  - On mobile/tablet (<1024px), hamburger button slides in navigation drawer with dark backdrop.

### Test 2: Executive Dashboard & Live Telemetry
- **Action**: Inspect `#/dashboard`.
- **Expected**:
  - 10 Enterprise KPI cards render with real-time calculated values:
    - Dispatched Value Today (₹38,45,200)
    - Monthly Net Revenue (₹4,82,60,000)
    - Plant Output Today (84.6 MT)
    - Outstanding Receivables (₹1,64,20,000)
    - Active Work Orders (4)
    - Corrugation OEE (88.4%)
    - Kraft Reel Inventory (412.5 T / ₹1.85 Cr)
    - FG Ready for Dispatch (68,400 Boxes)
    - Trim Scrap (2.14%)
    - Critical Approvals (4 Pending)
  - Live machine cards render for Line 01 (5-Ply 2200mm), Line 02 (3-Ply Line B), Flexo 4-Color, Bobst Die-Cutter, Vega Gluer, and Steam Boiler.
  - Urgent Approvals drawer displays 4 critical decisions with functioning `Approve` and `Reject` buttons.

### Test 3: Factory Floor Live & 6-Stage Kanban Board
- **Action**: Navigate to `#/factory`.
- **Expected**:
  - Live 15s pulse beacon indicates plant telemetry synchronization.
  - 6-Stage Kanban Production Workflow displays:
    1. Queued / Staged
    2. Corrugation (5P/3P)
    3. Flexo & Slotting
    4. Die-Cut & Crease
    5. Folding & Stitch
    6. QC & Bundling
  - Clicking any Kanban card opens the Job Card detail with current completion progress bar.
  - Shift downtime log streams recent micro-stops (Paper web break, ink calibration, rotary die clearing).

### Test 4: End-to-End Workflow: Customer -> Quotation -> Sales Order
- **Action**:
  1. Open `#/customers` and click `+ Add Customer`.
  2. Register customer "Cadbury Confectionery India", contact "Sunil Roy", GSTIN "24AAACC1234K1ZZ", credit limit ₹40,00,000.
  3. Navigate to `#/quotations`.
  4. Select Cadbury, box style "Universal RSC", dimensions 400 × 280 × 250 mm, 5-Ply B+C flute, quantity 20,000.
  5. Inspect live calculated unit price (e.g. ₹34.20), taxable amount, 12% GST, and profit margin %.
  6. Click "Convert to Confirmed Sales Order (SO)".
- **Expected**:
  - New sales order `SO-2026-00146` is created in state.
  - Appears in Sales Orders table `#/sales-orders` with ordered qty 20,000 and status "Queued (Deckle Allotment)".
  - Cadbury appears in customer selector across all modules.

### Test 5: Sales Orders High-Density Table & Quick Inspection Drawer
- **Action**: Open `#/sales-orders` and click row `SO-2026-00142` (Sunrise Consumer Products).
- **Expected**:
  - Right slide-out drawer opens smoothly.
  - Displays Target Spec (50,000 Pcs Universal Shipping Carton), ordered qty 50,000, dispatched 20,000, pending 30,000.
  - Displays 5-Ply Structure & Paper Recipe breakdown with colored ply indicators (180 GSM Virgin Kraft, 140 GSM Fluting B, 120 GSM Semi-Kraft, 140 GSM Fluting C, 140 GSM Inner).
  - Displays linked work order `JOB-2026-00081` at 92% completion.
  - Clicking "Order Ack (PDF)" generates clean, professional printable confirmation document with company header.

### Test 6: MRP Material Planning & Shortage Requisition
- **Action**: Open `#/mrp`.
- **Expected**:
  - Explodes bill of materials for `SO-2026-00142` (50,000 cartons).
  - Detects shortage of 5.70 MT on 140 GSM Fluting Medium.
  - Clicking "+ Generate Purchase Requisitions for Shortages" creates PO `PO-2026-0072` for 30 MT to Gujarat Kraft Paper Traders.
  - Shows success toast and updates procurement PO list.

### Test 7: Paper Reel Inventory & Deckle Slitting Trim Optimizer
- **Action**: Open `#/inventory/reels`.
- **Expected**:
  - Displays alert banner: Critical buffer breach for 120 GSM Fluting (4.20 MT vs 8.00 MT safety threshold).
  - High-density table displays 374 reels with Reel ID, Paper Grade, Mill, GSM, Burst Factor, Deckle, Weights, Moisture %, Rate ₹/kg, Value, and Bay Location.
  - Deckle Trim Waste Minimizer renders visual color-coded cut bar (Cut 1, Cut 2, Cut 3, Trim Waste 4.16% vs optimized 1750mm saving 2.74% trim).
  - Clicking "Inward Barcode Scan" or "+ Record Inward Reel (GRN)" opens weighbridge entry modal; submitting increases reel count and MT immediately.

### Test 8: Job Card Output Logging & Quality Control Clearance
- **Action**:
  1. Open `#/production/jobs` and click the `+` action on `JOB-2026-00081`.
  2. Enter Good Boxes Produced: 2,500, Scrap: 30, next stage: "QC & Bundling".
  3. Click "Record Shift Production".
  4. Finalize job batch using "Complete & Release to QC".
  5. Navigate to `#/quality`.
- **Expected**:
  - Job output advances to 100%.
  - Batch appears in Finished Goods and Quality clearance table.
  - Quality Inspector logs BS (14.6 kg/cm²) and ECT (36.5 kN/m).
  - Passing releases batch to Finished Goods dock for truck dispatch.

### Test 9: Truck Dispatch & Delivery Challan Generation
- **Action**:
  1. Open `#/dispatch` and click `+ Create Dispatch & Challan`.
  2. Select `SO-2026-00142`, enter 15,000 boxes, vehicle `GJ-01-TA-9921`, transporter `Patel Roadlines`.
  3. Submit form.
- **Expected**:
  - Delivery Challan `CH-2026-0084` generated with E-Way Bill reference.
  - SO dispatched quantity increments by 15,000, balance decreases accordingly.
  - Clicking "Print Challan" generates printable delivery challan layout.

### Test 10: GST Tax Invoice Generation & Payment Allocation
- **Action**:
  1. Open `#/finance` and click `+ Generate Tax Invoice`.
  2. Link to `SO-2026-00142`, enter taxable amount ₹7,38,000.
  3. Form dynamically calculates CGST (₹44,280), SGST (₹44,280), and Grand Total.
  4. Submit to create Invoice `INV-2026-00324`.
  5. Click `+ Record Payment`, select Sunrise Consumer Products, amount ₹5,00,000, allocate to `INV-2026-00324`.
- **Expected**:
  - Invoice status updates from Unpaid to Partially Paid with remaining balance reflected.
  - Customer outstanding balance decreases by ₹5,00,000.
  - Remittance appears in Payment Receipts table.
  - Clicking "Print" generates GST Tax Invoice (HSN 48191010).

### Test 11: Global Search & Shortcuts
- **Action**: Press `Ctrl+K` (or click search bar in topbar).
- **Expected**:
  - Global Search modal opens instantly.
  - Typing "Sunrise" matches Customer, Sales Orders, and Invoices with categorized badges.
  - Selecting any result navigates directly to that record.

### Test 12: Local Storage Persistence & Reset Demo Data
- **Action**:
  1. Refresh the browser page (`F5`).
  2. Verify that newly created records (Customer, SO, Reel, Invoice) remain intact.
  3. Navigate to `#/settings` and click "Reset Demo Data (Pristine)".
  4. Confirm reset modal.
- **Expected**:
  - State cleanly restores to the original factory seed dataset.
