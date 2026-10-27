/**
 * PackFlow ERP - Reports, Approvals Inbox, Documents & Admin Settings
 * Central Approvals, Reports Center, Document Print Repository, Demo Data Reset, and Portals.
 */

window.PackFlowPages = window.PackFlowPages || {};

window.PackFlowPages.reportsAdmin = {
  // ==========================================
  // APPROVALS INBOX
  // ==========================================
  renderApprovalsInbox() {
    const state = window.PackFlowStore.state;
    const pending = state.approvals.filter(a => a.status === "Pending");
    const history = state.approvals.filter(a => a.status !== "Pending");

    return `
      <div class="card" style="margin-bottom: var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <div class="flex items-center gap-xs">
              <span class="material-symbols-outlined text-error text-[24px]">assignment_turned_in</span>
              <h1 class="text-headline-lg font-bold">Executive Approvals & Governance Inbox</h1>
              <span class="badge badge-error">${pending.length} Pending Actions</span>
            </div>
            <p class="text-body-md text-on-surface-variant">Review credit limit overrides, raw material purchase requisitions, quotation margin deviations, and write-offs</p>
          </div>
        </div>
      </div>

      <div class="tabs-header">
        <button class="tab-item active" onclick="PackFlowPages.reportsAdmin.switchApprTab('pending')">
          Pending Approvals (${pending.length})
        </button>
        <button class="tab-item" onclick="PackFlowPages.reportsAdmin.switchApprTab('history')">
          Decision History (${history.length})
        </button>
      </div>

      <div id="apprPendingView" class="flex flex-col gap-md">
        ${pending.length === 0 ? `
          <div class="card empty-state">
            <span class="material-symbols-outlined empty-state-icon text-secondary">check_circle</span>
            <h3 class="empty-state-title">Inbox All Clear!</h3>
            <p class="empty-state-text">No pending approvals require executive authorization at this time.</p>
          </div>
        ` : pending.map(a => `
          <div class="card" style="border-left: 4px solid var(--color-${a.priority === 'Critical' ? 'error' : 'warning'});">
            <div class="flex flex-wrap justify-between items-start gap-md">
              <div>
                <div class="flex items-center gap-xs">
                  <span class="badge ${a.priority === 'Critical' ? 'badge-error' : 'badge-warning'}">${a.priority} Priority</span>
                  <span class="text-label-sm text-primary font-bold uppercase">${a.type}</span>
                  <span class="text-body-sm text-muted">• Ref: <strong>${a.reference}</strong></span>
                </div>
                <h3 class="text-headline-sm font-bold text-on-surface" style="margin:4px 0 2px 0;">${a.title}</h3>
                <p class="text-body-md text-on-surface-variant">${a.details}</p>
                <div class="text-body-sm text-muted" style="margin-top:6px;">
                  Requested by <strong>${a.requester}</strong> (${a.department}) on ${window.PackFlowCalc.formatDate(a.date)}
                </div>
              </div>
              <div class="text-right">
                <span class="text-headline-md font-tabular font-bold text-primary block">${a.amount}</span>
                <div class="flex items-center gap-xs" style="margin-top:10px;">
                  <button class="btn btn-primary" onclick="PackFlowStore.handleApproval('${a.id}', 'approve'); PackFlowComponents.showToast('Authorized ${a.title}', 'success');">
                    <span class="material-symbols-outlined text-[18px]">check</span>
                    <span>Approve</span>
                  </button>
                  <button class="btn btn-outline" onclick="PackFlowPages.reportsAdmin.openRejectDialog('${a.id}')">
                    <span class="material-symbols-outlined text-[18px]">close</span>
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `).join("")}
      </div>

      <div id="apprHistoryView" class="table-wrapper hidden">
        <div class="table-responsive">
          <table class="table-master">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Request Details</th>
                <th>Department</th>
                <th>Amount</th>
                <th>Decision</th>
                <th>Decision Reason</th>
              </tr>
            </thead>
            <tbody>
              ${history.map(h => `
                <tr>
                  <td><strong class="text-primary font-tabular">${h.reference}</strong></td>
                  <td><strong>${h.title}</strong></td>
                  <td>${h.department}</td>
                  <td class="font-tabular font-bold">${h.amount}</td>
                  <td><span class="badge ${h.status === 'Approved' ? 'badge-success' : 'badge-error'}">${h.status}</span></td>
                  <td>${h.decisionReason || 'Approved by Executive Management'}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  switchApprTab(tab) {
    const pendingView = document.getElementById("apprPendingView");
    const historyView = document.getElementById("apprHistoryView");
    const tabs = document.querySelectorAll(".tabs-header .tab-item");

    tabs.forEach(t => t.classList.remove("active"));
    if (tab === "pending") {
      tabs[0]?.classList.add("active");
      if (pendingView) pendingView.classList.remove("hidden");
      if (historyView) historyView.classList.add("hidden");
    } else {
      tabs[1]?.classList.add("active");
      if (pendingView) pendingView.classList.add("hidden");
      if (historyView) historyView.classList.remove("hidden");
    }
  },

  openRejectDialog(apprId) {
    window.PackFlowComponents.openModal({
      title: "Reject Request with Justification",
      size: "modal-sm",
      bodyHtml: `
        <div class="form-group">
          <label class="form-label required">Reason for Rejection</label>
          <textarea id="apprRejectReason" placeholder="Specify why this request is denied..."></textarea>
        </div>
      `,
      footerHtml: `
        <button class="btn btn-outline" onclick="PackFlowComponents.closeModal()">Cancel</button>
        <button class="btn btn-destructive" onclick="PackFlowPages.reportsAdmin.submitReject('${apprId}')">
          Confirm Rejection
        </button>
      `
    });
  },

  submitReject(apprId) {
    const reason = document.getElementById("apprRejectReason")?.value.trim() || "Declined by management policy";
    window.PackFlowStore.handleApproval(apprId, "reject", reason);
    window.PackFlowComponents.closeModal();
    window.PackFlowComponents.showToast("Request rejected and recorded in governance audit log", "warning");
    location.hash = "#/approvals";
  },

  // ==========================================
  // REPORTS & ANALYTICS
  // ==========================================
  renderReports() {
    const calc = window.PackFlowCalc;

    return `
      <div class="card" style="margin-bottom: var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <h1 class="text-headline-lg font-bold">Manufacturing Reports & Business Intelligence</h1>
            <p class="text-body-md text-on-surface-variant">Exportable audit datasets for sales, plant production output, material scrap, and financial ledgers</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-md">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Commercial Sales Report</h3>
            <span class="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
          </div>
          <p class="text-body-sm text-on-surface-variant">Order bookings, dispatched quantities, and unit realizations across clients.</p>
          <div class="card-footer">
            <button class="btn btn-primary btn-sm w-full" onclick="PackFlowPages.sales.exportSalesOrdersCSV()">
              <span class="material-symbols-outlined text-[16px]">file_download</span>
              <span>Download Sales CSV</span>
            </button>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Shop Floor Output & Scrap</h3>
            <span class="material-symbols-outlined text-secondary text-[20px]">precision_manufacturing</span>
          </div>
          <p class="text-body-sm text-on-surface-variant">Machine speeds, good pieces produced, trim waste % and downtime causes.</p>
          <div class="card-footer">
            <button class="btn btn-secondary btn-sm w-full" onclick="PackFlowPages.production.exportJobsCSV()">
              <span class="material-symbols-outlined text-[16px]">file_download</span>
              <span>Download Production CSV</span>
            </button>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Reel Stock & Valuation</h3>
            <span class="material-symbols-outlined text-tertiary text-[20px]">album</span>
          </div>
          <p class="text-body-sm text-on-surface-variant">Reel weights, GSMs, deckle widths, warehouse bay locations, and purchase costs.</p>
          <div class="card-footer">
            <button class="btn btn-outline btn-sm w-full" onclick="PackFlowPages.inventory.exportReelsCSV()">
              <span class="material-symbols-outlined text-[16px]">file_download</span>
              <span>Download Reel Inventory CSV</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // ==========================================
  // DOCUMENT REPOSITORY
  // ==========================================
  renderDocuments() {
    const state = window.PackFlowStore.state;

    return `
      <div class="card" style="margin-bottom: var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <h1 class="text-headline-lg font-bold">Document Repository & Printable Records</h1>
            <p class="text-body-md text-on-surface-variant">Official print templates for Quotations, Tax Invoices, Delivery Challans, and Job Cards</p>
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <div class="table-responsive">
          <table class="table-master">
            <thead>
              <tr>
                <th>Document Type</th>
                <th>Reference ID</th>
                <th>Party / Customer</th>
                <th>Format</th>
                <th class="text-center">Print Preview</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Customer Tax Invoice</strong></td>
                <td class="font-tabular font-bold text-primary">INV-2026-00321</td>
                <td>Sunrise Consumer Products Ltd.</td>
                <td><span class="spec-chip">GST HSN 48191010</span></td>
                <td class="text-center">
                  <button class="btn btn-outline btn-sm" onclick="PackFlowPages.finance.printInvoice('INV-2026-00321')">
                    <span class="material-symbols-outlined text-[16px]">print</span>
                    <span>Print Tax Invoice</span>
                  </button>
                </td>
              </tr>
              <tr>
                <td><strong>Delivery Challan & Gate Pass</strong></td>
                <td class="font-tabular font-bold text-primary">CH-2026-0081</td>
                <td>Sunrise Consumer Products Ltd.</td>
                <td><span class="spec-chip">E-Way Bill 241088921890</span></td>
                <td class="text-center">
                  <button class="btn btn-outline btn-sm" onclick="PackFlowPages.dispatch.printChallan('DISP-2026-0091')">
                    <span class="material-symbols-outlined text-[16px]">print</span>
                    <span>Print Challan</span>
                  </button>
                </td>
              </tr>
              <tr>
                <td><strong>Manufacturing Job Card</strong></td>
                <td class="font-tabular font-bold text-primary">JOB-2026-00081</td>
                <td>Sunrise Consumer Products Ltd.</td>
                <td><span class="spec-chip">5-Ply BHS Corrugator</span></td>
                <td class="text-center">
                  <button class="btn btn-outline btn-sm" onclick="PackFlowPages.production.printJobCard('JOB-2026-00081')">
                    <span class="material-symbols-outlined text-[16px]">print</span>
                    <span>Print Job Card</span>
                  </button>
                </td>
              </tr>
              <tr>
                <td><strong>Sales Order Confirmation</strong></td>
                <td class="font-tabular font-bold text-primary">SO-2026-00142</td>
                <td>Sunrise Consumer Products Ltd.</td>
                <td><span class="spec-chip">Order Ack</span></td>
                <td class="text-center">
                  <button class="btn btn-outline btn-sm" onclick="PackFlowPages.sales.printOrderAck('SO-2026-00142')">
                    <span class="material-symbols-outlined text-[16px]">print</span>
                    <span>Print Order Ack</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // ==========================================
  // ADMINISTRATION & SETTINGS
  // ==========================================
  renderSettings() {
    const comp = window.PackFlowStore.state.company;

    return `
      <div class="card" style="margin-bottom: var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <h1 class="text-headline-lg font-bold">Company Profile, Master Settings & Demo State</h1>
            <p class="text-body-md text-on-surface-variant">System configuration, plant branches, and browser demo state management</p>
          </div>
          <div class="flex items-center gap-sm">
            <button class="btn btn-destructive" onclick="PackFlowPages.reportsAdmin.confirmResetDemo()">
              <span class="material-symbols-outlined text-[18px]">restart_alt</span>
              <span>Reset Demo Data (Pristine)</span>
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-lg">
        <div style="grid-column: span 6 / span 6;">
          <div class="card">
            <h3 class="card-title" style="margin-bottom:var(--space-md);">Plant Master Configuration</h3>
            <div class="flex flex-col gap-sm font-body-sm">
              <div class="flex justify-between"><span>Company Legal Name:</span><strong>${comp.legalName}</strong></div>
              <div class="flex justify-between"><span>CIN Number:</span><strong class="font-tabular">${comp.cin}</strong></div>
              <div class="flex justify-between"><span>State GSTIN:</span><strong class="font-tabular">${comp.gstin}</strong></div>
              <div class="flex justify-between"><span>Primary Factory Location:</span><strong>${comp.unit}</strong></div>
              <div class="flex justify-between"><span>Operating Bank Account:</span><strong class="font-tabular">${comp.bankName} (${comp.accountNo})</strong></div>
            </div>
          </div>
        </div>

        <div style="grid-column: span 6 / span 6;">
          <div class="card">
            <h3 class="card-title" style="margin-bottom:var(--space-md);">Role Simulator</h3>
            <p class="text-body-sm text-on-surface-variant" style="margin-bottom:12px;">
              Simulate operational perspectives across management, operations, storekeeper, and finance:
            </p>
            <div class="flex gap-xs flex-wrap">
              <button class="btn btn-primary btn-sm" onclick="PackFlowApp.switchRole('VP Operations')">VP Operations (Management)</button>
              <button class="btn btn-outline btn-sm" onclick="PackFlowApp.switchRole('Production Supervisor')">Production Supervisor</button>
              <button class="btn btn-outline btn-sm" onclick="PackFlowApp.switchRole('Raw Material Storekeeper')">Storekeeper (Reels)</button>
              <button class="btn btn-outline btn-sm" onclick="PackFlowApp.switchRole('Finance & Accounts')">Finance Manager</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  confirmResetDemo() {
    window.PackFlowComponents.confirm({
      title: "Reset Demo Data to Original Seed State",
      message: "This will wipe all locally stored modifications, added customers, and created work orders, restoring pristine factory seed records. Proceed?",
      confirmText: "Yes, Reset Everything",
      confirmClass: "btn-destructive",
      onConfirm: () => {
        window.PackFlowStore.resetDemoData();
        window.PackFlowComponents.showToast("Demo data successfully restored to factory seed state!", "success");
        location.hash = "#/dashboard";
      }
    });
  },

  // Customer Portal Demo View
  renderCustomerPortal() {
    const so = window.PackFlowStore.state.salesOrders[0];

    return `
      <div class="card" style="margin-bottom:var(--space-md); background:var(--color-surface-container-low);">
        <div class="flex justify-between items-center">
          <div>
            <span class="badge badge-primary">Customer Portal Demonstration View</span>
            <h1 class="text-headline-lg font-bold" style="margin-top:4px;">Sunrise Consumer Products — Supplier Order Tracking</h1>
            <p class="text-body-md text-on-surface-variant">Self-service packaging dispatch status, proof of delivery, and invoice download</p>
          </div>
          <button class="btn btn-outline btn-sm" onclick="location.hash='#/dashboard'">Return to ERP Cockpit</button>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Live Dispatch Tracking: SO-2026-00142</h3>
        <p class="text-body-sm text-muted">50,000 Pcs 5-Ply Master Carton 1L Pouch</p>

        <div style="margin:20px 0; background:var(--color-surface-container-low); padding:16px; border-radius:var(--radius-lg);">
          <div class="flex justify-between items-center" style="margin-bottom:12px;">
            <span>Truck GJ-01-BX-7721 (Patel Roadlines)</span>
            <span class="badge badge-success">Out for Delivery</span>
          </div>
          <div class="kpi-progress" style="height:8px;"><div class="kpi-progress-bar" style="width:75%; background-color:var(--color-secondary);"></div></div>
          <div class="flex justify-between text-body-sm text-muted" style="margin-top:6px;">
            <span>Dispatched from Sanand Plant (09:30 AM)</span>
            <span>ETA at Naroda Plant: 17:00 hrs</span>
          </div>
        </div>
      </div>
    `;
  },

  // Supplier Portal Demo View
  renderSupplierPortal() {
    return `
      <div class="card" style="margin-bottom:var(--space-md); background:var(--color-surface-container-low);">
        <div class="flex justify-between items-center">
          <div>
            <span class="badge badge-secondary">Supplier Portal Demonstration View</span>
            <h1 class="text-headline-lg font-bold" style="margin-top:4px;">Gujarat Kraft Paper Traders — Mill Vendor Portal</h1>
            <p class="text-body-md text-on-surface-variant">Purchase order acknowledgments, truck dispatch advance notices, and moisture lab receipts</p>
          </div>
          <button class="btn btn-outline btn-sm" onclick="location.hash='#/dashboard'">Return to ERP Cockpit</button>
        </div>
      </div>

      <div class="card">
        <h3 class="card-title">Active PO Deliveries & Moisture Lab Feedback</h3>
        <p class="text-body-sm text-muted">All paper reels delivered to Shree Pack Industries Sanand Plant #1</p>
        <div style="margin-top:16px;">
          <div class="badge badge-success">100% On-Time Delivery Rating (4.8 / 5.0)</div>
        </div>
      </div>
    `;
  }
};
