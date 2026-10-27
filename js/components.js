/**
 * PackFlow ERP - Reusable Interactive Components
 * Modals, Drawers, Toast Notifications, Confirmations, CSV Exporter, and Print Handler.
 */

window.PackFlowComponents = {
  // Toast Notification
  showToast(message, type = "success", duration = 3500) {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let icon = "check_circle";
    if (type === "error") icon = "error";
    if (type === "warning") icon = "warning";
    if (type === "info") icon = "info";

    toast.innerHTML = `
      <div class="toast-content">
        <span class="material-symbols-outlined text-[20px]">${icon}</span>
        <span>${message}</span>
      </div>
      <button style="background:transparent;border:none;color:inherit;cursor:pointer;opacity:0.7;" onclick="this.parentElement.remove()">
        <span class="material-symbols-outlined text-[16px]">close</span>
      </button>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // Modal Dialog
  openModal({ title, bodyHtml, footerHtml = "", size = "" }) {
    let modal = document.getElementById("globalModalBackdrop");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "globalModalBackdrop";
      modal.className = "modal-backdrop";
      modal.innerHTML = `
        <div class="modal-dialog ${size}" id="globalModalDialog">
          <div class="modal-header">
            <h3 class="modal-title" id="globalModalTitle"></h3>
            <button class="modal-close-btn" onclick="PackFlowComponents.closeModal()">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          <div class="modal-body" id="globalModalBody"></div>
          <div class="modal-footer" id="globalModalFooter"></div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener("click", (e) => {
        if (e.target === modal) PackFlowComponents.closeModal();
      });
    }

    const dialog = document.getElementById("globalModalDialog");
    dialog.className = `modal-dialog ${size}`;
    document.getElementById("globalModalTitle").innerHTML = title;
    document.getElementById("globalModalBody").innerHTML = bodyHtml;
    document.getElementById("globalModalFooter").innerHTML = footerHtml;

    modal.classList.add("open");
  },

  closeModal() {
    const modal = document.getElementById("globalModalBackdrop");
    if (modal) modal.classList.remove("open");
  },

  // Slide-out Drawer
  openDrawer({ title, bodyHtml, footerHtml = "" }) {
    let overlay = document.getElementById("globalDrawerOverlay");
    let panel = document.getElementById("globalDrawerPanel");

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "globalDrawerOverlay";
      overlay.className = "drawer-overlay";
      document.body.appendChild(overlay);

      panel = document.createElement("div");
      panel.id = "globalDrawerPanel";
      panel.className = "drawer-panel";
      panel.innerHTML = `
        <div class="drawer-header">
          <div id="drawerHeaderTitle"></div>
          <button class="modal-close-btn" onclick="PackFlowComponents.closeDrawer()">
            <span class="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>
        <div class="drawer-body" id="drawerBodyContent"></div>
        <div class="drawer-footer" id="drawerFooterContent"></div>
      `;
      document.body.appendChild(panel);

      overlay.addEventListener("click", () => PackFlowComponents.closeDrawer());
    }

    document.getElementById("drawerHeaderTitle").innerHTML = title;
    document.getElementById("drawerBodyContent").innerHTML = bodyHtml;
    document.getElementById("drawerFooterContent").innerHTML = footerHtml;

    overlay.classList.add("open");
    panel.classList.add("open");
  },

  closeDrawer() {
    const overlay = document.getElementById("globalDrawerOverlay");
    const panel = document.getElementById("globalDrawerPanel");
    if (overlay) overlay.classList.remove("open");
    if (panel) panel.classList.remove("open");
  },

  // Confirmation Modal
  confirm({ title = "Confirm Action", message, confirmText = "Confirm", confirmClass = "btn-primary", onConfirm }) {
    this.openModal({
      title,
      size: "modal-sm",
      bodyHtml: `
        <div style="display:flex; gap:12px; align-items:flex-start;">
          <span class="material-symbols-outlined text-[28px] text-warning" style="margin-top:2px;">help</span>
          <p class="text-body-md">${message}</p>
        </div>
      `,
      footerHtml: `
        <button class="btn btn-outline" onclick="PackFlowComponents.closeModal()">Cancel</button>
        <button class="btn ${confirmClass}" id="btnConfirmAction">${confirmText}</button>
      `
    });

    const btn = document.getElementById("btnConfirmAction");
    if (btn) {
      btn.onclick = () => {
        PackFlowComponents.closeModal();
        if (typeof onConfirm === "function") onConfirm();
      };
    }
  },

  // Export Table Data to Native CSV Download
  exportTableToCSV(filename, headers, rows) {
    const csvContent = [];
    csvContent.push(headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","));

    rows.forEach(row => {
      csvContent.push(row.map(cell => {
        const str = String(cell === null || cell === undefined ? "" : cell);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(","));
    });

    const blob = new Blob([csvContent.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename.endsWith(".csv") ? filename : filename + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.showToast(`Exported ${filename} successfully`, "info");
  },

  // Printable View
  openPrintView(title, printContentHtml) {
    const printArea = document.createElement("div");
    printArea.id = "printContainer";
    printArea.className = "print-document-container";
    printArea.innerHTML = printContentHtml;

    // Remove existing print container if any
    const existing = document.getElementById("printContainer");
    if (existing) existing.remove();

    document.body.appendChild(printArea);
    window.print();
    setTimeout(() => printArea.remove(), 1000);
  }
};
