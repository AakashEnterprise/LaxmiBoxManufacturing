/**
 * PackFlow ERP - Sales & CRM Module Pages
 * Customers, Box Quotation Calculator & Costing, Sales Orders (SO), and Box Specifications.
 */

window.PackFlowPages = window.PackFlowPages || {};

window.PackFlowPages.sales = {
  // ==========================================
  // CUSTOMERS & ACCOUNTS
  // ==========================================
  renderCustomers() {
    const state = window.PackFlowStore.state;
    const calc = window.PackFlowCalc;

    return `
      <div class="card" style="margin-bottom: var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <h1 class="text-headline-lg">Customers & Commercial Accounts</h1>
            <p class="text-body-md text-on-surface-variant">Master CRM registry, GST verification, credit exposure limits, and payment ledgers</p>
          </div>
          <div class="flex items-center gap-sm">
            <button class="btn btn-outline" onclick="PackFlowPages.sales.exportCustomersCSV()">
              <span class="material-symbols-outlined text-[18px]">file_download</span>
              <span>Export CSV</span>
            </button>
            <button class="btn btn-primary" onclick="PackFlowPages.sales.openNewCustomerModal()">
              <span class="material-symbols-outlined text-[18px]">add_business</span>
              <span>+ Add Customer</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Customer List Table -->
      <div class="table-wrapper">
        <div class="table-filter-bar">
          <div class="table-search-box">
            <span class="material-symbols-outlined">search</span>
            <input type="text" id="customerSearchInput" placeholder="Search by customer, city, or GSTIN..." onkeyup="PackFlowPages.sales.filterCustomersTable(this.value)">
          </div>
          <div class="flex items-center gap-sm">
            <select class="filter-select" id="customerCategoryFilter" onchange="PackFlowPages.sales.filterCustomersTable()">
              <option value="">All Categories</option>
              <option value="FMCG">FMCG</option>
              <option value="E-Commerce">E-Commerce</option>
              <option value="Processed Food">Processed Food</option>
              <option value="Dairy & Beverages">Dairy & Beverages</option>
              <option value="Pharma">Pharma</option>
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table-master" id="customersTable">
            <thead>
              <tr>
                <th>Code & Company Name</th>
                <th>Contact Person</th>
                <th>City & State</th>
                <th>GSTIN</th>
                <th>Payment Terms</th>
                <th class="text-right">Credit Limit</th>
                <th class="text-right">Outstanding</th>
                <th>Assigned Rep</th>
                <th class="text-center">Status</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${state.customers.map(c => `
                <tr onclick="location.hash='#/customers/${c.id}'" style="cursor:pointer;">
                  <td>
                    <div class="font-tabular font-bold text-primary">${c.code}</div>
                    <div class="font-bold text-on-surface">${c.name}</div>
                  </td>
                  <td>
                    <div>${c.contactPerson}</div>
                    <div class="text-body-sm text-muted">${c.phone}</div>
                  </td>
                  <td>${c.city}, ${c.state}</td>
                  <td class="font-tabular text-body-sm">${c.gstin}</td>
                  <td><span class="spec-chip">${c.paymentTerms}</span></td>
                  <td class="text-right font-tabular font-bold">${calc.formatCurrency(c.creditLimit)}</td>
                  <td class="text-right font-tabular font-bold ${c.outstandingBalance > c.creditLimit ? 'text-error' : 'text-on-surface'}">
                    ${calc.formatCurrency(c.outstandingBalance)}
                  </td>
                  <td>${c.salesPerson}</td>
                  <td class="text-center">
                    <span class="badge ${c.status === 'Active' ? 'badge-success' : 'badge-draft'}">${c.status}</span>
                  </td>
                  <td class="text-center" onclick="event.stopPropagation()">
                    <div class="row-actions">
                      <button class="row-action-btn text-primary" title="View Detail" onclick="location.hash='#/customers/${c.id}'">
                        <span class="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button class="row-action-btn text-secondary" title="New Quote" onclick="location.hash='#/quotations/new?customer=${encodeURIComponent(c.name)}'">
                        <span class="material-symbols-outlined text-[18px]">calculate</span>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  filterCustomersTable(val) {
    const input = val !== undefined ? val.toLowerCase() : (document.getElementById("customerSearchInput")?.value || "").toLowerCase();
    const cat = (document.getElementById("customerCategoryFilter")?.value || "").toLowerCase();
    const rows = document.querySelectorAll("#customersTable tbody tr");

    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      const matchText = !input || text.includes(input);
      const matchCat = !cat || text.includes(cat);
      row.style.display = matchText && matchCat ? "" : "none";
    });
  },

  exportCustomersCSV() {
    const state = window.PackFlowStore.state;
    const headers = ["ID", "Code", "Name", "Contact", "Phone", "Email", "GSTIN", "City", "Credit Limit", "Outstanding", "Status"];
    const rows = state.customers.map(c => [
      c.id, c.code, c.name, c.contactPerson, c.phone, c.email, c.gstin, c.city, c.creditLimit, c.outstandingBalance, c.status
    ]);
    window.PackFlowComponents.exportTableToCSV("PackFlow_Customers.csv", headers, rows);
  },

  openNewCustomerModal() {
    window.PackFlowComponents.openModal({
      title: "Register New Commercial Customer Account",
      size: "modal-lg",
      bodyHtml: `
        <form id="newCustomerForm" onsubmit="event.preventDefault(); PackFlowPages.sales.submitNewCustomer();">
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label required">Company / Legal Name</label>
              <input type="text" id="custName" required placeholder="e.g. Acme Pack Foods Pvt. Ltd.">
            </div>
            <div class="form-group">
              <label class="form-label required">Primary Contact Person</label>
              <input type="text" id="custContact" required placeholder="Full Name">
            </div>
          </div>
          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label required">Phone Number</label>
              <input type="tel" id="custPhone" required placeholder="+91 98...">
            </div>
            <div class="form-group">
              <label class="form-label required">Email Address</label>
              <input type="email" id="custEmail" required placeholder="purchase@company.com">
            </div>
            <div class="form-group">
              <label class="form-label required">GSTIN (15 Digits)</label>
              <input type="text" id="custGstin" required maxlength="15" placeholder="24AAAAA0000A1Z5">
            </div>
          </div>
          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label required">City</label>
              <input type="text" id="custCity" required placeholder="Ahmedabad">
            </div>
            <div class="form-group">
              <label class="form-label required">Credit Limit (₹)</label>
              <input type="number" id="custCreditLimit" required value="2000000" step="50000">
            </div>
            <div class="form-group">
              <label class="form-label required">Payment Terms</label>
              <select id="custTerms">
                <option value="Immediate / Advance">Immediate / Advance</option>
                <option value="15 Days Net" selected>15 Days Net</option>
                <option value="30 Days Net">30 Days Net</option>
                <option value="45 Days Net">45 Days Net</option>
                <option value="60 Days LC">60 Days LC</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Billing & Factory Delivery Address</label>
            <textarea id="custAddress" placeholder="Street, GIDC industrial zone, pincode..."></textarea>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-outline" onclick="PackFlowComponents.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="PackFlowPages.sales.submitNewCustomer()">
          <span class="material-symbols-outlined text-[18px]">save</span>
          <span>Save Customer Record</span>
        </button>
      `
    });
  },

  submitNewCustomer() {
    const name = document.getElementById("custName")?.value.trim();
    const contactPerson = document.getElementById("custContact")?.value.trim();
    const phone = document.getElementById("custPhone")?.value.trim();
    const email = document.getElementById("custEmail")?.value.trim();
    const gstin = document.getElementById("custGstin")?.value.trim().toUpperCase();
    const city = document.getElementById("custCity")?.value.trim();
    const creditLimit = Number(document.getElementById("custCreditLimit")?.value || 2000000);
    const paymentTerms = document.getElementById("custTerms")?.value;
    const address = document.getElementById("custAddress")?.value.trim();

    if (!name || !contactPerson || !gstin) {
      window.PackFlowComponents.showToast("Please fill in company name, contact, and GSTIN", "error");
      return;
    }

    const newCust = window.PackFlowStore.addCustomer({
      name,
      contactPerson,
      phone,
      email,
      gstin,
      city,
      state: "Gujarat",
      address,
      creditLimit,
      paymentTerms,
      salesPerson: "Sunil Mehra"
    });

    window.PackFlowComponents.closeModal();
    window.PackFlowComponents.showToast(`Customer ${newCust.name} successfully created!`, "success");
    location.hash = "#/customers";
  },

  // Customer Detail View
  renderCustomerDetail(customerId) {
    const state = window.PackFlowStore.state;
    const calc = window.PackFlowCalc;
    const cust = state.customers.find(c => c.id === customerId) || state.customers[0];

    const customerOrders = state.salesOrders.filter(so => so.customer === cust.name || so.customerId === cust.id);
    const customerInvoices = state.invoices.filter(inv => inv.customer === cust.name || inv.customerId === cust.id);

    return `
      <div class="page-breadcrumb-bar">
        <div class="breadcrumbs">
          <a href="#/customers" class="breadcrumb-item">Customers</a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-item active">${cust.name}</span>
        </div>
        <button class="btn btn-outline btn-sm" onclick="location.hash='#/customers'">
          <span class="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Customers</span>
        </button>
      </div>

      <div class="card" style="margin-bottom: var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <div class="flex items-center gap-xs">
              <h1 class="text-headline-lg">${cust.name}</h1>
              <span class="badge badge-success">${cust.status}</span>
            </div>
            <p class="text-body-md text-on-surface-variant">${cust.address} • GSTIN: <strong class="font-tabular">${cust.gstin}</strong></p>
          </div>
          <div class="flex items-center gap-sm">
            <button class="btn btn-primary" onclick="location.hash='#/quotations/new?customer=${encodeURIComponent(cust.name)}'">
              <span class="material-symbols-outlined text-[18px]">calculate</span>
              <span>Create Box Quotation</span>
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-md" style="margin-bottom: var(--space-md);">
        <div class="kpi-card">
          <div class="kpi-header">Credit Limit</div>
          <div class="kpi-value font-tabular">${calc.formatCurrency(cust.creditLimit)}</div>
          <div class="text-body-sm text-muted">Approved by CFO</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header">Outstanding Balance</div>
          <div class="kpi-value font-tabular ${cust.outstandingBalance > cust.creditLimit ? 'text-error' : 'text-on-surface'}">
            ${calc.formatCurrency(cust.outstandingBalance)}
          </div>
          <div class="text-body-sm text-muted">Ledger Due</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header">Payment Terms</div>
          <div class="kpi-value font-tabular" style="font-size:18px;">${cust.paymentTerms}</div>
          <div class="text-body-sm text-muted">Standard Policy</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header">Total Active Orders</div>
          <div class="kpi-value font-tabular">${customerOrders.length}</div>
          <div class="text-body-sm text-muted">In Shop Floor</div>
        </div>
      </div>

      <!-- Linked Orders Table -->
      <div class="card" style="margin-bottom: var(--space-md);">
        <h3 class="card-title" style="margin-bottom: var(--space-sm);">Sales Orders for this Account</h3>
        <div class="table-responsive">
          <table class="table-master">
            <thead>
              <tr>
                <th>SO Number</th>
                <th>Carton Specification</th>
                <th class="text-right">Ordered</th>
                <th class="text-right">Dispatched</th>
                <th class="text-right">Order Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${customerOrders.length === 0 ? '<tr><td colspan="6" class="text-center text-muted" style="padding:20px;">No sales orders linked to this account yet.</td></tr>' : customerOrders.map(so => `
                <tr>
                  <td><strong class="text-primary font-tabular">${so.id}</strong></td>
                  <td>${so.productName}</td>
                  <td class="text-right font-tabular">${so.orderedQty.toLocaleString()}</td>
                  <td class="text-right font-tabular text-secondary">${so.dispatchedQty.toLocaleString()}</td>
                  <td class="text-right font-tabular font-bold">${calc.formatCurrency(so.totalAmount)}</td>
                  <td><span class="badge badge-info">${so.productionStatus}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ==========================================
  // BOX QUOTATION CALCULATOR & COSTING
  // ==========================================
  renderQuotationCalculator(prefillCustomer = "") {
    const state = window.PackFlowStore.state;
    const calc = window.PackFlowCalc;

    // Default calculation
    const initialQuote = calc.calculateBoxQuote({
      length: 450,
      width: 300,
      height: 280,
      plies: 5,
      fluteType: "B+C",
      topLinerGsm: 180,
      fluting1Gsm: 140,
      middleLinerGsm: 120,
      fluting2Gsm: 140,
      innerLinerGsm: 140,
      paperPricePerKg: 42,
      conversionCostPerBox: 4.5,
      printingColors: 2,
      wastagePct: 3.0,
      marginPct: 15.0,
      quantity: 25000,
      isInterState: false
    });

    return `
      <div class="card" style="margin-bottom: var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <div class="flex items-center gap-xs">
              <span class="material-symbols-outlined text-primary text-[24px]">calculate</span>
              <h1 class="text-headline-lg">Corrugated Box Costing & Quotation Calculator</h1>
            </div>
            <p class="text-body-md text-on-surface-variant">Live algorithmic paper board area, multi-ply GSM recipe, deckle slitting, conversion overheads & margin modeling</p>
          </div>
          <div class="flex items-center gap-sm">
            <button class="btn btn-outline" onclick="location.hash='#/quotations'">
              <span class="material-symbols-outlined text-[18px]">history</span>
              <span>Quotation Register</span>
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-lg">
        <!-- LEFT 7 COLS: Costing Form Parameters -->
        <div style="grid-column: span 7 / span 7; display:flex; flex-direction:column; gap: var(--space-md);">
          <div class="card">
            <h3 class="card-title" style="margin-bottom:var(--space-md);">1. Carton Style & Inner Dimensions (mm)</h3>
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label required">Select Customer</label>
                <select id="qcCustomer" onchange="PackFlowPages.sales.recalcQuote()">
                  ${state.customers.map(c => `
                    <option value="${c.name}" ${c.name === prefillCustomer ? 'selected' : ''}>${c.name} (${c.city})</option>
                  `).join("")}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label required">Box Style Master</label>
                <select id="qcBoxStyle" onchange="PackFlowPages.sales.recalcQuote()">
                  <option value="Regular Slotted Carton (RSC)">Universal RSC (Regular Slotted Carton)</option>
                  <option value="Full Overlap (FOL)">Full Overlap Carton (FOL)</option>
                  <option value="Die-Cut Self Locking Mailer">Die-Cut Self-Locking Mailer</option>
                  <option value="Tuck Top Snap Bottom">Tuck Top Snap Bottom</option>
                </select>
              </div>
            </div>

            <div class="form-grid-3">
              <div class="form-group">
                <label class="form-label required">Length (L)</label>
                <div class="input-group">
                  <input type="number" id="qcLength" value="450" class="has-suffix" oninput="PackFlowPages.sales.recalcQuote()">
                  <span class="input-suffix">mm</span>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label required">Width (W)</label>
                <div class="input-group">
                  <input type="number" id="qcWidth" value="300" class="has-suffix" oninput="PackFlowPages.sales.recalcQuote()">
                  <span class="input-suffix">mm</span>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label required">Height (H)</label>
                <div class="input-group">
                  <input type="number" id="qcHeight" value="280" class="has-suffix" oninput="PackFlowPages.sales.recalcQuote()">
                  <span class="input-suffix">mm</span>
                </div>
              </div>
            </div>

            <h3 class="card-title" style="margin:var(--space-md) 0 var(--space-sm) 0;">2. Board Ply Construction & Paper GSMs</h3>
            <div class="form-grid-2">
              <div class="form-group">
                <label class="form-label required">Board Construction</label>
                <select id="qcPlies" onchange="PackFlowPages.sales.recalcQuote()">
                  <option value="3">3-Ply (Single Wall)</option>
                  <option value="5" selected>5-Ply (Double Wall)</option>
                  <option value="7">7-Ply (Triple Wall Heavy Duty)</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label required">Flute Type</label>
                <select id="qcFlute" onchange="PackFlowPages.sales.recalcQuote()">
                  <option value="B">B-Flute (Standard Fine)</option>
                  <option value="C">C-Flute (High Cushioning)</option>
                  <option value="E">E-Flute (Microcorrugated)</option>
                  <option value="B+C" selected>B + C Flute Combination</option>
                </select>
              </div>
            </div>

            <div class="form-grid-3">
              <div class="form-group">
                <label class="form-label">Top Liner GSM</label>
                <input type="number" id="qcGsmTop" value="180" oninput="PackFlowPages.sales.recalcQuote()">
              </div>
              <div class="form-group">
                <label class="form-label">Fluting #1 GSM</label>
                <input type="number" id="qcGsmFlute1" value="140" oninput="PackFlowPages.sales.recalcQuote()">
              </div>
              <div class="form-group">
                <label class="form-label">Middle Liner GSM</label>
                <input type="number" id="qcGsmMid" value="120" oninput="PackFlowPages.sales.recalcQuote()">
              </div>
              <div class="form-group">
                <label class="form-label">Fluting #2 GSM</label>
                <input type="number" id="qcGsmFlute2" value="140" oninput="PackFlowPages.sales.recalcQuote()">
              </div>
              <div class="form-group">
                <label class="form-label">Inner Liner GSM</label>
                <input type="number" id="qcGsmInner" value="140" oninput="PackFlowPages.sales.recalcQuote()">
              </div>
              <div class="form-group">
                <label class="form-label">Avg. Paper Rate (₹/kg)</label>
                <input type="number" id="qcPaperRate" value="42" step="0.5" oninput="PackFlowPages.sales.recalcQuote()">
              </div>
            </div>

            <h3 class="card-title" style="margin:var(--space-md) 0 var(--space-sm) 0;">3. Converting & Commercial Margins</h3>
            <div class="form-grid-4">
              <div class="form-group">
                <label class="form-label">Print Colors</label>
                <select id="qcColors" onchange="PackFlowPages.sales.recalcQuote()">
                  <option value="0">Plain / Unprinted</option>
                  <option value="1">1-Color Flexo</option>
                  <option value="2" selected>2-Color Flexo</option>
                  <option value="3">3-Color Flexo</option>
                  <option value="4">4-Color CMYK</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Waste Allowance (%)</label>
                <input type="number" id="qcWastePct" value="3.0" step="0.5" oninput="PackFlowPages.sales.recalcQuote()">
              </div>
              <div class="form-group">
                <label class="form-label">Target Margin (%)</label>
                <input type="number" id="qcMarginPct" value="15.0" step="0.5" oninput="PackFlowPages.sales.recalcQuote()">
              </div>
              <div class="form-group">
                <label class="form-label required">Order Quantity (Pcs)</label>
                <input type="number" id="qcQuantity" value="25000" step="1000" oninput="PackFlowPages.sales.recalcQuote()">
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT 5 COLS: Live Calculation Result Sheet -->
        <div style="grid-column: span 5 / span 5; display:flex; flex-direction:column; gap: var(--space-md);">
          <div class="card" style="background-color: var(--color-surface-container-low); border: 1px solid var(--color-primary-fixed-dim);">
            <div class="card-header">
              <div class="card-title-group">
                <span class="text-label-sm font-bold text-primary uppercase">ESTIMATED COMMERCIAL COSTING</span>
                <h3 class="card-title" id="resBoxTitle">5-Ply Universal RSC Carton</h3>
              </div>
              <span class="badge badge-success">Formula Validated</span>
            </div>

            <!-- Engineering Specs Breakdown -->
            <div style="background:#ffffff; padding:12px; border-radius:var(--radius-lg); border:var(--border-structural); display:flex; flex-direction:column; gap:6px; font-size:13px;">
              <div class="flex justify-between">
                <span class="text-muted">Calculated Sheet Size:</span>
                <strong class="font-tabular" id="resSheetSize">${initialQuote.sheetLengthMm} × ${initialQuote.sheetWidthMm} mm</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Board Area per Box:</span>
                <strong class="font-tabular" id="resBoardArea">${initialQuote.boardAreaSqM} m²</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Box Finished Weight:</span>
                <strong class="font-tabular text-primary" id="resWeight">${initialQuote.boxWeightKg} kg / pc</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Estimated Factory Cost:</span>
                <strong class="font-tabular" id="resFactoryCost">₹${initialQuote.factoryCostPerBox} / pc</strong>
              </div>
            </div>

            <!-- Pricing & GST Breakdown Box -->
            <div style="background:#ffffff; padding:16px; border-radius:var(--radius-lg); border:1px solid #cbd5e1; margin-top:var(--space-md); display:flex; flex-direction:column; gap:8px;">
              <div class="flex justify-between items-baseline">
                <span class="text-body-md font-bold text-on-surface">Unit Selling Price:</span>
                <span class="text-headline-lg font-tabular font-bold text-primary" id="resUnitPrice">₹${initialQuote.unitPrice.toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-body-sm">
                <span class="text-muted">Order Subtotal (Taxable):</span>
                <strong class="font-tabular" id="resSubtotal">${calc.formatCurrency(initialQuote.subtotal)}</strong>
              </div>
              <div class="flex justify-between text-body-sm">
                <span class="text-muted">GST (12% HSN 48191010):</span>
                <strong class="font-tabular" id="resTax">${calc.formatCurrency(initialQuote.totalTax)}</strong>
              </div>
              <div class="pt-2 flex justify-between items-center" style="border-top:1px solid #e2e8f0; margin-top:4px;">
                <span class="text-headline-sm font-bold">Total Order Value:</span>
                <span class="text-headline-md font-tabular font-bold text-secondary" id="resGrandTotal">${calc.formatCurrency(initialQuote.grandTotal)}</span>
              </div>
              <div class="flex justify-between text-label-sm text-secondary" style="background:var(--color-secondary-container); padding:4px 8px; border-radius:var(--radius-sm); margin-top:4px;">
                <span>Projected Gross Margin:</span>
                <strong class="font-tabular" id="resMargin">₹${Number(initialQuote.estimatedProfit).toLocaleString()} (${initialQuote.estimatedMarginPct}%)</strong>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col gap-sm" style="margin-top:var(--space-md);">
              <button class="btn btn-primary btn-lg w-full" onclick="PackFlowPages.sales.saveQuotationFromCalc()">
                <span class="material-symbols-outlined text-[20px]">save</span>
                <span>Save Official Quotation</span>
              </button>
              <button class="btn btn-secondary btn-lg w-full" onclick="PackFlowPages.sales.convertCalcToSalesOrder()">
                <span class="material-symbols-outlined text-[20px]">shopping_cart_checkout</span>
                <span>Convert to Confirmed Sales Order (SO)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  recalcQuote() {
    const calc = window.PackFlowCalc;
    const l = Number(document.getElementById("qcLength")?.value || 450);
    const w = Number(document.getElementById("qcWidth")?.value || 300);
    const h = Number(document.getElementById("qcHeight")?.value || 280);
    const plies = Number(document.getElementById("qcPlies")?.value || 5);
    const fluteType = document.getElementById("qcFlute")?.value || "B+C";
    const topGsm = Number(document.getElementById("qcGsmTop")?.value || 180);
    const f1Gsm = Number(document.getElementById("qcGsmFlute1")?.value || 140);
    const midGsm = Number(document.getElementById("qcGsmMid")?.value || 120);
    const f2Gsm = Number(document.getElementById("qcGsmFlute2")?.value || 140);
    const inGsm = Number(document.getElementById("qcGsmInner")?.value || 140);
    const paperRate = Number(document.getElementById("qcPaperRate")?.value || 42);
    const colors = Number(document.getElementById("qcColors")?.value || 2);
    const waste = Number(document.getElementById("qcWastePct")?.value || 3.0);
    const margin = Number(document.getElementById("qcMarginPct")?.value || 15.0);
    const qty = Number(document.getElementById("qcQuantity")?.value || 25000);

    const q = calc.calculateBoxQuote({
      length: l, width: w, height: h, plies, fluteType,
      topLinerGsm: topGsm, fluting1Gsm: f1Gsm, middleLinerGsm: midGsm, fluting2Gsm: f2Gsm, innerLinerGsm: inGsm,
      paperPricePerKg: paperRate, conversionCostPerBox: 4.5, printingColors: colors,
      wastagePct: waste, marginPct: margin, quantity: qty
    });

    document.getElementById("resSheetSize").textContent = `${q.sheetLengthMm} × ${q.sheetWidthMm} mm`;
    document.getElementById("resBoardArea").textContent = `${q.boardAreaSqM} m²`;
    document.getElementById("resWeight").textContent = `${q.boxWeightKg} kg / pc`;
    document.getElementById("resFactoryCost").textContent = `₹${q.factoryCostPerBox} / pc`;
    document.getElementById("resUnitPrice").textContent = `₹${q.unitPrice.toFixed(2)}`;
    document.getElementById("resSubtotal").textContent = calc.formatCurrency(q.subtotal);
    document.getElementById("resTax").textContent = calc.formatCurrency(q.totalTax);
    document.getElementById("resGrandTotal").textContent = calc.formatCurrency(q.grandTotal);
    document.getElementById("resMargin").textContent = `₹${Number(q.estimatedProfit).toLocaleString()} (${q.estimatedMarginPct}%)`;

    window._lastCalculatedQuote = q;
  },

  saveQuotationFromCalc() {
    const q = window._lastCalculatedQuote || window.PackFlowCalc.calculateBoxQuote({
      length: 450, width: 300, height: 280, quantity: 25000
    });
    const customer = document.getElementById("qcCustomer")?.value || "Sunrise Consumer Products Ltd.";
    const style = document.getElementById("qcBoxStyle")?.value || "Universal RSC";
    const l = document.getElementById("qcLength")?.value || 450;
    const w = document.getElementById("qcWidth")?.value || 300;
    const h = document.getElementById("qcHeight")?.value || 280;

    const saved = window.PackFlowStore.addQuotation({
      customer,
      productName: `${style} (${l}x${w}x${h}mm)`,
      boxDimensions: `${l} × ${w} × ${h} mm`,
      quantity: Number(document.getElementById("qcQuantity")?.value || 25000),
      unitPrice: q.unitPrice,
      subtotal: q.subtotal,
      cgst: q.cgst,
      sgst: q.sgst,
      igst: q.igst,
      totalAmount: q.grandTotal,
      estimatedCost: q.factoryCostPerBox * Number(document.getElementById("qcQuantity")?.value || 25000),
      estimatedMarginPct: Number(q.estimatedMarginPct),
      validTill: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
    });

    window.PackFlowComponents.showToast(`Quotation ${saved.id} created successfully!`, "success");
    location.hash = "#/quotations";
  },

  convertCalcToSalesOrder() {
    const customer = document.getElementById("qcCustomer")?.value || "Sunrise Consumer Products Ltd.";
    const style = document.getElementById("qcBoxStyle")?.value || "Universal RSC";
    const l = document.getElementById("qcLength")?.value || 450;
    const w = document.getElementById("qcWidth")?.value || 300;
    const h = document.getElementById("qcHeight")?.value || 280;
    const q = window._lastCalculatedQuote || window.PackFlowCalc.calculateBoxQuote({
      length: l, width: w, height: h, quantity: 25000
    });

    const newSO = window.PackFlowStore.addSalesOrder({
      customer,
      productName: `${style} (${l}x${w}x${h}mm)`,
      boxDimensions: `${l} × ${w} × ${h} mm`,
      orderedQty: Number(document.getElementById("qcQuantity")?.value || 25000),
      unitPrice: q.unitPrice,
      taxableAmount: q.subtotal,
      taxAmount: q.totalTax,
      totalAmount: q.grandTotal,
      deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      priority: "Standard",
      salesPerson: "Sunil Mehra"
    });

    window.PackFlowComponents.showToast(`Converted to Sales Order ${newSO.id}!`, "success");
    location.hash = `#/sales-orders/${newSO.id}`;
  },

  // ==========================================
  // SALES ORDERS (SO) - MAIN HUB
  // ==========================================
  renderSalesOrders() {
    const state = window.PackFlowStore.state;
    const calc = window.PackFlowCalc;

    return `
      <!-- Header with Operational Cockpit Stats -->
      <div class="flex flex-wrap items-center justify-between gap-md" style="margin-bottom:var(--space-md);">
        <div>
          <div class="flex items-center gap-xs">
            <h1 class="text-headline-lg font-bold">Sales Orders (SO)</h1>
            <span class="badge badge-draft">FY 25-26 Live</span>
            <span class="badge badge-success">
              <span class="telemetry-pulse-dot animate-pulse"></span> ERP Dispatch Synced
            </span>
          </div>
          <p class="text-body-md text-on-surface-variant">Manage customer packaging contracts, production dispatch schedules, and order fulfillment</p>
        </div>
        <div class="flex flex-wrap items-center gap-sm">
          <button class="btn btn-outline" onclick="PackFlowPages.sales.exportSalesOrdersCSV()">
            <span class="material-symbols-outlined text-[18px]">file_download</span>
            <span>Export Orders (Excel)</span>
          </button>
          <button class="btn btn-primary" onclick="location.hash='#/quotations/new'">
            <span class="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            <span>+ Create Sales Order (SO)</span>
          </button>
        </div>
      </div>

      <!-- Live Telemetry Banner (4 Micro KPI Cards) -->
      <div class="grid grid-cols-4 gap-md" style="margin-bottom:var(--space-md);">
        <div class="kpi-card">
          <div class="kpi-header">
            <span>ACTIVE BACKLOG</span>
            <span class="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
          </div>
          <div class="kpi-value font-tabular">382,400 <span style="font-size:14px; font-weight:normal;">Cartons</span></div>
          <div class="text-body-sm text-secondary font-bold">▲ 14% vs last week</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span>OPEN VALUE IN PLANT</span>
            <span class="material-symbols-outlined text-secondary text-[20px]">currency_rupee</span>
          </div>
          <div class="kpi-value font-tabular">₹1.48 Cr <span style="font-size:14px; font-weight:normal;">Ex-Works</span></div>
          <div class="text-body-sm text-on-surface-variant">34 Work Orders Linked</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span>DISPATCH SCHEDULE TODAY</span>
            <span class="material-symbols-outlined text-tertiary text-[20px]">local_shipping</span>
          </div>
          <div class="kpi-value font-tabular">42,500 <span style="font-size:14px; font-weight:normal;">Pcs</span></div>
          <div class="text-body-sm text-primary font-bold">6 Trucks Scheduled</div>
        </div>

        <div class="kpi-card" style="border-left: 4px solid var(--color-error);">
          <div class="kpi-header" style="color:var(--color-error);">
            <span>PAYMENT ALERT (HOLD)</span>
            <span class="badge badge-error">₹18.9 L</span>
          </div>
          <div class="kpi-value font-tabular text-error">2 Orders</div>
          <div class="text-body-sm text-error">Requires CFO Override</div>
        </div>
      </div>

      <!-- Status Filter Tabs Strip -->
      <div class="tabs-header" style="margin-bottom:var(--space-sm);">
        <button class="tab-item active" onclick="PackFlowPages.sales.filterSOByTab('All')">
          All Orders (${state.salesOrders.length})
        </button>
        <button class="tab-item" onclick="PackFlowPages.sales.filterSOByTab('Production')">
          Approved for Production <span class="tab-count">28</span>
        </button>
        <button class="tab-item" onclick="PackFlowPages.sales.filterSOByTab('In Production')">
          In Production <span class="tab-count">34</span>
        </button>
        <button class="tab-item" onclick="PackFlowPages.sales.filterSOByTab('Dispatched')">
          Partially Dispatched <span class="tab-count">16</span>
        </button>
      </div>

      <!-- Filter Bar Card -->
      <div class="table-filter-bar">
        <div class="table-search-box">
          <span class="material-symbols-outlined">search</span>
          <input type="text" id="soSearchInput" placeholder="Search SO#, Customer, GSTIN, Box Size (mm)..." onkeyup="PackFlowPages.sales.filterSOTable(this.value)">
        </div>
        <div class="flex items-center gap-sm">
          <select class="filter-select" id="soPriorityFilter" onchange="PackFlowPages.sales.filterSOTable()">
            <option value="">Priority: All</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Standard">Standard</option>
          </select>
          <button class="btn btn-outline btn-sm" onclick="PackFlowPages.sales.renderSalesOrders()">
            <span class="material-symbols-outlined text-[16px]">refresh</span>
          </button>
        </div>
      </div>

      <!-- Main High-Density Orders Table -->
      <div class="table-wrapper">
        <div class="table-responsive">
          <table class="table-master" id="salesOrdersTable">
            <thead>
              <tr>
                <th style="width:36px; text-align:center;"><input type="checkbox"></th>
                <th>SO Number & Date</th>
                <th>Customer & GSTIN</th>
                <th>Box Specification & Dimensions</th>
                <th class="text-right">Ordered Qty</th>
                <th>Production Status</th>
                <th class="text-right">Dispatched</th>
                <th class="text-right">Balance</th>
                <th class="text-right">Order Value</th>
                <th>Payment & Credit</th>
                <th>Promised Dispatch</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${state.salesOrders.map(so => {
                const prodPct = so.orderedQty ? Math.min(100, Math.round((so.producedQty / so.orderedQty) * 100)) : 0;
                return `
                  <tr onclick="PackFlowPages.sales.openSODrawer('${so.id}')" style="cursor:pointer;">
                    <td onclick="event.stopPropagation();" style="text-align:center;">
                      <input type="checkbox">
                    </td>
                    <td>
                      <div class="flex items-center gap-xs">
                        <span class="text-primary font-bold font-tabular">${so.id}</span>
                        ${so.priority === 'Urgent' ? '<span class="badge badge-error">URGENT</span>' : ''}
                      </div>
                      <div class="text-body-sm text-muted">${calc.formatDate(so.date)}</div>
                    </td>
                    <td>
                      <div class="font-bold text-on-surface">${so.customer}</div>
                      <div class="text-body-sm text-muted font-tabular">${so.customerPo || 'PO-Direct'}</div>
                    </td>
                    <td style="max-width:280px;">
                      <div class="font-medium text-on-surface truncate">${so.productName}</div>
                      <div class="flex gap-xs" style="margin-top:2px;">
                        <span class="spec-chip">${so.boxDimensions}</span>
                        <span class="spec-chip">B+C Flute</span>
                      </div>
                    </td>
                    <td class="text-right font-tabular font-bold">${so.orderedQty.toLocaleString()} Pcs</td>
                    <td style="min-width:160px;">
                      <div class="flex justify-between text-label-sm" style="margin-bottom:2px;">
                        <span class="badge ${prodPct >= 100 ? 'badge-success' : 'badge-warning'}">${so.productionStatus}</span>
                        <span class="font-tabular font-bold">${prodPct}%</span>
                      </div>
                      <div class="kpi-progress" style="margin:0;">
                        <div class="kpi-progress-bar" style="width:${prodPct}%; background-color:var(--color-primary);"></div>
                      </div>
                      <div class="font-tabular text-body-sm text-muted" style="margin-top:2px;">${so.producedQty.toLocaleString()} produced</div>
                    </td>
                    <td class="text-right font-tabular text-secondary font-bold">${so.dispatchedQty.toLocaleString()} Pcs</td>
                    <td class="text-right font-tabular text-error font-bold">${so.balanceQty.toLocaleString()} Pcs</td>
                    <td class="text-right">
                      <div class="font-tabular font-bold">${calc.formatCurrency(so.totalAmount)}</div>
                      <div class="text-body-sm text-muted">@ ₹${Number(so.unitPrice).toFixed(2)}/pc</div>
                    </td>
                    <td>
                      <span class="badge ${so.paymentStatus.includes('Credit Hold') ? 'badge-error' : (so.paymentStatus.includes('Advance') ? 'badge-success' : 'badge-info')}">
                        ${so.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <div class="font-tabular font-bold">${calc.formatDate(so.deliveryDate)}</div>
                    </td>
                    <td class="text-center" onclick="event.stopPropagation()">
                      <div class="row-actions">
                        <button class="row-action-btn text-primary" title="Quick Drawer Inspect" onclick="PackFlowPages.sales.openSODrawer('${so.id}')">
                          <span class="material-symbols-outlined text-[18px]">visibility</span>
                        </button>
                        <button class="row-action-btn text-secondary" title="Dispatch Action" onclick="location.hash='#/dispatch/new?so=${so.id}'">
                          <span class="material-symbols-outlined text-[18px]">local_shipping</span>
                        </button>
                        <button class="row-action-btn text-outline" title="Print Invoice" onclick="location.hash='#/finance/invoices/new?so=${so.id}'">
                          <span class="material-symbols-outlined text-[18px]">receipt</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>

        <div class="table-pagination">
          <div>
            Showing <strong class="text-on-surface">1 - ${state.salesOrders.length}</strong> of <strong class="text-on-surface">${state.salesOrders.length}</strong> Orders
          </div>
          <div class="pagination-controls">
            <button class="pagination-btn" disabled><span class="material-symbols-outlined text-[16px]">chevron_left</span></button>
            <button class="pagination-btn active">1</button>
            <button class="pagination-btn" disabled><span class="material-symbols-outlined text-[16px]">chevron_right</span></button>
          </div>
        </div>
      </div>
    `;
  },

  filterSOTable(val) {
    const input = val !== undefined ? val.toLowerCase() : (document.getElementById("soSearchInput")?.value || "").toLowerCase();
    const priority = (document.getElementById("soPriorityFilter")?.value || "").toLowerCase();
    const rows = document.querySelectorAll("#salesOrdersTable tbody tr");

    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      const matchText = !input || text.includes(input);
      const matchPri = !priority || text.includes(priority);
      row.style.display = matchText && matchPri ? "" : "none";
    });
  },

  exportSalesOrdersCSV() {
    const state = window.PackFlowStore.state;
    const headers = ["SO Number", "Date", "Customer", "Product", "Ordered Qty", "Produced Qty", "Dispatched Qty", "Balance Qty", "Unit Price", "Total Amount", "Status"];
    const rows = state.salesOrders.map(so => [
      so.id, so.date, so.customer, so.productName, so.orderedQty, so.producedQty, so.dispatchedQty, so.balanceQty, so.unitPrice, so.totalAmount, so.productionStatus
    ]);
    window.PackFlowComponents.exportTableToCSV("PackFlow_Sales_Orders.csv", headers, rows);
  },

  // Slide-out Drawer for Sales Order Detail Inspection
  openSODrawer(soId) {
    const state = window.PackFlowStore.state;
    const calc = window.PackFlowCalc;
    const so = state.salesOrders.find(s => s.id === soId) || state.salesOrders[0];

    const linkedJobs = state.jobs.filter(j => j.salesOrderId === so.id);

    window.PackFlowComponents.openDrawer({
      title: `
        <div class="flex items-center gap-xs">
          <span class="material-symbols-outlined text-primary text-[22px]">assignment</span>
          <div>
            <div class="flex items-center gap-xs">
              <strong class="text-headline-sm font-tabular">${so.id}</strong>
              <span class="badge ${so.priority === 'Urgent' ? 'badge-error' : 'badge-draft'}">${so.priority}</span>
            </div>
            <span class="text-body-sm text-on-surface-variant">${so.customer}</span>
          </div>
        </div>
      `,
      bodyHtml: `
        <!-- Target Summary Box -->
        <div style="background-color:var(--color-surface-container-low); padding:var(--space-md); border-radius:var(--radius-xl); border:1px solid #cbd5e1;">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-label-sm text-muted uppercase">TARGET SPECIFICATION</span>
              <h4 class="text-headline-sm font-bold text-on-surface" style="margin-top:2px;">${so.productName}</h4>
              <p class="text-body-sm text-muted">Dimensions: ${so.boxDimensions} • Die No: D-4402</p>
            </div>
            <span class="badge badge-success">Active in Shop Floor</span>
          </div>

          <div class="grid grid-cols-3 gap-xs text-center" style="margin-top:var(--space-md);">
            <div style="background:#ffffff; padding:8px; border-radius:var(--radius-md); border:1px solid #e2e8f0;">
              <span class="text-body-sm text-muted block">Order Qty</span>
              <strong class="font-tabular text-body-lg text-on-surface">${so.orderedQty.toLocaleString()}</strong>
            </div>
            <div style="background:#ffffff; padding:8px; border-radius:var(--radius-md); border:1px solid #e2e8f0;">
              <span class="text-body-sm text-muted block">Dispatched</span>
              <strong class="font-tabular text-body-lg text-secondary">${so.dispatchedQty.toLocaleString()}</strong>
            </div>
            <div style="background:#ffffff; padding:8px; border-radius:var(--radius-md); border:1px solid #e2e8f0;">
              <span class="text-body-sm text-muted block">Pending</span>
              <strong class="font-tabular text-body-lg text-error">${so.balanceQty.toLocaleString()}</strong>
            </div>
          </div>
        </div>

        <!-- Multi-Ply Construction Blueprint -->
        <div>
          <div class="flex justify-between items-center" style="margin-bottom:var(--space-xs);">
            <h5 class="text-label-md font-bold text-on-surface uppercase flex items-center gap-xs">
              <span class="material-symbols-outlined text-primary text-[18px]">layers</span>
              5-Ply Structure & Paper Recipe
            </h5>
            <span class="text-label-sm text-muted">BS: 14.5 kg/cm² • ECT: 36</span>
          </div>

          <div style="background:var(--color-surface-container-low); padding:var(--space-md); border-radius:var(--radius-xl); display:flex; flex-direction:column; gap:6px;">
            <div style="background:#ffffff; padding:8px 12px; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
              <div class="flex items-center gap-xs">
                <span class="telemetry-pulse-dot" style="background:var(--color-primary);"></span>
                <strong>Top Liner (Ply 1)</strong>
              </div>
              <span class="font-tabular text-body-sm">180 GSM Virgin Kraft (Reel #R-8921)</span>
            </div>
            <div style="background:#ffffff; padding:8px 12px; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
              <div class="flex items-center gap-xs">
                <span class="telemetry-pulse-dot" style="background:var(--color-warning);"></span>
                <strong>Fluting 1 (Ply 2)</strong>
              </div>
              <span class="font-tabular text-body-sm">140 GSM Fluting (B-Flute, Take-up 1.34)</span>
            </div>
            <div style="background:#ffffff; padding:8px 12px; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
              <div class="flex items-center gap-xs">
                <span class="telemetry-pulse-dot" style="background:var(--color-tertiary);"></span>
                <strong>Middle Liner (Ply 3)</strong>
              </div>
              <span class="font-tabular text-body-sm">120 GSM Semi-Kraft</span>
            </div>
            <div style="background:#ffffff; padding:8px 12px; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
              <div class="flex items-center gap-xs">
                <span class="telemetry-pulse-dot" style="background:var(--color-warning);"></span>
                <strong>Fluting 2 (Ply 4)</strong>
              </div>
              <span class="font-tabular text-body-sm">140 GSM Fluting (C-Flute, Take-up 1.42)</span>
            </div>
            <div style="background:#ffffff; padding:8px 12px; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
              <div class="flex items-center gap-xs">
                <span class="telemetry-pulse-dot" style="background:var(--color-primary);"></span>
                <strong>Inner Liner (Ply 5)</strong>
              </div>
              <span class="font-tabular text-body-sm">140 GSM Natural Kraft</span>
            </div>
          </div>
        </div>

        <!-- Linked Job Cards -->
        <div>
          <h5 class="text-label-md font-bold text-on-surface uppercase flex items-center gap-xs" style="margin-bottom:var(--space-xs);">
            <span class="material-symbols-outlined text-secondary text-[18px]">precision_manufacturing</span>
            Shop Floor Batches (${linkedJobs.length} Work Orders)
          </h5>
          <div class="flex flex-col gap-sm">
            ${linkedJobs.map(job => `
              <div style="background:#ffffff; padding:var(--space-md); border-radius:var(--radius-lg); border:1px solid #e2e8f0;">
                <div class="flex justify-between items-center" style="margin-bottom:4px;">
                  <strong class="text-primary font-tabular">${job.id}</strong>
                  <span class="badge badge-success">${job.completionPct}% Completed</span>
                </div>
                <div class="kpi-progress"><div class="kpi-progress-bar" style="width:${job.completionPct}%; background-color:var(--color-secondary);"></div></div>
                <div class="flex justify-between text-body-sm text-muted" style="margin-top:4px;">
                  <span>Stage: ${job.currentStage}</span>
                  <span>Supervisor: ${job.supervisor}</span>
                </div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Commercial Tax Ledger -->
        <div>
          <h5 class="text-label-md font-bold text-on-surface uppercase flex items-center gap-xs" style="margin-bottom:var(--space-xs);">
            <span class="material-symbols-outlined text-muted text-[18px]">receipt_long</span>
            Tax & Commercial Ledger
          </h5>
          <div style="background:var(--color-surface-container-low); padding:var(--space-md); border-radius:var(--radius-xl); display:flex; flex-direction:column; gap:6px; font-size:13px;">
            <div class="flex justify-between">
              <span>Taxable Subtotal (${so.orderedQty.toLocaleString()} @ ₹${Number(so.unitPrice).toFixed(2)})</span>
              <strong class="font-tabular">${calc.formatCurrency(so.taxableAmount)}</strong>
            </div>
            <div class="flex justify-between text-body-sm text-muted">
              <span>CGST (6.0%) + SGST (6.0%)</span>
              <strong class="font-tabular">${calc.formatCurrency(so.taxAmount)}</strong>
            </div>
            <div class="flex justify-between text-headline-sm font-bold pt-2" style="border-top:1px solid #cbd5e1; margin-top:4px;">
              <span>Total Order Value (Incl. GST)</span>
              <span class="font-tabular text-primary">${calc.formatCurrency(so.totalAmount)}</span>
            </div>
            ${so.advanceReceived ? `
              <div class="flex justify-between text-body-sm text-secondary" style="background:#ffffff; padding:4px 8px; border-radius:var(--radius-sm); margin-top:4px;">
                <span>Advance Received in Ledger</span>
                <strong class="font-tabular">(-) ${calc.formatCurrency(so.advanceReceived)}</strong>
              </div>
            ` : ''}
          </div>
        </div>
      `,
      footerHtml: `
        <button class="btn btn-primary btn-lg w-full" onclick="PackFlowPages.sales.releaseBatchRelease('${so.id}')">
          <span class="material-symbols-outlined text-[18px]">verified</span>
          <span>Approve Production Run Release</span>
        </button>
        <div class="grid grid-cols-2 gap-sm" style="margin-top:var(--space-xs);">
          <button class="btn btn-outline" onclick="PackFlowPages.sales.printOrderAck('${so.id}')">
            <span class="material-symbols-outlined text-[18px]">print</span>
            <span>Order Ack (PDF)</span>
          </button>
          <button class="btn btn-secondary" onclick="PackFlowComponents.showToast('Order update sent to client WhatsApp', 'info')">
            <span class="material-symbols-outlined text-[18px]">send</span>
            <span>WhatsApp Dispatch Alert</span>
          </button>
        </div>
      `
    });
  },

  releaseBatchRelease(soId) {
    const so = window.PackFlowStore.state.salesOrders.find(s => s.id === soId);
    if (so) {
      so.productionStatus = "Released to Shop Floor";
      window.PackFlowStore.saveState();
      window.PackFlowComponents.showToast(`Batch released for ${so.id}`, "success");
      window.PackFlowComponents.closeDrawer();
    }
  },

  printOrderAck(soId) {
    const so = window.PackFlowStore.state.salesOrders.find(s => s.id === soId);
    if (!so) return;
    const calc = window.PackFlowCalc;

    const html = `
      <div class="print-header">
        <div>
          <h2 class="print-company-name">SHREE PACK INDUSTRIES PVT. LTD.</h2>
          <p>Sanand Industrial Estate, Ahmedabad, Gujarat - 382110</p>
          <p>GSTIN: 24AABCS4921K1ZN | CIN: U21020GJ2015PTC082914</p>
        </div>
        <div style="text-align:right;">
          <h2 style="font-size:16pt; color:#004ac6;">SALES ORDER CONFIRMATION</h2>
          <p><strong>SO NO:</strong> ${so.id}</p>
          <p><strong>DATE:</strong> ${calc.formatDate(so.date)}</p>
          <p><strong>PO REF:</strong> ${so.customerPo || 'PO-Direct'}</p>
        </div>
      </div>

      <table class="print-meta-table">
        <tr>
          <td style="width:50%;">
            <strong>CUSTOMER BILL TO / SHIP TO:</strong><br>
            ${so.customer}<br>
            Promised Delivery: <strong>${calc.formatDate(so.deliveryDate)}</strong>
          </td>
          <td style="width:50%;">
            <strong>COMMERCIAL TERMS:</strong><br>
            Payment Terms: ${so.paymentStatus}<br>
            Sales Representative: ${so.salesPerson}
          </td>
        </tr>
      </table>

      <table class="print-items-table">
        <thead>
          <tr>
            <th>Item & Specification</th>
            <th>Dimensions (mm)</th>
            <th style="text-align:right;">Ordered Qty</th>
            <th style="text-align:right;">Rate (₹/pc)</th>
            <th style="text-align:right;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${so.productName}</strong><br>
              5-Ply B+C Flute Double Wall Carton
            </td>
            <td>${so.boxDimensions}</td>
            <td style="text-align:right;">${so.orderedQty.toLocaleString()} Pcs</td>
            <td style="text-align:right;">₹${Number(so.unitPrice).toFixed(2)}</td>
            <td style="text-align:right;">${calc.formatCurrency(so.taxableAmount)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" style="text-align:right; font-weight:bold;">Taxable Subtotal:</td>
            <td style="text-align:right;">${calc.formatCurrency(so.taxableAmount)}</td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:right; font-weight:bold;">GST (12%):</td>
            <td style="text-align:right;">${calc.formatCurrency(so.taxAmount)}</td>
          </tr>
          <tr>
            <td colspan="4" style="text-align:right; font-weight:bold; font-size:12pt;">Total Order Value:</td>
            <td style="text-align:right; font-weight:bold; font-size:12pt;">${calc.formatCurrency(so.totalAmount)}</td>
          </tr>
        </tfoot>
      </table>

      <div class="print-signatures">
        <div class="print-signature-box">Prepared By (Sales)</div>
        <div class="print-signature-box">Approved By (Operations)</div>
        <div class="print-signature-box">Customer Acceptance</div>
      </div>
    `;

    window.PackFlowComponents.openPrintView(`Order_${so.id}`, html);
  },

  // ==========================================
  // BOX SPECIFICATIONS MASTER
  // ==========================================
  renderBoxSpecifications() {
    const state = window.PackFlowStore.state;

    return `
      <div class="card" style="margin-bottom: var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <h1 class="text-headline-lg">Box Specification Master & Technical Catalog</h1>
            <p class="text-body-md text-on-surface-variant">Standardized CAD designs, FEFCO box codes, flute parameters, and burst strength specifications</p>
          </div>
          <div class="flex items-center gap-sm">
            <button class="btn btn-primary" onclick="location.hash='#/quotations/new'">
              <span class="material-symbols-outlined text-[18px]">calculate</span>
              <span>Calculate Custom Spec</span>
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-md">
        ${state.products.map(p => `
          <div class="card">
            <div class="card-header">
              <span class="spec-chip">${p.sku}</span>
              <span class="badge badge-draft">${p.category}</span>
            </div>
            <h3 class="card-title">${p.name}</h3>
            <p class="text-body-sm text-muted" style="margin:2px 0 10px 0;">Style: ${p.boxStyle}</p>

            <!-- Dimensioned Box Diagram representation in SVG -->
            <div style="background:var(--color-surface-container-low); padding:16px; border-radius:var(--radius-lg); display:flex; justify-content:center; align-items:center; height:120px; border:1px solid #e2e8f0; margin-bottom:12px;">
              <svg width="140" height="90" viewBox="0 0 140 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Isometric Corrugated Box Wireframe -->
                <polygon points="20,35 70,10 120,35 70,60" fill="#e5eeff" stroke="#2563eb" stroke-width="1.5" />
                <polygon points="20,35 70,60 70,85 20,60" fill="#cbd5e1" stroke="#004ac6" stroke-width="1.5" />
                <polygon points="70,60 120,35 120,60 70,85" fill="#94a3b8" stroke="#004ac6" stroke-width="1.5" />
                <line x1="20" y1="35" x2="20" y2="60" stroke="#004ac6" stroke-width="1.5" />
                <line x1="120" y1="35" x2="120" y2="60" stroke="#004ac6" stroke-width="1.5" />
                <!-- Dimension arrows -->
                <text x="70" y="8" font-size="8" font-family="Inter" fill="#64748b" text-anchor="middle">L: ${p.length} mm</text>
                <text x="12" y="50" font-size="8" font-family="Inter" fill="#64748b" text-anchor="middle">H: ${p.height}</text>
                <text x="128" y="50" font-size="8" font-family="Inter" fill="#64748b" text-anchor="middle">W: ${p.width}</text>
              </svg>
            </div>

            <div style="display:flex; flex-direction:column; gap:4px; font-size:12px; margin-bottom:12px;">
              <div class="flex justify-between"><span class="text-muted">Flute Construction:</span><strong>${p.flute} (${p.plies}-Ply)</strong></div>
              <div class="flex justify-between"><span class="text-muted">GSM Recipe:</span><span class="font-tabular font-bold">${p.gsmRecipe}</span></div>
              <div class="flex justify-between"><span class="text-muted">Bursting Strength:</span><span class="text-secondary font-bold">${p.burstStrength}</span></div>
              <div class="flex justify-between"><span class="text-muted">Edge Crush (ECT):</span><strong class="font-tabular">${p.ect}</strong></div>
              <div class="flex justify-between"><span class="text-muted">Avg Unit Weight:</span><span class="font-tabular">${p.weightKg} kg</span></div>
            </div>

            <div class="card-footer">
              <span class="text-headline-sm font-tabular font-bold text-primary">₹${p.standardRate.toFixed(2)}</span>
              <button class="btn btn-outline btn-sm" onclick="location.hash='#/quotations/new'">Quote This Box</button>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }
};
