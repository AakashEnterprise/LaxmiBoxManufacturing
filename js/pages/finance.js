/**
 * PackFlow ERP - Finance & Profitability Module Pages
 * Invoices & GST Breakup, Payment Receipts, Accounts Receivable Ageing, and P&L.
 */

window.PackFlowPages = window.PackFlowPages || {};

window.PackFlowPages.finance = {
  // ==========================================
  // FINANCE & ACCOUNTS DASHBOARD
  // ==========================================
  renderFinanceDashboard() {
    const state = window.PackFlowStore.state;
    const calc = window.PackFlowCalc;

    const totalReceivables = state.customers.reduce((acc, c) => acc + (c.outstandingBalance || 0), 0);
    const totalPayables = state.suppliers.reduce((acc, s) => acc + (s.outstandingBalance || 0), 0);

    return `
      <div class="card" style="margin-bottom: var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <div class="flex items-center gap-xs">
              <span class="material-symbols-outlined text-primary text-[24px]">account_balance</span>
              <h1 class="text-headline-lg font-bold">Finance, Tax & Profitability Cockpit</h1>
            </div>
            <p class="text-body-md text-on-surface-variant">GST billing, cash flow, credit risk exposure, and order variance profitability</p>
          </div>
          <div class="flex items-center gap-sm">
            <button class="btn btn-outline" onclick="PackFlowPages.finance.exportInvoicesCSV()">
              <span class="material-symbols-outlined text-[18px]">file_download</span>
              <span>Export Invoices</span>
            </button>
            <button class="btn btn-primary" onclick="PackFlowPages.finance.openNewInvoiceModal()">
              <span class="material-symbols-outlined text-[18px]">receipt</span>
              <span>+ Generate Tax Invoice</span>
            </button>
            <button class="btn btn-secondary" onclick="PackFlowPages.finance.openNewPaymentModal()">
              <span class="material-symbols-outlined text-[18px]">payments</span>
              <span>+ Record Payment</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Financial KPI Cards -->
      <div class="grid grid-cols-4 gap-md" style="margin-bottom:var(--space-md);">
        <div class="kpi-card">
          <div class="kpi-header">Outstanding Receivables</div>
          <div class="kpi-value font-tabular text-primary">${calc.formatCurrency(totalReceivables)}</div>
          <div class="kpi-subtext">Across ${state.customers.length} commercial accounts</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">Outstanding Payables</div>
          <div class="kpi-value font-tabular text-warning">${calc.formatCurrency(totalPayables)}</div>
          <div class="kpi-subtext">Paper mills & chemicals</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">Bank Balance (HDFC / SBI)</div>
          <div class="kpi-value font-tabular text-secondary">₹74,20,500</div>
          <div class="kpi-subtext">Operating liquidity nominal</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">GST Output Liability (12%)</div>
          <div class="kpi-value font-tabular">₹21,45,000</div>
          <div class="kpi-subtext">Net after ITC: ₹6.80 L</div>
        </div>
      </div>

      <!-- Invoices and Payments Split Strip -->
      <div class="grid grid-cols-12 gap-lg" style="margin-bottom:var(--space-md);">
        <!-- Invoices List (7 cols) -->
        <div style="grid-column: span 7 / span 7;">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Customer Tax Invoices (GST)</h3>
              <a href="#/finance/invoices" class="text-primary font-bold text-body-sm" style="text-decoration:none;">View All Invoices →</a>
            </div>
            <div class="table-responsive">
              <table class="table-master">
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Customer</th>
                    <th class="text-right">Total (Incl GST)</th>
                    <th class="text-right">Balance</th>
                    <th class="text-center">Status</th>
                    <th class="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.invoices.map(inv => `
                    <tr>
                      <td><strong class="text-primary font-tabular">${inv.id}</strong></td>
                      <td>${inv.customer}</td>
                      <td class="text-right font-tabular font-bold">${calc.formatCurrency(inv.totalAmount)}</td>
                      <td class="text-right font-tabular font-bold ${inv.outstandingAmount > 0 ? 'text-error' : 'text-secondary'}">
                        ${calc.formatCurrency(inv.outstandingAmount)}
                      </td>
                      <td class="text-center">
                        <span class="badge ${inv.status === 'Paid' ? 'badge-success' : (inv.status === 'Partially Paid' ? 'badge-info' : 'badge-warning')}">
                          ${inv.status}
                        </span>
                      </td>
                      <td class="text-center">
                        <button class="btn btn-outline btn-sm" onclick="PackFlowPages.finance.printInvoice('${inv.id}')">
                          Print
                        </button>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Recent Customer Payments (5 cols) -->
        <div style="grid-column: span 5 / span 5;">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Recent Payment Receipts</h3>
              <button class="btn btn-secondary btn-sm" onclick="PackFlowPages.finance.openNewPaymentModal()">+ Record</button>
            </div>
            <div class="flex flex-col gap-sm">
              ${state.payments.map(p => `
                <div style="background:var(--color-surface-container-low); padding:10px; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <strong class="text-on-surface">${p.customer}</strong>
                    <div class="text-body-sm text-muted">${p.mode} • Ref: ${p.refNo}</div>
                    <div class="text-label-sm text-secondary font-bold font-tabular">Allocated: ${p.allocatedToInvoice || 'Ledger'}</div>
                  </div>
                  <div class="text-right">
                    <span class="font-tabular font-bold text-secondary text-body-lg">${calc.formatCurrency(p.amount)}</span>
                    <div class="text-body-sm text-muted">${calc.formatDate(p.date)}</div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </div>

      <!-- Receivables Ageing Table -->
      <div class="card">
        <h3 class="card-title" style="margin-bottom:var(--space-md);">Customer Credit Exposure & Aging Ledger</h3>
        <div class="table-responsive">
          <table class="table-master">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th class="text-right">Credit Limit</th>
                <th class="text-right">Current (0-30 Days)</th>
                <th class="text-right">Due (31-45 Days)</th>
                <th class="text-right">Overdue (&gt;45 Days)</th>
                <th class="text-right">Total Outstanding</th>
                <th class="text-center">Credit Risk</th>
              </tr>
            </thead>
            <tbody>
              ${state.customers.map(c => {
                const isOver = c.outstandingBalance > c.creditLimit;
                return `
                  <tr>
                    <td><strong>${c.name}</strong><br><span class="text-body-sm text-muted">${c.city}</span></td>
                    <td class="text-right font-tabular">${calc.formatCurrency(c.creditLimit)}</td>
                    <td class="text-right font-tabular text-secondary font-bold">${calc.formatCurrency(c.outstandingBalance * 0.7)}</td>
                    <td class="text-right font-tabular text-warning font-bold">${calc.formatCurrency(c.outstandingBalance * 0.2)}</td>
                    <td class="text-right font-tabular text-error font-bold">${calc.formatCurrency(c.outstandingBalance * 0.1)}</td>
                    <td class="text-right font-tabular font-bold ${isOver ? 'text-error' : 'text-on-surface'}">
                      ${calc.formatCurrency(c.outstandingBalance)}
                    </td>
                    <td class="text-center">
                      <span class="badge ${isOver ? 'badge-error' : 'badge-success'}">
                        ${isOver ? 'Limit Exceeded' : 'Safe'}
                      </span>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  openNewInvoiceModal(prefillSoId = "") {
    const state = window.PackFlowStore.state;

    window.PackFlowComponents.openModal({
      title: "Generate GST Tax Invoice",
      size: "modal-lg",
      bodyHtml: `
        <form id="newInvoiceForm">
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label required">Select Sales Order / Delivery</label>
              <select id="invSoSelect" onchange="PackFlowPages.finance.onSoChange(this.value)">
                ${state.salesOrders.map(so => `
                  <option value="${so.id}" ${so.id === prefillSoId ? 'selected' : ''}>
                    ${so.id} • ${so.customer} (${so.orderedQty.toLocaleString()} Pcs)
                  </option>
                `).join("")}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label required">Billing Amount (Taxable ₹)</label>
              <input type="number" id="invTaxable" value="1845000" oninput="PackFlowPages.finance.recalcInvoiceTaxes()">
            </div>
          </div>
          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label">CGST (6.0%)</label>
              <input type="number" id="invCgst" value="110700" readonly style="background:var(--color-surface-container-low);">
            </div>
            <div class="form-group">
              <label class="form-label">SGST (6.0%)</label>
              <input type="number" id="invSgst" value="110700" readonly style="background:var(--color-surface-container-low);">
            </div>
            <div class="form-group">
              <label class="form-label">Freight Charges (₹)</label>
              <input type="number" id="invFreight" value="15000" oninput="PackFlowPages.finance.recalcInvoiceTaxes()">
            </div>
          </div>
          <div class="flex justify-between items-center p-md" style="background:var(--color-surface-container); border-radius:var(--radius-lg); margin-top:var(--space-sm);">
            <strong class="text-body-lg">Total Invoice Value (Incl. 12% GST):</strong>
            <strong class="text-headline-md font-tabular text-primary" id="invGrandTotal">₹20,81,400.00</strong>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-outline" onclick="PackFlowComponents.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="PackFlowPages.finance.submitNewInvoice()">
          <span class="material-symbols-outlined text-[18px]">receipt</span>
          <span>Generate Tax Invoice</span>
        </button>
      `
    });
  },

  recalcInvoiceTaxes() {
    const taxable = Number(document.getElementById("invTaxable")?.value || 0);
    const freight = Number(document.getElementById("invFreight")?.value || 0);
    const cgst = Math.round(taxable * 0.06);
    const sgst = Math.round(taxable * 0.06);
    const grand = taxable + cgst + sgst + freight;

    if (document.getElementById("invCgst")) document.getElementById("invCgst").value = cgst;
    if (document.getElementById("invSgst")) document.getElementById("invSgst").value = sgst;
    if (document.getElementById("invGrandTotal")) document.getElementById("invGrandTotal").textContent = window.PackFlowCalc.formatCurrency(grand, true);
  },

  submitNewInvoice() {
    const soId = document.getElementById("invSoSelect")?.value;
    const so = window.PackFlowStore.state.salesOrders.find(s => s.id === soId);
    const taxable = Number(document.getElementById("invTaxable")?.value || 0);
    const freight = Number(document.getElementById("invFreight")?.value || 0);
    const cgst = Math.round(taxable * 0.06);
    const sgst = Math.round(taxable * 0.06);
    const total = taxable + cgst + sgst + freight;

    const newInv = window.PackFlowStore.addInvoice({
      salesOrderId: soId,
      customer: so ? so.customer : "Client",
      taxableAmount: taxable,
      cgst,
      sgst,
      igst: 0,
      freight,
      totalAmount: total,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
    });

    window.PackFlowComponents.closeModal();
    window.PackFlowComponents.showToast(`Tax Invoice ${newInv.id} created!`, "success");
    location.hash = "#/finance/invoices";
  },

  openNewPaymentModal() {
    const state = window.PackFlowStore.state;

    window.PackFlowComponents.openModal({
      title: "Record Customer Payment Receipt",
      size: "modal-md",
      bodyHtml: `
        <form id="paymentReceiptForm">
          <div class="form-group">
            <label class="form-label required">Customer Account</label>
            <select id="rcptCustomer" onchange="PackFlowPages.finance.onCustomerPaymentChange(this.value)">
              ${state.customers.map(c => `
                <option value="${c.name}">${c.name} (Due: ${window.PackFlowCalc.formatCurrency(c.outstandingBalance)})</option>
              `).join("")}
            </select>
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label required">Amount Received (₹)</label>
              <input type="number" id="rcptAmount" value="500000" step="10000">
            </div>
            <div class="form-group">
              <label class="form-label required">Payment Mode</label>
              <select id="rcptMode">
                <option value="RTGS Bank Transfer" selected>RTGS Bank Transfer</option>
                <option value="NEFT Online Transfer">NEFT Online Transfer</option>
                <option value="Cheque Deposit">Cheque Deposit</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label required">Bank UTR / Transaction Reference</label>
            <input type="text" id="rcptRef" value="HDFC-RTGS-${Math.floor(10000000 + Math.random()*90000000)}">
          </div>
          <div class="form-group">
            <label class="form-label">Allocate to Specific Invoice</label>
            <select id="rcptInvoiceSelect">
              <option value="">Auto-credit Ledger</option>
              ${state.invoices.map(i => `
                <option value="${i.id}">${i.id} • Due: ${window.PackFlowCalc.formatCurrency(i.outstandingAmount)}</option>
              `).join("")}
            </select>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-outline" onclick="PackFlowComponents.closeModal()">Cancel</button>
        <button class="btn btn-secondary" onclick="PackFlowPages.finance.submitPaymentReceipt()">
          <span class="material-symbols-outlined text-[18px]">payments</span>
          <span>Record Receipt & Update Ledger</span>
        </button>
      `
    });
  },

  submitPaymentReceipt() {
    const customer = document.getElementById("rcptCustomer")?.value;
    const amount = Number(document.getElementById("rcptAmount")?.value || 0);
    const mode = document.getElementById("rcptMode")?.value;
    const ref = document.getElementById("rcptRef")?.value;
    const invId = document.getElementById("rcptInvoiceSelect")?.value;

    const receipt = window.PackFlowStore.recordPayment({
      customer,
      amount,
      mode,
      refNo: ref,
      allocatedToInvoice: invId || null
    });

    window.PackFlowComponents.closeModal();
    window.PackFlowComponents.showToast(`Recorded receipt ${receipt.id} for ${window.PackFlowCalc.formatCurrency(amount)}! Ledger updated.`, "success");
    location.hash = "#/finance";
  },

  printInvoice(invId) {
    const inv = window.PackFlowStore.state.invoices.find(i => i.id === invId);
    if (!inv) return;
    const calc = window.PackFlowCalc;

    const html = `
      <div class="print-header">
        <div>
          <h2 class="print-company-name">SHREE PACK INDUSTRIES PVT. LTD.</h2>
          <p>Sanand Industrial Estate, Ahmedabad, Gujarat - 382110</p>
          <p>GSTIN: 24AABCS4921K1ZN | State: Gujarat (Code: 24)</p>
          <p>Bank: HDFC Bank, Sanand | A/c: 50200088192041 | IFSC: HDFC0001892</p>
        </div>
        <div style="text-align:right;">
          <h2 style="font-size:16pt; color:#004ac6;">TAX INVOICE</h2>
          <p><strong>INVOICE NO:</strong> ${inv.id}</p>
          <p><strong>DATE:</strong> ${calc.formatDate(inv.invoiceDate)}</p>
          <p><strong>DUE DATE:</strong> ${calc.formatDate(inv.dueDate)}</p>
          <p><strong>SO REF:</strong> ${inv.salesOrderId || 'Direct'}</p>
        </div>
      </div>

      <table class="print-meta-table">
        <tr>
          <td><strong>BILLED TO:</strong><br>${inv.customer}</td>
          <td><strong>SUPPLY STATE:</strong> Gujarat (Intra-State)</td>
        </tr>
      </table>

      <table class="print-items-table">
        <thead>
          <tr>
            <th>HSN / SAC</th>
            <th>Item Description</th>
            <th style="text-align:right;">Taxable Value</th>
            <th style="text-align:right;">CGST (6%)</th>
            <th style="text-align:right;">SGST (6%)</th>
            <th style="text-align:right;">Total Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>48191010</td>
            <td>Corrugated Paper & Packaging Boxes</td>
            <td style="text-align:right;">${calc.formatCurrency(inv.taxableAmount)}</td>
            <td style="text-align:right;">${calc.formatCurrency(inv.cgst)}</td>
            <td style="text-align:right;">${calc.formatCurrency(inv.sgst)}</td>
            <td style="text-align:right;"><strong>${calc.formatCurrency(inv.totalAmount)}</strong></td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="5" style="text-align:right; font-weight:bold;">Total Invoice Amount:</td>
            <td style="text-align:right; font-weight:bold; font-size:12pt;">${calc.formatCurrency(inv.totalAmount)}</td>
          </tr>
          <tr>
            <td colspan="5" style="text-align:right;">Amount Paid / Adjusted:</td>
            <td style="text-align:right; color:#16a34a;">${calc.formatCurrency(inv.paidAmount)}</td>
          </tr>
          <tr>
            <td colspan="5" style="text-align:right; font-weight:bold;">Balance Due:</td>
            <td style="text-align:right; font-weight:bold; color:#ba1a1a;">${calc.formatCurrency(inv.outstandingAmount)}</td>
          </tr>
        </tfoot>
      </table>

      <div class="print-signatures">
        <div class="print-signature-box">Prepared By (Accounts)</div>
        <div class="print-signature-box">For Shree Pack Industries Pvt. Ltd.<br>(Authorized Signatory)</div>
      </div>
    `;

    window.PackFlowComponents.openPrintView(`Invoice_${inv.id}`, html);
  },

  exportInvoicesCSV() {
    const state = window.PackFlowStore.state;
    const headers = ["Invoice ID", "Date", "Customer", "Sales Order", "Taxable", "CGST", "SGST", "Freight", "Total", "Paid", "Outstanding", "Status"];
    const rows = state.invoices.map(i => [
      i.id, i.invoiceDate, i.customer, i.salesOrderId, i.taxableAmount, i.cgst, i.sgst, i.freight, i.totalAmount, i.paidAmount, i.outstandingAmount, i.status
    ]);
    window.PackFlowComponents.exportTableToCSV("PackFlow_Invoices.csv", headers, rows);
  }
};
