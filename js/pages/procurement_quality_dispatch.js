/**
 * PackFlow ERP - Procurement, Quality Control & Dispatch Logistics
 * Purchase Orders, Goods Receipt (GRN), Lab Testing (BS/ECT/Moisture), Delivery Challans & Fleets.
 */

window.PackFlowPages = window.PackFlowPages || {};

window.PackFlowPages.procurement = {
  renderProcurement() {
    const state = window.PackFlowStore.state;
    const calc = window.PackFlowCalc;

    return `
      <div class="card" style="margin-bottom: var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <h1 class="text-headline-lg font-bold">Procurement & Paper Mill Suppliers</h1>
            <p class="text-body-md text-on-surface-variant">Purchase orders, paper reel inwarding, and supplier payment ledgers</p>
          </div>
          <div class="flex items-center gap-sm">
            <button class="btn btn-primary" onclick="PackFlowPages.procurement.openNewPOModal()">
              <span class="material-symbols-outlined text-[18px]">shopping_cart</span>
              <span>+ Issue Purchase Order (PO)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Purchase Orders Table -->
      <div class="table-wrapper" style="margin-bottom:var(--space-md);">
        <div class="card-header" style="padding:var(--space-md);">
          <h3 class="card-title">Active Purchase Orders</h3>
        </div>
        <div class="table-responsive">
          <table class="table-master">
            <thead>
              <tr>
                <th>PO Number & Date</th>
                <th>Supplier Mill</th>
                <th>Material Specification</th>
                <th class="text-right">Deckle</th>
                <th class="text-right">Quantity (MT)</th>
                <th class="text-right">Rate (₹/kg)</th>
                <th class="text-right">Total Amount</th>
                <th>Delivery Date</th>
                <th class="text-center">Status</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${state.purchaseOrders.map(po => `
                <tr>
                  <td>
                    <strong class="text-primary font-tabular">${po.id}</strong>
                    <div class="text-body-sm text-muted">${calc.formatDate(po.date)}</div>
                  </td>
                  <td><strong>${po.supplier}</strong></td>
                  <td>${po.item}</td>
                  <td class="text-right font-tabular">${po.deckleMm} mm</td>
                  <td class="text-right font-tabular font-bold">${po.quantityMt} MT</td>
                  <td class="text-right font-tabular">₹${Number(po.ratePerKg).toFixed(2)}</td>
                  <td class="text-right font-tabular font-bold">${calc.formatCurrency(po.totalAmount)}</td>
                  <td class="font-tabular">${calc.formatDate(po.deliveryDate)}</td>
                  <td class="text-center">
                    <span class="badge ${po.status === 'Delivered' ? 'badge-success' : 'badge-warning'}">
                      ${po.status}
                    </span>
                  </td>
                  <td class="text-center">
                    ${po.status !== 'Delivered' ? `
                      <button class="btn btn-outline btn-sm" onclick="PackFlowPages.procurement.receivePO('${po.id}')">
                        <span class="material-symbols-outlined text-[16px]">inventory</span>
                        <span>Record GRN Receipt</span>
                      </button>
                    ` : '<span class="text-secondary font-bold text-body-sm">Stock Inwarded</span>'}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Supplier Directory -->
      <div class="card">
        <h3 class="card-title" style="margin-bottom:var(--space-md);">Approved Paper Mills & Material Vendors</h3>
        <div class="grid grid-cols-3 gap-md">
          ${state.suppliers.map(s => `
            <div style="background:var(--color-surface-container-low); padding:16px; border-radius:var(--radius-xl); border:1px solid #e2e8f0; display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="text-body-md font-bold text-on-surface">${s.name}</h4>
                    <span class="text-body-sm text-muted">${s.city}, ${s.state}</span>
                  </div>
                  <span class="badge badge-success">⭐ ${s.rating}</span>
                </div>
                <div style="margin:10px 0;">
                  <span class="text-body-sm text-muted">Categories:</span>
                  <div class="flex gap-xs flex-wrap" style="margin-top:2px;">
                    ${s.categories.map(cat => `<span class="spec-chip">${cat}</span>`).join("")}
                  </div>
                </div>
              </div>
              <div class="flex justify-between items-center pt-2" style="border-top:1px solid #e2e8f0;">
                <div>
                  <span class="text-label-sm text-muted">Outstanding:</span>
                  <strong class="font-tabular text-body-sm">${calc.formatCurrency(s.outstandingBalance)}</strong>
                </div>
                <button class="btn btn-outline btn-sm" onclick="location.hash='#/procurement/new?supplier=${encodeURIComponent(s.name)}'">Order</button>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  },

  openNewPOModal() {
    const state = window.PackFlowStore.state;

    window.PackFlowComponents.openModal({
      title: "Issue Raw Material Purchase Order (PO)",
      size: "modal-lg",
      bodyHtml: `
        <form id="newPoForm">
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label required">Select Supplier Mill</label>
              <select id="poSupplier">
                ${state.suppliers.map(s => `
                  <option value="${s.name}">${s.name} (${s.city})</option>
                `).join("")}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label required">Paper Grade / Material</label>
              <select id="poMaterial">
                <option value="180 GSM Virgin Top Kraft (24 BF)">180 GSM Virgin Top Kraft (24 BF)</option>
                <option value="140 GSM Semi-Chemical Fluting">140 GSM Semi-Chemical Fluting</option>
                <option value="120 GSM High-Strength Fluting">120 GSM High-Strength Fluting</option>
                <option value="230 GSM White Back Duplex Board">230 GSM White Back Duplex Board</option>
              </select>
            </div>
          </div>
          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label required">Deckle Width (mm)</label>
              <select id="poDeckle">
                <option value="1800">1800 mm</option>
                <option value="1600">1600 mm</option>
                <option value="1400">1400 mm</option>
                <option value="2000">2000 mm</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label required">Quantity (MT)</label>
              <input type="number" id="poQty" value="40" step="5">
            </div>
            <div class="form-group">
              <label class="form-label required">Negotiated Rate (₹/kg)</label>
              <input type="number" id="poRate" value="42.00" step="0.5">
            </div>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-outline" onclick="PackFlowComponents.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="PackFlowPages.procurement.submitNewPO()">
          <span class="material-symbols-outlined text-[18px]">send</span>
          <span>Issue PO</span>
        </button>
      `
    });
  },

  submitNewPO() {
    const supplier = document.getElementById("poSupplier")?.value;
    const item = document.getElementById("poMaterial")?.value;
    const deckle = Number(document.getElementById("poDeckle")?.value || 1800);
    const qty = Number(document.getElementById("poQty")?.value || 40);
    const rate = Number(document.getElementById("poRate")?.value || 42);

    const newPO = window.PackFlowStore.addPurchaseOrder({
      supplier,
      item,
      deckleMm: deckle,
      quantityMt: qty,
      ratePerKg: rate,
      totalAmount: qty * 1000 * rate,
      deliveryDate: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0]
    });

    window.PackFlowComponents.closeModal();
    window.PackFlowComponents.showToast(`Purchase Order ${newPO.id} created!`, "success");
    location.hash = "#/procurement";
  },

  receivePO(poId) {
    const po = window.PackFlowStore.state.purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    window.PackFlowComponents.confirm({
      title: "Receive Materials (GRN Inward)",
      message: `Accept Goods Receipt for ${po.quantityMt} MT from ${po.supplier}? This will immediately increase on-hand Reel Stock.`,
      confirmText: "Record GRN Receipt",
      onConfirm: () => {
        window.PackFlowStore.recordGoodsReceipt(poId, po.quantityMt, po.ratePerKg);
        window.PackFlowComponents.showToast(`GRN created! Inwarded ${po.quantityMt} MT into inventory`, "success");
        location.hash = "#/inventory/reels";
      }
    });
  }
};

window.PackFlowPages.quality = {
  renderQuality() {
    const state = window.PackFlowStore.state;

    return `
      <div class="card" style="margin-bottom: var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <div class="flex items-center gap-xs">
              <span class="material-symbols-outlined text-secondary text-[24px]">verified</span>
              <h1 class="text-headline-lg font-bold">Quality Control & Laboratory Testing</h1>
            </div>
            <p class="text-body-md text-on-surface-variant">GSM testing, Bursting Strength (BS), Edge Crush Test (ECT), Cobb moisture sizing, and final QA clearance</p>
          </div>
          <div class="flex items-center gap-sm">
            <button class="btn btn-primary" onclick="PackFlowPages.quality.openNewTestModal()">
              <span class="material-symbols-outlined text-[18px]">biotech</span>
              <span>+ Record Lab Inspection</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Lab Quick KPIs -->
      <div class="grid grid-cols-4 gap-md" style="margin-bottom:var(--space-md);">
        <div class="kpi-card">
          <div class="kpi-header">Shift QA Pass Rate</div>
          <div class="kpi-value font-tabular text-secondary">98.6%</div>
          <div class="text-body-sm text-secondary">14 Batches Cleared</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header">Average Bursting Strength</div>
          <div class="kpi-value font-tabular">14.8 <span style="font-size:14px; font-weight:normal;">kg/cm²</span></div>
          <div class="text-body-sm text-muted">Spec Target: &gt;14.0 kg/cm²</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header">Edge Crush (ECT)</div>
          <div class="kpi-value font-tabular">37.2 <span style="font-size:14px; font-weight:normal;">kN/m</span></div>
          <div class="text-body-sm text-muted">Optimal &gt;35 kN/m</div>
        </div>
        <div class="kpi-card" style="border-left: 4px solid var(--color-error);">
          <div class="kpi-header" style="color:var(--color-error);">Quarantine Staging</div>
          <div class="kpi-value font-tabular text-error">1 Reel</div>
          <div class="text-body-sm text-error">REEL-25-0893 (Damp Core)</div>
        </div>
      </div>

      <!-- In-Process Inspections Table -->
      <div class="table-wrapper">
        <div class="card-header" style="padding:var(--space-md);">
          <h3 class="card-title">Completed & Pending Quality Inspections</h3>
        </div>
        <div class="table-responsive">
          <table class="table-master">
            <thead>
              <tr>
                <th>Batch / Inspection ID</th>
                <th>Target Order & Customer</th>
                <th>Measured BS (kg/cm²)</th>
                <th>Measured ECT (kN/m)</th>
                <th>Moisture (%)</th>
                <th>Cobb Sizing (g/m²)</th>
                <th>Inspector</th>
                <th class="text-center">Disposition</th>
                <th class="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>INSP-2026-0051</strong><br><span class="text-body-sm text-muted">BATCH-8492</span></td>
                <td>Sunrise Consumer Products<br><span class="text-body-sm text-muted">SO-2026-00142</span></td>
                <td class="font-tabular font-bold text-secondary">14.5 kg/cm²</td>
                <td class="font-tabular font-bold text-secondary">36.0 kN/m</td>
                <td class="font-tabular">7.2%</td>
                <td class="font-tabular">32 g/m²</td>
                <td>Sneha M.</td>
                <td class="text-center"><span class="badge badge-success">Passed / Dispatch Ready</span></td>
                <td class="text-center">
                  <button class="btn btn-outline btn-sm" onclick="location.hash='#/dispatch/new?so=SO-2026-00142'">
                    Release to Truck
                  </button>
                </td>
              </tr>
              <tr>
                <td><strong>INSP-2026-0052</strong><br><span class="text-body-sm text-muted">BATCH-8501</span></td>
                <td>UrbanKart Retail<br><span class="text-body-sm text-muted">SO-2026-00143</span></td>
                <td class="font-tabular font-bold text-secondary">8.8 kg/cm²</td>
                <td class="font-tabular font-bold text-secondary">27.0 kN/m</td>
                <td class="font-tabular">6.9%</td>
                <td class="font-tabular">28 g/m²</td>
                <td>Sneha M.</td>
                <td class="text-center"><span class="badge badge-success">Passed / Dispatch Ready</span></td>
                <td class="text-center">
                  <button class="btn btn-outline btn-sm" onclick="location.hash='#/dispatch/new?so=SO-2026-00143'">
                    Release to Truck
                  </button>
                </td>
              </tr>
              <tr style="background-color:var(--color-error-container);">
                <td><strong class="text-error">INSP-2026-0053</strong><br><span class="text-body-sm text-muted">REEL-25-0893</span></td>
                <td>Western Paper Mills<br><span class="text-body-sm text-muted">Inward Reel GRN-8422</span></td>
                <td class="font-tabular">--</td>
                <td class="font-tabular">--</td>
                <td class="font-tabular text-error font-bold">9.1% (High)</td>
                <td class="font-tabular">44 g/m²</td>
                <td>Sneha M.</td>
                <td class="text-center"><span class="badge badge-error">Quarantine Hold</span></td>
                <td class="text-center">
                  <button class="btn btn-destructive btn-sm" onclick="PackFlowPages.inventory.retestReelMoisture('REEL-25-0893')">
                    Retest Probe
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  openNewTestModal() {
    window.PackFlowComponents.openModal({
      title: "Log Quality Control Lab Inspection",
      size: "modal-md",
      bodyHtml: `
        <div class="form-group">
          <label class="form-label required">Select Batch / Job Card</label>
          <select id="qaJobSelect">
            ${window.PackFlowStore.state.jobs.map(j => `
              <option value="${j.id}">${j.id} • ${j.customer} (${j.productName})</option>
            `).join("")}
          </select>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label required">Bursting Strength (kg/cm²)</label>
            <input type="number" id="qaBs" value="14.6" step="0.1">
          </div>
          <div class="form-group">
            <label class="form-label required">Edge Crush Test ECT (kN/m)</label>
            <input type="number" id="qaEct" value="36.5" step="0.5">
          </div>
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label required">Moisture Content (%)</label>
            <input type="number" id="qaMoisture" value="7.2" step="0.1">
          </div>
          <div class="form-group">
            <label class="form-label required">Final Disposition</label>
            <select id="qaDisposition">
              <option value="Passed" selected>Passed (Release to FG Dock)</option>
              <option value="Quarantine">Quarantine Hold</option>
            </select>
          </div>
        </div>
      `,
      footerHtml: `
        <button class="btn btn-outline" onclick="PackFlowComponents.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="PackFlowPages.quality.submitQATest()">
          <span class="material-symbols-outlined text-[18px]">verified</span>
          <span>Submit Lab Certificate</span>
        </button>
      `
    });
  },

  submitQATest() {
    const disp = document.getElementById("qaDisposition")?.value;
    window.PackFlowComponents.closeModal();
    if (disp === "Passed") {
      window.PackFlowComponents.showToast("Inspection PASSED! Batch cleared for dispatch.", "success");
    } else {
      window.PackFlowComponents.showToast("Batch placed on Quarantine Hold.", "warning");
    }
    location.hash = "#/quality";
  }
};

window.PackFlowPages.dispatch = {
  renderDispatch() {
    const state = window.PackFlowStore.state;
    const calc = window.PackFlowCalc;

    return `
      <div class="card" style="margin-bottom: var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <div class="flex items-center gap-xs">
              <span class="material-symbols-outlined text-primary text-[24px]">local_shipping</span>
              <h1 class="text-headline-lg font-bold">Dispatch Planning & Vehicle Logistics</h1>
            </div>
            <p class="text-body-md text-on-surface-variant">Gate passes, delivery challans, NIC E-Way bills, and live freight fleet tracking</p>
          </div>
          <div class="flex items-center gap-sm">
            <button class="btn btn-primary" onclick="PackFlowPages.dispatch.openNewDispatchModal()">
              <span class="material-symbols-outlined text-[18px]">local_shipping</span>
              <span>+ Create Dispatch & Challan</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Dispatches Table -->
      <div class="table-wrapper">
        <div class="table-responsive">
          <table class="table-master">
            <thead>
              <tr>
                <th>Challan No & Date</th>
                <th>Sales Order & Customer</th>
                <th>Destination</th>
                <th>Vehicle & Transporter</th>
                <th class="text-right">Boxes</th>
                <th class="text-right">Gross Wt (kg)</th>
                <th>E-Way Bill Ref</th>
                <th class="text-center">Status</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${state.dispatches.map(d => `
                <tr>
                  <td>
                    <strong class="text-primary font-tabular">${d.challanNo}</strong>
                    <div class="text-body-sm text-muted">${calc.formatDate(d.date)}</div>
                  </td>
                  <td>
                    <strong>${d.customer}</strong>
                    <div class="text-body-sm text-muted font-tabular">${d.salesOrderId}</div>
                  </td>
                  <td>${d.destination}</td>
                  <td>
                    <strong class="font-tabular">${d.vehicleNo}</strong>
                    <div class="text-body-sm text-muted">${d.transporter} • ${d.driverName}</div>
                  </td>
                  <td class="text-right font-tabular font-bold">${d.quantity.toLocaleString()}</td>
                  <td class="text-right font-tabular font-bold">${d.grossWeightKg.toLocaleString()} kg</td>
                  <td class="font-tabular text-body-sm">${d.ewayBillNo}</td>
                  <td class="text-center">
                    <span class="badge ${d.status.includes('Hold') ? 'badge-error' : (d.status.includes('Loading') ? 'badge-info' : 'badge-success')}">
                      ${d.status}
                    </span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-outline btn-sm" onclick="PackFlowPages.dispatch.printChallan('${d.id}')">
                      <span class="material-symbols-outlined text-[16px]">print</span>
                      <span>Challan</span>
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  openNewDispatchModal(prefillSoId = "") {
    const state = window.PackFlowStore.state;

    window.PackFlowComponents.openModal({
      title: "Schedule Truck Loading & Delivery Challan",
      size: "modal-lg",
      bodyHtml: `
        <form id="newDispatchForm">
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label required">Select Sales Order to Dispatch</label>
              <select id="dispSoSelect" onchange="PackFlowPages.dispatch.onSoChange(this.value)">
                ${state.salesOrders.map(so => `
                  <option value="${so.id}" ${so.id === prefillSoId ? 'selected' : ''}>
                    ${so.id} • ${so.customer} (Pending: ${so.balanceQty.toLocaleString()} Pcs)
                  </option>
                `).join("")}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label required">Dispatch Quantity (Boxes)</label>
              <input type="number" id="dispQuantity" value="15000" step="500">
            </div>
          </div>
          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label required">Vehicle Number</label>
              <input type="text" id="dispVehicle" value="GJ-01-TA-9921" placeholder="GJ-01-XX-0000">
            </div>
            <div class="form-group">
              <label class="form-label required">Transporter</label>
              <input type="text" id="dispTransporter" value="Patel Roadlines Logistics">
            </div>
            <div class="form-group">
              <label class="form-label required">Driver Contact</label>
              <input type="tel" id="dispDriver" value="+91 98254 11200">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label required">Destination Factory Address</label>
            <input type="text" id="dispDest" value="Client Plant Delivery Dock #2">
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-outline" onclick="PackFlowComponents.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="PackFlowPages.dispatch.submitNewDispatch()">
          <span class="material-symbols-outlined text-[18px]">local_shipping</span>
          <span>Generate Challan & Release Truck</span>
        </button>
      `
    });
  },

  submitNewDispatch() {
    const soId = document.getElementById("dispSoSelect")?.value;
    const so = window.PackFlowStore.state.salesOrders.find(s => s.id === soId);
    const qty = Number(document.getElementById("dispQuantity")?.value || 10000);
    const vehicleNo = document.getElementById("dispVehicle")?.value;
    const transporter = document.getElementById("dispTransporter")?.value;
    const driverPhone = document.getElementById("dispDriver")?.value;
    const destination = document.getElementById("dispDest")?.value;

    if (so && qty > so.balanceQty && so.balanceQty > 0) {
      window.PackFlowComponents.showToast(`Warning: Dispatch quantity exceeds pending balance (${so.balanceQty})`, "warning");
    }

    const newDisp = window.PackFlowStore.addDispatch({
      salesOrderId: soId,
      customer: so ? so.customer : "Customer",
      vehicleNo,
      transporter,
      driverName: "Transporter Driver",
      driverPhone,
      quantity: qty,
      grossWeightKg: Math.round(qty * 0.68),
      destination
    });

    window.PackFlowComponents.closeModal();
    window.PackFlowComponents.showToast(`Delivery Challan ${newDisp.challanNo} generated!`, "success");
    location.hash = "#/dispatch";
  },

  printChallan(dispId) {
    const d = window.PackFlowStore.state.dispatches.find(disp => disp.id === dispId);
    if (!d) return;
    const calc = window.PackFlowCalc;

    const html = `
      <div class="print-header">
        <div>
          <h2 class="print-company-name">SHREE PACK INDUSTRIES PVT. LTD.</h2>
          <p>Sanand Industrial Estate, Ahmedabad - 382110</p>
          <p>GSTIN: 24AABCS4921K1ZN</p>
        </div>
        <div style="text-align:right;">
          <h2 style="font-size:16pt; color:#004ac6;">DELIVERY CHALLAN</h2>
          <p><strong>CHALLAN NO:</strong> ${d.challanNo}</p>
          <p><strong>DATE:</strong> ${calc.formatDate(d.date)}</p>
          <p><strong>E-WAY BILL:</strong> ${d.ewayBillNo}</p>
        </div>
      </div>

      <table class="print-meta-table">
        <tr>
          <td><strong>CONSIGNEE:</strong><br>${d.customer}<br>Destination: ${d.destination}</td>
          <td>
            <strong>TRANSPORT DETAILS:</strong><br>
            Transporter: ${d.transporter}<br>
            Vehicle No: <strong>${d.vehicleNo}</strong><br>
            Driver: ${d.driverName} (${d.driverPhone})
          </td>
        </tr>
      </table>

      <table class="print-items-table">
        <thead>
          <tr>
            <th>Description of Goods</th>
            <th>Order Ref</th>
            <th style="text-align:right;">Packages / Bundles</th>
            <th style="text-align:right;">Dispatched Quantity</th>
            <th style="text-align:right;">Gross Weight (kg)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Printed Corrugated Packaging Boxes (HSN 48191010)</td>
            <td>${d.salesOrderId}</td>
            <td style="text-align:right;">${Math.round(d.quantity / 25)} Bundles (25s)</td>
            <td style="text-align:right;"><strong>${d.quantity.toLocaleString()} Pcs</strong></td>
            <td style="text-align:right;">${d.grossWeightKg.toLocaleString()} kg</td>
          </tr>
        </tbody>
      </table>

      <div class="print-signatures">
        <div class="print-signature-box">Security Gate Outward</div>
        <div class="print-signature-box">Driver Signature</div>
        <div class="print-signature-box">Received in Good Condition (Receiver)</div>
      </div>
    `;

    window.PackFlowComponents.openPrintView(`Challan_${d.challanNo}`, html);
  }
};
