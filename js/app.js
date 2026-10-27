/**
 * PackFlow ERP - Application Bootstrapper & Master Orchestrator
 * Wires Store, Router, Page Controllers, Global Search, and Event Listeners.
 */

window.PackFlowApp = {
  currentRole: "VP Operations",
  activePlant: "Unit 1: Sanand Estate, Ahmedabad",

  init() {
    this.registerRoutes();
    this.setupEventListeners();
    this.setupStoreSubscription();
    window.PackFlowRouter.init();
    this.updateBadges();
  },

  registerRoutes() {
    const r = window.PackFlowRouter;
    const p = window.PackFlowPages;

    // Overview
    r.register("/dashboard", () => p.dashboard.renderExecutiveDashboard());
    r.register("/factory", () => p.dashboard.renderFactoryLive());
    r.register("/approvals", () => p.reportsAdmin.renderApprovalsInbox());

    // Sales & CRM
    r.register("/customers", () => p.sales.renderCustomers());
    r.register("/customers/:id", (params) => p.sales.renderCustomerDetail(params.id));
    r.register("/quotations", () => p.sales.renderQuotationCalculator());
    r.register("/quotations/new", (params, query) => {
      let cust = "";
      if (query && query.includes("customer=")) {
        cust = decodeURIComponent(query.split("customer=")[1].split("&")[0]);
      }
      return p.sales.renderQuotationCalculator(cust);
    });
    r.register("/sales-orders", () => p.sales.renderSalesOrders());
    r.register("/sales-orders/:id", (params) => {
      const html = p.sales.renderSalesOrders();
      setTimeout(() => p.sales.openSODrawer(params.id), 50);
      return html;
    });
    r.register("/products", () => p.sales.renderBoxSpecifications());

    // Production & Shop Floor
    r.register("/production/planning", () => p.dashboard.renderFactoryLive());
    r.register("/production/jobs", () => p.production.renderJobCards());
    r.register("/production/jobs/:id", (params) => {
      const html = p.production.renderJobCards();
      setTimeout(() => p.production.openLogOutputModal(params.id), 50);
      return html;
    });
    r.register("/mrp", () => p.production.renderMRP());

    // Inventory & Paper Store
    r.register("/inventory/reels", () => p.inventory.renderReelInventory());
    r.register("/inventory/deckle", () => p.inventory.renderReelInventory());
    r.register("/inventory/fg", () => p.inventory.renderFGWarehouse());

    // Procurement
    r.register("/procurement", () => p.procurement.renderProcurement());
    r.register("/procurement/new", () => {
      const html = p.procurement.renderProcurement();
      setTimeout(() => p.procurement.openNewPOModal(), 50);
      return html;
    });

    // Quality Control
    r.register("/quality", () => p.quality.renderQuality());

    // Dispatch & Logistics
    r.register("/dispatch", () => p.dispatch.renderDispatch());
    r.register("/dispatch/new", (params, query) => {
      const html = p.dispatch.renderDispatch();
      let soId = "";
      if (query && query.includes("so=")) {
        soId = decodeURIComponent(query.split("so=")[1].split("&")[0]);
      }
      setTimeout(() => p.dispatch.openNewDispatchModal(soId), 50);
      return html;
    });

    // Finance & Profitability
    r.register("/finance", () => p.finance.renderFinanceDashboard());
    r.register("/finance/invoices", () => p.finance.renderFinanceDashboard());
    r.register("/finance/invoices/new", (params, query) => {
      const html = p.finance.renderFinanceDashboard();
      let soId = "";
      if (query && query.includes("so=")) {
        soId = decodeURIComponent(query.split("so=")[1].split("&")[0]);
      }
      setTimeout(() => p.finance.openNewInvoiceModal(soId), 50);
      return html;
    });
    r.register("/finance/receivables", () => p.finance.renderFinanceDashboard());

    // People, Maintenance, Waste
    r.register("/people", () => p.people.renderEmployees());
    r.register("/maintenance", () => p.maintenance.renderMaintenance());
    r.register("/waste", () => p.waste.renderWaste());

    // Reports & Administration
    r.register("/reports", () => p.reportsAdmin.renderReports());
    r.register("/documents", () => p.reportsAdmin.renderDocuments());
    r.register("/settings", () => p.reportsAdmin.renderSettings());

    // Portals
    r.register("/portal/customer", () => p.reportsAdmin.renderCustomerPortal());
    r.register("/portal/supplier", () => p.reportsAdmin.renderSupplierPortal());
  },

  setupEventListeners() {
    // Global Keyboard Shortcuts (Ctrl+K for search, Escape for closing modals/drawers)
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        this.openGlobalSearch();
      } else if (e.key === "Escape") {
        window.PackFlowComponents.closeModal();
        window.PackFlowComponents.closeDrawer();
      }
    });

    // Sidebar Collapse Toggle
    const toggleBtn = document.getElementById("sidebarToggleBtn");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        document.querySelector(".app-sidebar")?.classList.toggle("collapsed");
      });
    }

    // Mobile Menu Toggle
    const mobileBtn = document.getElementById("mobileMenuBtn");
    const backdrop = document.querySelector(".sidebar-backdrop");
    if (mobileBtn) {
      mobileBtn.addEventListener("click", () => {
        document.querySelector(".app-sidebar")?.classList.add("mobile-open");
        backdrop?.classList.add("mobile-open");
      });
    }
    if (backdrop) {
      backdrop.addEventListener("click", () => {
        document.querySelector(".app-sidebar")?.classList.remove("mobile-open");
        backdrop.classList.remove("mobile-open");
      });
    }
  },

  setupStoreSubscription() {
    window.PackFlowStore.subscribe(() => {
      this.updateBadges();
      // Re-render current page
      window.PackFlowRouter.handleRoute();
    });
  },

  updateBadges() {
    const metrics = window.PackFlowStore.getMetrics();
    const apprBadge = document.getElementById("sidebarApprovalsBadge");
    if (apprBadge) {
      apprBadge.textContent = metrics.pendingApprovalsCount;
      apprBadge.style.display = metrics.pendingApprovalsCount > 0 ? "" : "none";
    }

    const topbarApprBadge = document.getElementById("topbarApprovalsBadge");
    if (topbarApprBadge) {
      topbarApprBadge.textContent = metrics.pendingApprovalsCount;
      topbarApprBadge.style.display = metrics.pendingApprovalsCount > 0 ? "" : "none";
    }

    const jobsBadge = document.getElementById("sidebarJobsBadge");
    if (jobsBadge) {
      jobsBadge.textContent = window.PackFlowStore.state.jobs.length;
    }
  },

  switchRole(newRole) {
    this.currentRole = newRole;
    const roleElem = document.getElementById("currentRoleDisplay");
    if (roleElem) roleElem.textContent = newRole;
    window.PackFlowComponents.showToast(`Switched operational view to: ${newRole}`, "info");
  },

  // Global Quick Create Menu
  openQuickCreateMenu() {
    window.PackFlowComponents.openModal({
      title: "Quick Operation Launcher",
      size: "modal-md",
      bodyHtml: `
        <div class="grid grid-cols-2 gap-sm">
          <button class="btn btn-outline" style="height:54px; justify-content:flex-start;" onclick="PackFlowComponents.closeModal(); PackFlowPages.sales.openNewCustomerModal();">
            <span class="material-symbols-outlined text-primary text-[24px]">add_business</span>
            <div style="text-align:left;">
              <strong class="block">New Customer</strong>
              <span class="text-body-sm text-muted">Register account</span>
            </div>
          </button>

          <button class="btn btn-outline" style="height:54px; justify-content:flex-start;" onclick="PackFlowComponents.closeModal(); location.hash='#/quotations/new';">
            <span class="material-symbols-outlined text-secondary text-[24px]">calculate</span>
            <div style="text-align:left;">
              <strong class="block">Box Quotation</strong>
              <span class="text-body-sm text-muted">Costing calculator</span>
            </div>
          </button>

          <button class="btn btn-outline" style="height:54px; justify-content:flex-start;" onclick="PackFlowComponents.closeModal(); PackFlowPages.production.openNewJobModal();">
            <span class="material-symbols-outlined text-primary text-[24px]">add_task</span>
            <div style="text-align:left;">
              <strong class="block">Job Card</strong>
              <span class="text-body-sm text-muted">Issue work order</span>
            </div>
          </button>

          <button class="btn btn-outline" style="height:54px; justify-content:flex-start;" onclick="PackFlowComponents.closeModal(); PackFlowPages.inventory.openInwardReelModal();">
            <span class="material-symbols-outlined text-tertiary text-[24px]">album</span>
            <div style="text-align:left;">
              <strong class="block">Inward Reel</strong>
              <span class="text-body-sm text-muted">Weighbridge GRN</span>
            </div>
          </button>

          <button class="btn btn-outline" style="height:54px; justify-content:flex-start;" onclick="PackFlowComponents.closeModal(); PackFlowPages.finance.openNewPaymentModal();">
            <span class="material-symbols-outlined text-secondary text-[24px]">payments</span>
            <div style="text-align:left;">
              <strong class="block">Payment Receipt</strong>
              <span class="text-body-sm text-muted">Record remittance</span>
            </div>
          </button>

          <button class="btn btn-outline" style="height:54px; justify-content:flex-start;" onclick="PackFlowComponents.closeModal(); PackFlowPages.dispatch.openNewDispatchModal();">
            <span class="material-symbols-outlined text-primary text-[24px]">local_shipping</span>
            <div style="text-align:left;">
              <strong class="block">Delivery Challan</strong>
              <span class="text-body-sm text-muted">Gate pass & E-way</span>
            </div>
          </button>
        </div>
      `,
      footerHtml: `<button class="btn btn-outline" onclick="PackFlowComponents.closeModal()">Close</button>`
    });
  },

  // Global Search Across Master State
  openGlobalSearch() {
    window.PackFlowComponents.openModal({
      title: "Global Enterprise Search [Ctrl+K]",
      size: "modal-lg",
      bodyHtml: `
        <div class="form-group" style="margin-bottom:16px;">
          <input type="text" id="modalGlobalSearchInput" placeholder="Search orders, customers, job cards, reels, invoices, or dies..." autofocus onkeyup="PackFlowApp.executeGlobalSearch(this.value)">
        </div>
        <div id="globalSearchResultsContainer" class="flex flex-col gap-sm" style="max-height:420px; overflow-y:auto;">
          <div class="text-center text-muted text-body-sm" style="padding:20px;">
            Type at least 2 characters to search across live ERP state.
          </div>
        </div>
      `,
      footerHtml: `<button class="btn btn-outline" onclick="PackFlowComponents.closeModal()">Close</button>`
    });

    setTimeout(() => {
      document.getElementById("modalGlobalSearchInput")?.focus();
    }, 100);
  },

  executeGlobalSearch(query) {
    const q = (query || "").trim().toLowerCase();
    const container = document.getElementById("globalSearchResultsContainer");
    if (!container) return;

    if (q.length < 2) {
      container.innerHTML = `<div class="text-center text-muted text-body-sm" style="padding:20px;">Type at least 2 characters to search...</div>`;
      return;
    }

    const state = window.PackFlowStore.state;
    const results = [];

    // Search Customers
    state.customers.forEach(c => {
      if (c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.gstin.toLowerCase().includes(q)) {
        results.push({ type: "Customer", title: c.name, meta: `${c.code} • ${c.city} • GST: ${c.gstin}`, hash: `#/customers/${c.id}`, icon: "business" });
      }
    });

    // Search Sales Orders
    state.salesOrders.forEach(so => {
      if (so.id.toLowerCase().includes(q) || so.customer.toLowerCase().includes(q) || so.productName.toLowerCase().includes(q)) {
        results.push({ type: "Sales Order", title: `${so.id} • ${so.customer}`, meta: `${so.productName} (${so.orderedQty.toLocaleString()} Pcs)`, hash: `#/sales-orders/${so.id}`, icon: "receipt_long" });
      }
    });

    // Search Jobs
    state.jobs.forEach(j => {
      if (j.id.toLowerCase().includes(q) || j.customer.toLowerCase().includes(q)) {
        results.push({ type: "Job Card", title: `${j.id} • ${j.productName}`, meta: `${j.workCenter} • Output: ${j.producedQty.toLocaleString()} / ${j.plannedQty.toLocaleString()}`, hash: `#/production/jobs/${j.id}`, icon: "precision_manufacturing" });
      }
    });

    // Search Paper Reels
    state.reels.forEach(r => {
      if (r.id.toLowerCase().includes(q) || r.paperGrade.toLowerCase().includes(q) || r.mill.toLowerCase().includes(q)) {
        results.push({ type: "Paper Reel", title: `${r.id} (${r.paperGrade})`, meta: `${r.gsm} GSM • Deckle ${r.deckleMm}mm • ${r.netWeightKg} kg • ${r.warehouseBay}`, hash: `#/inventory/reels`, icon: "album" });
      }
    });

    // Search Invoices
    state.invoices.forEach(i => {
      if (i.id.toLowerCase().includes(q) || i.customer.toLowerCase().includes(q)) {
        results.push({ type: "Tax Invoice", title: `${i.id} • ${i.customer}`, meta: `Total: ${window.PackFlowCalc.formatCurrency(i.totalAmount)} • Status: ${i.status}`, hash: `#/finance`, icon: "receipt" });
      }
    });

    if (results.length === 0) {
      container.innerHTML = `<div class="text-center text-muted text-body-sm" style="padding:20px;">No matching records found for "${query}"</div>`;
      return;
    }

    container.innerHTML = results.map(res => `
      <div style="background:var(--color-surface-container-low); padding:10px 14px; border-radius:var(--radius-lg); display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="PackFlowComponents.closeModal(); location.hash='${res.hash}';">
        <div class="flex items-center gap-sm">
          <span class="material-symbols-outlined text-primary text-[20px]">${res.icon}</span>
          <div>
            <div class="flex items-center gap-xs">
              <span class="spec-chip">${res.type}</span>
              <strong class="text-body-md">${res.title}</strong>
            </div>
            <div class="text-body-sm text-muted">${res.meta}</div>
          </div>
        </div>
        <span class="material-symbols-outlined text-muted text-[18px]">arrow_forward</span>
      </div>
    `).join("");
  }
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.PackFlowApp.init();
});
