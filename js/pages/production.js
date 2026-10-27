/**
 * PackFlow ERP - Production & Shop Floor Manufacturing Pages
 * Job Cards, Production Planning, MRP Material Planning, Stage Operations (Corrugation, Flexo, Finishing).
 */

window.PackFlowPages = window.PackFlowPages || {};

window.PackFlowPages.production = {
  // ==========================================
  // JOB CARDS / WORK ORDERS
  // ==========================================
  renderJobCards() {
    const state = window.PackFlowStore.state;
    const calc = window.PackFlowCalc;

    return `
      <div class="card" style="margin-bottom: var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <div class="flex items-center gap-xs">
              <h1 class="text-headline-lg font-bold">Job Cards & Shop-Floor Work Orders</h1>
              <span class="badge badge-primary">${state.jobs.length} Active Jobs</span>
            </div>
            <p class="text-body-md text-on-surface-variant">Track corrugated conversion batches across corrugators, flexo printers, die-cutters, and folder-gluers</p>
          </div>
          <div class="flex items-center gap-sm">
            <button class="btn btn-outline" onclick="PackFlowPages.production.exportJobsCSV()">
              <span class="material-symbols-outlined text-[18px]">file_download</span>
              <span>Export CSV</span>
            </button>
            <button class="btn btn-primary" onclick="PackFlowPages.production.openNewJobModal()">
              <span class="material-symbols-outlined text-[18px]">add_task</span>
              <span>+ Issue New Job Card</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Job Cards Table -->
      <div class="table-wrapper">
        <div class="table-filter-bar">
          <div class="table-search-box">
            <span class="material-symbols-outlined">search</span>
            <input type="text" id="jobSearchInput" placeholder="Search by Job ID, Customer, or Machine..." onkeyup="PackFlowPages.production.filterJobsTable(this.value)">
          </div>
          <div class="flex items-center gap-sm">
            <select class="filter-select" id="jobStageFilter" onchange="PackFlowPages.production.filterJobsTable()">
              <option value="">All Stages</option>
              <option value="Corrugation">Corrugation</option>
              <option value="Flexo">Flexo Printing</option>
              <option value="Die-Cut">Die-Cutting</option>
              <option value="Folding">Folding & Stitching</option>
              <option value="QC">QC & Bundling</option>
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="table-master" id="jobsMasterTable">
            <thead>
              <tr>
                <th>Job Card ID</th>
                <th>Linked Order & Customer</th>
                <th>Carton Specification</th>
                <th class="text-right">Planned</th>
                <th class="text-right">Good Output</th>
                <th class="text-right">Scrap</th>
                <th>Current Work Center</th>
                <th>Stage Progress</th>
                <th>Target Date</th>
                <th class="text-center">Status</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${state.jobs.map(job => `
                <tr onclick="location.hash='#/production/jobs/${job.id}'" style="cursor:pointer;">
                  <td>
                    <div class="font-tabular font-bold text-primary">${job.id}</div>
                    <div class="text-body-sm text-muted">${job.workCenter}</div>
                  </td>
                  <td>
                    <div class="font-bold text-on-surface">${job.customer}</div>
                    <div class="text-body-sm text-muted font-tabular">${job.salesOrderId}</div>
                  </td>
                  <td style="max-width:240px;">
                    <div class="font-medium text-on-surface truncate">${job.productName}</div>
                    <span class="spec-chip">${job.deckleMm}mm Deckle</span>
                  </td>
                  <td class="text-right font-tabular font-bold">${job.plannedQty.toLocaleString()}</td>
                  <td class="text-right font-tabular text-secondary font-bold">${job.producedQty.toLocaleString()}</td>
                  <td class="text-right font-tabular text-error font-bold">${job.scrapQty || 0}</td>
                  <td>
                    <div><strong>${job.machine}</strong></div>
                    <div class="text-body-sm text-muted">Sup: ${job.supervisor}</div>
                  </td>
                  <td style="min-width:150px;">
                    <div class="flex justify-between text-label-sm" style="margin-bottom:2px;">
                      <span>${job.currentStage}</span>
                      <strong class="font-tabular">${job.completionPct}%</strong>
                    </div>
                    <div class="kpi-progress" style="margin:0;">
                      <div class="kpi-progress-bar" style="width:${job.completionPct}%; background-color:var(--color-primary);"></div>
                    </div>
                  </td>
                  <td class="font-tabular">${calc.formatDate(job.targetDate)}</td>
                  <td class="text-center">
                    <span class="badge ${job.completionPct >= 100 ? 'badge-success' : 'badge-warning'}">
                      ${job.status}
                    </span>
                  </td>
                  <td class="text-center" onclick="event.stopPropagation()">
                    <div class="row-actions">
                      <button class="row-action-btn text-primary" title="Log Production Output" onclick="PackFlowPages.production.openLogOutputModal('${job.id}')">
                        <span class="material-symbols-outlined text-[18px]">add_circle</span>
                      </button>
                      <button class="row-action-btn text-secondary" title="Complete & Release to QC" onclick="PackFlowPages.production.completeJobAction('${job.id}')">
                        <span class="material-symbols-outlined text-[18px]">verified</span>
                      </button>
                      <button class="row-action-btn text-outline" title="Print Job Card" onclick="PackFlowPages.production.printJobCard('${job.id}')">
                        <span class="material-symbols-outlined text-[18px]">print</span>
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

  filterJobsTable(val) {
    const input = val !== undefined ? val.toLowerCase() : (document.getElementById("jobSearchInput")?.value || "").toLowerCase();
    const stage = (document.getElementById("jobStageFilter")?.value || "").toLowerCase();
    const rows = document.querySelectorAll("#jobsMasterTable tbody tr");

    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      const matchText = !input || text.includes(input);
      const matchStage = !stage || text.includes(stage);
      row.style.display = matchText && matchStage ? "" : "none";
    });
  },

  exportJobsCSV() {
    const state = window.PackFlowStore.state;
    const headers = ["Job ID", "Sales Order", "Customer", "Product", "Planned Qty", "Produced Qty", "Scrap Qty", "Current Stage", "Machine", "Status"];
    const rows = state.jobs.map(j => [
      j.id, j.salesOrderId, j.customer, j.productName, j.plannedQty, j.producedQty, j.scrapQty, j.currentStage, j.machine, j.status
    ]);
    window.PackFlowComponents.exportTableToCSV("PackFlow_Job_Cards.csv", headers, rows);
  },

  openNewJobModal() {
    const state = window.PackFlowStore.state;

    window.PackFlowComponents.openModal({
      title: "Issue New Shop Floor Job Card / Work Order",
      size: "modal-lg",
      bodyHtml: `
        <form id="newJobForm">
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label required">Link to Confirmed Sales Order</label>
              <select id="jobSoSelect" onchange="PackFlowPages.production.onSoSelectChange(this.value)">
                ${state.salesOrders.map(so => `
                  <option value="${so.id}">${so.id} • ${so.customer} (${so.orderedQty.toLocaleString()} Pcs)</option>
                `).join("")}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label required">Target Planned Quantity</label>
              <input type="number" id="jobPlannedQty" value="25000" step="500">
            </div>
          </div>
          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label required">Primary Corrugator Line</label>
              <select id="jobMachineSelect">
                <option value="BHS 2200mm Corrugator">BHS 2200mm Corrugator (5-Ply Line 1)</option>
                <option value="Fosber 1800mm Fast-Flute">Fosber 1800mm Fast-Flute (3-Ply Line 2)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label required">Reel Deckle Width (mm)</label>
              <select id="jobDeckleSelect">
                <option value="1800" selected>1800 mm</option>
                <option value="1600">1600 mm</option>
                <option value="1400">1400 mm</option>
                <option value="2000">2000 mm</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label required">Assigned Supervisor</label>
              <select id="jobSupSelect">
                <option value="Dharmendra R.">Dharmendra R.</option>
                <option value="Manish Solanki">Manish Solanki</option>
                <option value="Kishan Rewari">Kishan Rewari</option>
                <option value="Vipul Vaghela">Vipul Vaghela</option>
              </select>
            </div>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-outline" onclick="PackFlowComponents.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="PackFlowPages.production.submitNewJob()">
          <span class="material-symbols-outlined text-[18px]">add_task</span>
          <span>Create & Issue Work Order</span>
        </button>
      `
    });
  },

  submitNewJob() {
    const soId = document.getElementById("jobSoSelect")?.value;
    const so = window.PackFlowStore.state.salesOrders.find(s => s.id === soId);
    const plannedQty = Number(document.getElementById("jobPlannedQty")?.value || 25000);
    const machine = document.getElementById("jobMachineSelect")?.value;
    const deckle = Number(document.getElementById("jobDeckleSelect")?.value || 1800);
    const supervisor = document.getElementById("jobSupSelect")?.value;

    const newJob = window.PackFlowStore.addJob({
      salesOrderId: soId,
      customer: so ? so.customer : "Client",
      productName: so ? so.productName : "Corrugated Carton Batch",
      plannedQty,
      machine,
      deckleMm: deckle,
      workCenter: machine.includes("5-Ply") ? "Corrugator Line 1" : "Corrugator Line 2",
      supervisor
    });

    window.PackFlowComponents.closeModal();
    window.PackFlowComponents.showToast(`Job Card ${newJob.id} generated and routed to floor!`, "success");
    location.hash = `#/production/jobs/${newJob.id}`;
  },

  // Log Output & Scrap Modal
  openLogOutputModal(jobId) {
    const job = window.PackFlowStore.state.jobs.find(j => j.id === jobId);
    if (!job) return;

    window.PackFlowComponents.openModal({
      title: `Log Production Output & Scrap — ${job.id}`,
      size: "modal-sm",
      bodyHtml: `
        <div style="background:var(--color-surface-container-low); padding:10px; border-radius:var(--radius-md); margin-bottom:12px;">
          <strong>${job.productName}</strong>
          <div class="text-body-sm text-muted">Planned: ${job.plannedQty.toLocaleString()} | Already Produced: ${job.producedQty.toLocaleString()}</div>
        </div>
        <div class="form-group">
          <label class="form-label required">Good Boxes Produced (This Run)</label>
          <input type="number" id="addGoodQty" value="2500" step="100">
        </div>
        <div class="form-group">
          <label class="form-label">Trim & Defect Scrap (Pcs)</label>
          <input type="number" id="addScrapQty" value="30" step="5">
        </div>
        <div class="form-group">
          <label class="form-label required">Advance to Next Process Stage</label>
          <select id="nextStageSelect">
            <option value="Corrugation (5P/3P)">Corrugation (5P/3P)</option>
            <option value="Flexo & Slotting" selected>Flexo & Slotting</option>
            <option value="Die-Cut & Crease">Die-Cut & Crease</option>
            <option value="Folding & Stitch">Folding & Stitch</option>
            <option value="QC & Bundling">QC & Bundling</option>
          </select>
        </div>
      `,
      footerHtml: `
        <button class="btn btn-outline" onclick="PackFlowComponents.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="PackFlowPages.production.submitJobLog('${job.id}')">
          <span class="material-symbols-outlined text-[18px]">check</span>
          <span>Record Shift Production</span>
        </button>
      `
    });
  },

  submitJobLog(jobId) {
    const good = Number(document.getElementById("addGoodQty")?.value || 0);
    const scrap = Number(document.getElementById("addScrapQty")?.value || 0);
    const stage = document.getElementById("nextStageSelect")?.value;

    window.PackFlowStore.updateJobProgress(jobId, {
      addedGoodQty: good,
      addedScrapQty: scrap,
      stage
    });

    window.PackFlowComponents.closeModal();
    window.PackFlowComponents.showToast(`Logged ${good.toLocaleString()} pcs for ${jobId}`, "success");
    location.hash = "#/production/jobs";
  },

  completeJobAction(jobId) {
    window.PackFlowComponents.confirm({
      title: "Complete Job Batch",
      message: `Are you sure you want to finalize Job ${jobId} and release all produced units to Quality Inspection & Finished Goods?`,
      confirmText: "Finalize & Release",
      onConfirm: () => {
        window.PackFlowStore.completeJobAndReleaseToQC(jobId);
        window.PackFlowComponents.showToast(`Job ${jobId} finalized! Units released to QA Staging.`, "success");
        location.hash = "#/quality";
      }
    });
  },

  printJobCard(jobId) {
    const job = window.PackFlowStore.state.jobs.find(j => j.id === jobId);
    if (!job) return;
    const calc = window.PackFlowCalc;

    const html = `
      <div class="print-header">
        <div>
          <h2 class="print-company-name">SHREE PACK INDUSTRIES PVT. LTD.</h2>
          <p>Sanand Plant #1, Ahmedabad</p>
        </div>
        <div style="text-align:right;">
          <h2 style="font-size:16pt; color:#004ac6;">MANUFACTURING JOB CARD</h2>
          <p><strong>JOB ID:</strong> ${job.id}</p>
          <p><strong>SALES ORDER:</strong> ${job.salesOrderId}</p>
          <p><strong>DATE:</strong> ${calc.formatDate(job.targetDate)}</p>
        </div>
      </div>

      <table class="print-meta-table">
        <tr>
          <td><strong>CUSTOMER:</strong> ${job.customer}</td>
          <td><strong>PLANNED QUANTITY:</strong> ${job.plannedQty.toLocaleString()} Pcs</td>
        </tr>
        <tr>
          <td><strong>PRODUCT:</strong> ${job.productName}</td>
          <td><strong>MACHINE ROUTING:</strong> ${job.machine}</td>
        </tr>
        <tr>
          <td><strong>DECKLE WIDTH:</strong> ${job.deckleMm} mm</td>
          <td><strong>SUPERVISOR:</strong> ${job.supervisor}</td>
        </tr>
      </table>

      <h4 style="margin:16px 0 6px 0;">SHOP FLOOR STAGE SIGN-OFF LOG:</h4>
      <table class="print-items-table">
        <thead>
          <tr>
            <th>Operation Stage</th>
            <th>Work Station</th>
            <th>Planned Qty</th>
            <th>Good Qty</th>
            <th>Scrap</th>
            <th>Operator Sign</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1. Corrugator 5-Ply / 3-Ply</td>
            <td>Line 1 (2200mm)</td>
            <td>${job.plannedQty.toLocaleString()}</td>
            <td>_________</td>
            <td>______</td>
            <td>_________</td>
          </tr>
          <tr>
            <td>2. Flexo Printing & Slotting</td>
            <td>Dongfang 4-Color</td>
            <td>${job.plannedQty.toLocaleString()}</td>
            <td>_________</td>
            <td>______</td>
            <td>_________</td>
          </tr>
          <tr>
            <td>3. Rotary / Flatbed Die-Cut</td>
            <td>Bobst 1600</td>
            <td>${job.plannedQty.toLocaleString()}</td>
            <td>_________</td>
            <td>______</td>
            <td>_________</td>
          </tr>
          <tr>
            <td>4. Auto Folder Gluer & Stitch</td>
            <td>Vega High-Speed</td>
            <td>${job.plannedQty.toLocaleString()}</td>
            <td>_________</td>
            <td>______</td>
            <td>_________</td>
          </tr>
          <tr>
            <td>5. QC Inspection & Palletizing</td>
            <td>QA Dock Bay</td>
            <td>${job.plannedQty.toLocaleString()}</td>
            <td>_________</td>
            <td>______</td>
            <td>_________</td>
          </tr>
        </tbody>
      </table>

      <div class="print-signatures">
        <div class="print-signature-box">Issued By (Production Planning)</div>
        <div class="print-signature-box">Floor Superintendent</div>
        <div class="print-signature-box">QA Clearance</div>
      </div>
    `;

    window.PackFlowComponents.openPrintView(`Job_${job.id}`, html);
  },

  // ==========================================
  // MATERIAL REQUIREMENTS PLANNING (MRP)
  // ==========================================
  renderMRP() {
    const state = window.PackFlowStore.state;
    const calc = window.PackFlowCalc;

    return `
      <div class="card" style="margin-bottom: var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <div class="flex items-center gap-xs">
              <span class="material-symbols-outlined text-primary text-[24px]">schema</span>
              <h1 class="text-headline-lg font-bold">MRP & Raw Material Requirements Planning</h1>
            </div>
            <p class="text-body-md text-on-surface-variant">Real-time bill of materials explosion from sales order commitments against raw reel balances</p>
          </div>
          <div class="flex items-center gap-sm">
            <button class="btn btn-primary" onclick="PackFlowPages.production.triggerAutoRequisition()">
              <span class="material-symbols-outlined text-[18px]">shopping_cart</span>
              <span>+ Generate Purchase Requisitions for Shortages</span>
            </button>
          </div>
        </div>
      </div>

      <!-- MRP Calculation Workspace -->
      <div class="card" style="margin-bottom:var(--space-md); background:var(--color-surface-container-low);">
        <h3 class="card-title" style="margin-bottom:var(--space-sm);">Select Demand Source Order</h3>
        <div class="flex flex-wrap items-center gap-md">
          <select id="mrpOrderSelect" class="filter-select" style="min-width:320px;" onchange="PackFlowPages.production.recalcMRP(this.value)">
            ${state.salesOrders.map(so => `
              <option value="${so.id}">${so.id} • ${so.customer} — ${so.orderedQty.toLocaleString()} boxes</option>
            `).join("")}
          </select>
          <span class="badge badge-success">BOM Evaluated</span>
        </div>
      </div>

      <!-- Bill of Materials Explosion Table -->
      <div class="table-wrapper">
        <div class="table-responsive">
          <table class="table-master">
            <thead>
              <tr>
                <th>Raw Material Component</th>
                <th>Specification / Grade</th>
                <th class="text-right">Usage / Box</th>
                <th class="text-right">Total Demand</th>
                <th class="text-right">Warehouse Free Stock</th>
                <th class="text-right">Net Shortage / Surplus</th>
                <th class="text-center">Action Required</th>
              </tr>
            </thead>
            <tbody id="mrpTableBody">
              <!-- Material 1: Top Liner -->
              <tr>
                <td><strong>Kraft Liner Paper</strong></td>
                <td>180 GSM Virgin Top Kraft (Deckle 1800mm)</td>
                <td class="text-right font-tabular">0.245 kg</td>
                <td class="text-right font-tabular font-bold">12.25 MT</td>
                <td class="text-right font-tabular text-secondary font-bold">82.00 MT</td>
                <td class="text-right font-tabular text-secondary font-bold">+69.75 MT (Surplus)</td>
                <td class="text-center"><span class="badge badge-success">Stock OK</span></td>
              </tr>
              <!-- Material 2: Fluting Medium -->
              <tr>
                <td><strong>Fluting Medium Paper</strong></td>
                <td>140 GSM Semi-Chemical Fluting</td>
                <td class="text-right font-tabular">0.198 kg</td>
                <td class="text-right font-tabular font-bold">9.90 MT</td>
                <td class="text-right font-tabular text-error font-bold">4.20 MT</td>
                <td class="text-right font-tabular text-error font-bold">-5.70 MT (Deficit)</td>
                <td class="text-center">
                  <button class="btn btn-destructive btn-sm" onclick="PackFlowPages.production.triggerSinglePO('140 GSM Fluting', 30)">
                    Issue SOS PO
                  </button>
                </td>
              </tr>
              <!-- Material 3: Starch Adhesive -->
              <tr>
                <td><strong>Corn Starch Adhesive</strong></td>
                <td>Modified Maize Starch + Borax</td>
                <td class="text-right font-tabular">0.035 kg</td>
                <td class="text-right font-tabular font-bold">1.75 MT</td>
                <td class="text-right font-tabular text-secondary font-bold">6.50 MT</td>
                <td class="text-right font-tabular text-secondary font-bold">+4.75 MT (Surplus)</td>
                <td class="text-center"><span class="badge badge-success">Stock OK</span></td>
              </tr>
              <!-- Material 4: Flexo Printing Inks -->
              <tr>
                <td><strong>Water-Based Flexo Inks</strong></td>
                <td>Cyan & Black Viscosity 20s</td>
                <td class="text-right font-tabular">0.004 kg</td>
                <td class="text-right font-tabular font-bold">200 kg</td>
                <td class="text-right font-tabular text-secondary font-bold">450 kg</td>
                <td class="text-right font-tabular text-secondary font-bold">+250 kg (Surplus)</td>
                <td class="text-center"><span class="badge badge-success">Stock OK</span></td>
              </tr>
              <!-- Material 5: Stitching Wire -->
              <tr>
                <td><strong>Copper Stitching Wire</strong></td>
                <td>12 × 25 Flat Wire Spools</td>
                <td class="text-right font-tabular">0.008 kg</td>
                <td class="text-right font-tabular font-bold">400 kg</td>
                <td class="text-right font-tabular text-secondary font-bold">1,200 kg</td>
                <td class="text-right font-tabular text-secondary font-bold">+800 kg (Surplus)</td>
                <td class="text-center"><span class="badge badge-success">Stock OK</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  triggerAutoRequisition() {
    window.PackFlowComponents.confirm({
      title: "Generate Requisition for MRP Shortage",
      message: "Detected a net shortage of 5.70 MT for 140 GSM Fluting Paper. Create a purchase requisition of 30 MT to Gujarat Kraft Paper Traders?",
      confirmText: "Create PO Requisition",
      onConfirm: () => {
        window.PackFlowStore.addPurchaseOrder({
          supplier: "Gujarat Kraft Paper Traders",
          item: "140 GSM Semi-Chemical Fluting",
          deckleMm: 1800,
          quantityMt: 30,
          ratePerKg: 36.50,
          totalAmount: 1095000,
          deliveryDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0]
        });
        window.PackFlowComponents.showToast("PO Requisition PO-2026-0072 created for 30 MT Fluting Paper!", "success");
        location.hash = "#/procurement";
      }
    });
  },

  triggerSinglePO(material, qtyMt) {
    window.PackFlowStore.addPurchaseOrder({
      supplier: "Western Paper & Board Ltd.",
      item: material,
      deckleMm: 1600,
      quantityMt: qtyMt,
      ratePerKg: 35.00,
      totalAmount: qtyMt * 1000 * 35.00,
      deliveryDate: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0]
    });
    window.PackFlowComponents.showToast(`SOS PO issued for ${qtyMt} MT of ${material}!`, "success");
    location.hash = "#/procurement";
  }
};
