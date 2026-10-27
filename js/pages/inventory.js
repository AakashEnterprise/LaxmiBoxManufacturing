/**
 * PackFlow ERP - Inventory & Paper Store Pages
 * Paper Reel Inventory, Deckle Slitting Trim Minimizer, Inward GRN Receipts, FG Warehouse.
 */

window.PackFlowPages = window.PackFlowPages || {};

window.PackFlowPages.inventory = {
  // ==========================================
  // PAPER REEL INVENTORY & KRAFT WAREHOUSE
  // ==========================================
  renderReelInventory() {
    const state = window.PackFlowStore.state;
    const calc = window.PackFlowCalc;

    const totalReels = state.reels.length;
    const totalMt = state.reels.reduce((acc, r) => acc + (r.netWeightKg / 1000), 0).toFixed(2);
    const totalVal = state.reels.reduce((acc, r) => acc + (r.currentValue || 0), 0);

    const availableMt = state.reels
      .filter(r => r.qcStatus === "Passed" && !r.allocatedToJob)
      .reduce((acc, r) => acc + (r.netWeightKg / 1000), 0).toFixed(2);

    const reservedMt = state.reels
      .filter(r => r.allocatedToJob)
      .reduce((acc, r) => acc + (r.netWeightKg / 1000), 0).toFixed(2);

    const quarantineMt = state.reels
      .filter(r => r.qcStatus === "Quarantine")
      .reduce((acc, r) => acc + (r.netWeightKg / 1000), 0).toFixed(2);

    return `
      <!-- Top Action & Viewport Header -->
      <div class="card" style="margin-bottom:var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <div class="flex items-center gap-xs" style="margin-bottom:4px;">
              <span class="badge badge-draft">Raw Material Store #1</span>
              <span class="badge badge-success">
                <span class="telemetry-pulse-dot animate-pulse"></span> Reel Scale Calibrated: ±0.2 kg
              </span>
            </div>
            <h1 class="text-headline-lg font-bold">Paper Reel Inventory & Kraft Warehouse</h1>
            <p class="text-body-md text-on-surface-variant">Reel-level weight tracking, deckle width optimization, GSM grades, and moisture inspection telemetry</p>
          </div>
          <div class="flex flex-wrap items-center gap-sm">
            <button class="btn btn-outline" onclick="PackFlowPages.inventory.exportReelsCSV()">
              <span class="material-symbols-outlined text-[18px]">file_download</span>
              <span>Export CSV</span>
            </button>
            <button class="btn btn-outline" onclick="location.hash='#/inventory/deckle'">
              <span class="material-symbols-outlined text-[18px] text-primary">pie_chart</span>
              <span>Deckle Slitting Plan</span>
            </button>
            <button class="btn btn-primary" onclick="PackFlowPages.inventory.openInwardReelModal()">
              <span class="material-symbols-outlined text-[18px]">add_box</span>
              <span>Record Inward Reel (GRN)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Critical GSM Buffer Depletion Alert Strip -->
      <div class="card" style="background-color:var(--color-error-container); border:1px solid rgba(186,26,26,0.4); margin-bottom:var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div class="flex items-center gap-md">
            <div style="width:36px; height:36px; border-radius:var(--radius-lg); background:var(--color-error); color:#ffffff; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <span class="material-symbols-outlined text-[20px]">warning</span>
            </div>
            <div>
              <div class="flex items-center gap-xs">
                <strong class="text-headline-sm" style="color:var(--color-on-error-container);">Critical GSM Buffer Breach</strong>
                <span class="badge badge-error">Immediate PO Required</span>
              </div>
              <p class="text-body-md" style="color:var(--color-on-error-container); margin-top:2px;">
                120 GSM Fluting Paper (Deckle: 1600mm) is down to <strong>4.20 MT</strong> in stock. Reorder safety threshold is <strong>8.00 MT</strong>.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-sm">
            <button class="btn btn-destructive" onclick="PackFlowPages.production.triggerSinglePO('120 GSM Fluting', 30)">
              Trigger SOS PO (30 MT)
            </button>
          </div>
        </div>
      </div>

      <!-- KPI Metric Cards Bento Grid -->
      <div class="grid grid-cols-4 gap-md" style="margin-bottom:var(--space-md);">
        <div class="kpi-card">
          <div class="kpi-header">
            <span>Total Paper Reel Stock</span>
            <span class="material-symbols-outlined text-primary text-[20px]">album</span>
          </div>
          <div class="kpi-value font-tabular">${totalMt} <span style="font-size:14px; font-weight:normal;">MT (${totalReels} Reels)</span></div>
          <div class="kpi-subtext">
            <span>Inventory Valuation</span>
            <span class="font-tabular font-bold">${calc.formatCurrency(totalVal)}</span>
          </div>
          <div class="kpi-progress">
            <div class="kpi-progress-bar" style="width: 70%; background-color:var(--color-primary);"></div>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span>Available Free Stock</span>
            <span class="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
          </div>
          <div class="kpi-value font-tabular text-secondary">${availableMt} <span style="font-size:14px; font-weight:normal;">MT</span></div>
          <div class="kpi-subtext">
            <span>Ready for Allocation</span>
            <span class="badge badge-success">Ready</span>
          </div>
          <div class="text-body-sm text-secondary font-bold" style="margin-top:4px;">Across Bay A & B</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span>Production Reserved</span>
            <span class="material-symbols-outlined text-tertiary text-[20px]">event_seat</span>
          </div>
          <div class="kpi-value font-tabular">${reservedMt} <span style="font-size:14px; font-weight:normal;">MT</span></div>
          <div class="kpi-subtext">
            <span>Allocated to Active WOs</span>
            <span class="font-bold">Active Jobs</span>
          </div>
          <div class="text-body-sm text-muted" style="margin-top:4px;">Line 1 (5-Ply) Next: 42.8 MT</div>
        </div>

        <div class="kpi-card" style="border-left: 4px solid var(--color-error);">
          <div class="kpi-header" style="color:var(--color-error);">
            <span>QC Quarantine Hold</span>
            <span class="material-symbols-outlined text-error text-[20px]">biotech</span>
          </div>
          <div class="kpi-value font-tabular text-error">${quarantineMt} <span style="font-size:14px; font-weight:normal;">MT</span></div>
          <div class="kpi-subtext">
            <span>Lab Status</span>
            <span class="text-error font-bold">Moisture &gt; 8.8%</span>
          </div>
          <div class="text-body-sm text-error" style="margin-top:4px;">Retest Pending (Bay D-4)</div>
        </div>
      </div>

      <!-- Filter Bar Card -->
      <div class="table-filter-bar">
        <div class="table-search-box">
          <span class="material-symbols-outlined">search</span>
          <input type="text" id="reelSearchInput" placeholder="Reel ID, Mill, Grade, or Heat #..." onkeyup="PackFlowPages.inventory.filterReelsTable(this.value)">
        </div>
        <div class="flex items-center gap-sm">
          <select class="filter-select" id="reelGsmFilter" onchange="PackFlowPages.inventory.filterReelsTable()">
            <option value="">All GSM</option>
            <option value="120">120 GSM (Fluting)</option>
            <option value="140">140 GSM (Fluting)</option>
            <option value="150">150 GSM (Kraft)</option>
            <option value="180">180 GSM (Virgin)</option>
            <option value="200">200 GSM (Test Liner)</option>
            <option value="230">230 GSM (Duplex/Heavy)</option>
          </select>
          <select class="filter-select" id="reelDeckleFilter" onchange="PackFlowPages.inventory.filterReelsTable()">
            <option value="">All Deckles</option>
            <option value="1400">1400 mm</option>
            <option value="1600">1600 mm</option>
            <option value="1800">1800 mm</option>
            <option value="2000">2000 mm</option>
          </select>
        </div>
      </div>

      <!-- Main Reels Data Table Container -->
      <div class="table-wrapper" style="margin-bottom:var(--space-md);">
        <div class="table-responsive">
          <table class="table-master" id="reelsMasterTable">
            <thead>
              <tr>
                <th>Reel ID & QR</th>
                <th>Paper Grade & Mill</th>
                <th>GSM & Burst (BF)</th>
                <th class="text-right">Deckle</th>
                <th class="text-right">Gross / Core</th>
                <th class="text-right">Remaining Net</th>
                <th class="text-center">Moisture</th>
                <th class="text-right">Rate (₹/kg)</th>
                <th class="text-right">Current Value</th>
                <th>Storage Bay</th>
                <th class="text-center">QC Status</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${state.reels.map(r => `
                <tr>
                  <td>
                    <div class="flex items-center gap-xs">
                      <span class="material-symbols-outlined text-[18px] text-muted">qr_code_2</span>
                      <strong class="font-tabular text-primary">${r.id}</strong>
                    </div>
                    <div class="text-body-sm text-muted">Inward: ${calc.formatDate(r.inwardDate)}</div>
                  </td>
                  <td>
                    <div><strong>${r.paperGrade}</strong></div>
                    <div class="text-body-sm text-muted">${r.mill}</div>
                  </td>
                  <td>
                    <span class="spec-chip font-bold">${r.gsm} GSM</span>
                    <span class="spec-chip">${r.burstFactor} BF</span>
                  </td>
                  <td class="text-right font-tabular font-bold">${r.deckleMm} mm</td>
                  <td class="text-right font-tabular">${r.grossWeightKg} kg <span class="text-muted text-body-sm">(${r.coreWeightKg} kg)</span></td>
                  <td class="text-right font-tabular font-bold ${r.qcStatus === 'Quarantine' ? 'text-error' : 'text-secondary'}">
                    ${r.netWeightKg} kg
                  </td>
                  <td class="text-center">
                    <span class="badge ${r.moisturePct > 8.5 ? 'badge-error' : 'badge-success'}">
                      ${r.moisturePct}% ${r.moisturePct > 8.5 ? '(High Damp)' : '(Norm)'}
                    </span>
                  </td>
                  <td class="text-right font-tabular">₹${Number(r.ratePerKg).toFixed(2)}</td>
                  <td class="text-right font-tabular font-bold">${calc.formatCurrency(r.currentValue)}</td>
                  <td>
                    <div class="flex items-center gap-xs">
                      <span class="material-symbols-outlined text-[16px] text-muted">grid_on</span>
                      <strong>${r.warehouseBay}</strong>
                    </div>
                  </td>
                  <td class="text-center">
                    <span class="badge ${r.qcStatus === 'Passed' ? 'badge-success' : 'badge-error'}">
                      ${r.qcStatus}
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="row-actions">
                      <button class="row-action-btn text-primary" title="Issue to Line 1" onclick="PackFlowComponents.showToast('Issued ${r.id} to Corrugator Line 1', 'success')">
                        <span class="material-symbols-outlined text-[18px]">conveyor_belt</span>
                      </button>
                      <button class="row-action-btn text-secondary" title="Retest Moisture" onclick="PackFlowPages.inventory.retestReelMoisture('${r.id}')">
                        <span class="material-symbols-outlined text-[18px]">water_drop</span>
                      </button>
                      <button class="row-action-btn text-outline" title="Print QR Label" onclick="PackFlowPages.inventory.printReelTag('${r.id}')">
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

      <!-- Bottom Operational Panels: Deckle Slitting Trim Optimizer & GRN Log -->
      <div class="grid grid-cols-12 gap-lg">
        <!-- Deckle Slitting Optimizer (7 cols) -->
        <div style="grid-column: span 7 / span 7;">
          <div class="card">
            <div class="card-header">
              <div class="flex items-center gap-xs">
                <span class="material-symbols-outlined text-secondary text-[22px]">content_cut</span>
                <h3 class="card-title">Deckle Trim Waste Minimizer</h3>
              </div>
              <span class="badge badge-info">&lt;2.5% Target Trim Loss</span>
            </div>

            <!-- Interactive Visual Deckle Simulator -->
            <div style="background:var(--color-surface-container-low); padding:var(--space-md); border-radius:var(--radius-xl); display:flex; flex-direction:column; gap:var(--space-md);">
              <div class="flex justify-between items-center">
                <div>Target Sheet Cut Width: <strong class="font-tabular">575 mm</strong> (3-Out Cut)</div>
                <div>Selected Reel Deckle: <strong class="text-primary font-tabular">1800 mm</strong></div>
              </div>

              <!-- Visual Cut Bar -->
              <div>
                <div class="deckle-visual-bar">
                  <div class="deckle-slit-cut">Cut 1 (575mm)</div>
                  <div class="deckle-slit-cut">Cut 2 (575mm)</div>
                  <div class="deckle-slit-cut">Cut 3 (575mm)</div>
                  <div class="deckle-trim-waste">4.1%</div>
                </div>
                <div class="flex justify-between text-body-sm text-muted" style="margin-top:4px;">
                  <span>0 mm</span>
                  <span>Active Slit Width: 1,725 mm (3 × 575mm)</span>
                  <span>Trim Waste: 75 mm</span>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-sm text-center">
                <div style="background:#ffffff; padding:8px; border-radius:var(--radius-md); border:1px solid #e2e8f0;">
                  <span class="text-label-sm text-muted uppercase block">Current Loss</span>
                  <strong class="text-error font-tabular text-body-lg">4.16%</strong>
                  <span class="text-body-sm text-muted block">75 mm Trim</span>
                </div>
                <div style="background:#ffffff; padding:8px; border-radius:var(--radius-md); border:1px solid #e2e8f0;">
                  <span class="text-label-sm text-muted uppercase block">Suggested Deckle</span>
                  <strong class="text-secondary font-tabular text-body-lg">1750 mm</strong>
                  <span class="text-body-sm text-secondary block">In Bay B-03</span>
                </div>
                <div style="background:#ffffff; padding:8px; border-radius:var(--radius-md); border:1px solid #e2e8f0;">
                  <span class="text-label-sm text-muted uppercase block">Optimized Trim</span>
                  <strong class="text-secondary font-tabular text-body-lg">1.42%</strong>
                  <span class="text-body-sm text-secondary block">Saves ~ ₹18,400</span>
                </div>
              </div>

              <button class="btn btn-secondary w-full" onclick="PackFlowComponents.showToast('Reel allocation updated to 1750mm deckle! Trim loss reduced to 1.42%', 'success')">
                <span class="material-symbols-outlined text-[18px]">tune</span>
                <span>Switch Job to 1750mm Deckle (Save 2.74% Trim)</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Recent Inward GRN Receipts (5 cols) -->
        <div style="grid-column: span 5 / span 5;">
          <div class="card">
            <div class="card-header">
              <div class="flex items-center gap-xs">
                <span class="material-symbols-outlined text-primary text-[22px]">local_shipping</span>
                <h3 class="card-title">Recent Inward GRN Receipts</h3>
              </div>
            </div>

            <div class="flex flex-col gap-sm">
              <div style="background:var(--color-surface-container-low); padding:10px; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
                <div class="flex items-center gap-sm">
                  <span class="badge badge-success">✓</span>
                  <div>
                    <strong>GRN-2026-0842 • 24.5 MT</strong>
                    <div class="text-body-sm text-muted">Western Paper • 180 GSM Fluting</div>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-secondary font-bold text-body-sm">COA Verified</span>
                  <div class="text-body-sm text-muted">10:45 AM</div>
                </div>
              </div>

              <div style="background:var(--color-surface-container-low); padding:10px; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
                <div class="flex items-center gap-sm">
                  <span class="badge badge-success">✓</span>
                  <div>
                    <strong>GRN-2026-0841 • 42.0 MT</strong>
                    <div class="text-body-sm text-muted">Gujarat Kraft • 230 GSM Liner</div>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-secondary font-bold text-body-sm">COA Verified</span>
                  <div class="text-body-sm text-muted">08:15 AM</div>
                </div>
              </div>

              <div style="background:var(--color-error-container); padding:10px; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
                <div class="flex items-center gap-sm">
                  <span class="badge badge-error">!</span>
                  <div>
                    <strong style="color:var(--color-on-error-container);">GRN-2026-0840 • 14.2 MT</strong>
                    <div class="text-body-sm" style="color:var(--color-on-error-container);">Century Pulp • Damp Core Alert</div>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-error font-bold text-body-sm">Lab Held</span>
                  <div class="text-body-sm text-muted">Yesterday</div>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <span class="text-body-sm text-muted">All reels mapped to GSM/BF standard IS:1060</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  filterReelsTable(val) {
    const input = val !== undefined ? val.toLowerCase() : (document.getElementById("reelSearchInput")?.value || "").toLowerCase();
    const gsm = document.getElementById("reelGsmFilter")?.value;
    const deckle = document.getElementById("reelDeckleFilter")?.value;
    const rows = document.querySelectorAll("#reelsMasterTable tbody tr");

    rows.forEach(row => {
      const text = row.innerText.toLowerCase();
      const matchText = !input || text.includes(input);
      const matchGsm = !gsm || text.includes(gsm + " gsm");
      const matchDeckle = !deckle || text.includes(deckle + " mm");
      row.style.display = matchText && matchGsm && matchDeckle ? "" : "none";
    });
  },

  exportReelsCSV() {
    const state = window.PackFlowStore.state;
    const headers = ["Reel ID", "Paper Grade", "Mill", "GSM", "Burst Factor", "Deckle mm", "Gross Weight kg", "Net Weight kg", "Moisture %", "Rate per kg", "Value", "Bay", "QC Status"];
    const rows = state.reels.map(r => [
      r.id, r.paperGrade, r.mill, r.gsm, r.burstFactor, r.deckleMm, r.grossWeightKg, r.netWeightKg, r.moisturePct, r.ratePerKg, r.currentValue, r.warehouseBay, r.qcStatus
    ]);
    window.PackFlowComponents.exportTableToCSV("PackFlow_Reel_Inventory.csv", headers, rows);
  },

  openInwardReelModal() {
    const state = window.PackFlowStore.state;

    window.PackFlowComponents.openModal({
      title: "Record Inward Paper Reel (GRN)",
      size: "modal-lg",
      bodyHtml: `
        <form id="inwardReelForm">
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label required">Paper Grade</label>
              <select id="irGrade">
                <option value="Natural Kraft Liner" selected>Natural Kraft Liner</option>
                <option value="Virgin Kraft Top Liner">Virgin Kraft Top Liner</option>
                <option value="Semi-Chemical Fluting">Semi-Chemical Fluting</option>
                <option value="Test Liner Bleached">Test Liner Bleached</option>
                <option value="White Back Duplex">White Back Duplex</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label required">Paper Mill Supplier</label>
              <select id="irSupplier">
                ${state.suppliers.map(s => `
                  <option value="${s.name}">${s.name} (${s.city})</option>
                `).join("")}
              </select>
            </div>
          </div>
          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label required">Nominal GSM</label>
              <input type="number" id="irGsm" value="180" step="10">
            </div>
            <div class="form-group">
              <label class="form-label required">Deckle Width (mm)</label>
              <input type="number" id="irDeckle" value="1800" step="50">
            </div>
            <div class="form-group">
              <label class="form-label required">Burst Factor (BF)</label>
              <input type="number" id="irBf" value="24" step="2">
            </div>
          </div>
          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label required">Weighbridge Gross Weight (kg)</label>
              <input type="number" id="irGross" value="1250" step="10">
            </div>
            <div class="form-group">
              <label class="form-label required">Core Weight (kg)</label>
              <input type="number" id="irCore" value="20" step="1">
            </div>
            <div class="form-group">
              <label class="form-label required">Purchase Rate (₹/kg)</label>
              <input type="number" id="irRate" value="42.50" step="0.5">
            </div>
          </div>
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label required">Lab Moisture Test (%)</label>
              <input type="number" id="irMoisture" value="7.2" step="0.1">
            </div>
            <div class="form-group">
              <label class="form-label required">Assigned Warehouse Bay</label>
              <select id="irBay">
                <option value="Bay A-01">Bay A-01 (High Turnover)</option>
                <option value="Bay A-03" selected>Bay A-03 (High Turnover)</option>
                <option value="Bay B-02">Bay B-02 (Heavy Deckle)</option>
                <option value="Bay C-01">Bay C-01 (Fluting Store)</option>
                <option value="Bay D-04">Bay D-04 (QC Quarantine)</option>
              </select>
            </div>
          </div>
        </form>
      `,
      footerHtml: `
        <button class="btn btn-outline" onclick="PackFlowComponents.closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="PackFlowPages.inventory.submitInwardReel()">
          <span class="material-symbols-outlined text-[18px]">add_box</span>
          <span>Weigh & Inward to Reel Inventory</span>
        </button>
      `
    });
  },

  submitInwardReel() {
    const grade = document.getElementById("irGrade")?.value;
    const mill = document.getElementById("irSupplier")?.value;
    const gsm = Number(document.getElementById("irGsm")?.value || 180);
    const deckle = Number(document.getElementById("irDeckle")?.value || 1800);
    const bf = Number(document.getElementById("irBf")?.value || 24);
    const gross = Number(document.getElementById("irGross")?.value || 1250);
    const core = Number(document.getElementById("irCore")?.value || 20);
    const rate = Number(document.getElementById("irRate")?.value || 42.50);
    const moisture = Number(document.getElementById("irMoisture")?.value || 7.2);
    const bay = document.getElementById("irBay")?.value;

    const newReel = window.PackFlowStore.addReel({
      paperGrade: grade,
      mill,
      gsm,
      burstFactor: bf,
      deckleMm: deckle,
      grossWeightKg: gross,
      coreWeightKg: core,
      ratePerKg: rate,
      moisturePct: moisture,
      warehouseBay: bay,
      qcStatus: moisture > 8.8 ? "Quarantine" : "Passed"
    });

    window.PackFlowComponents.closeModal();
    window.PackFlowComponents.showToast(`Inwarded Reel ${newReel.id} (${newReel.netWeightKg} kg)!`, "success");
    location.hash = "#/inventory/reels";
  },

  retestReelMoisture(reelId) {
    window.PackFlowComponents.confirm({
      title: "Lab Moisture Retest",
      message: `Perform digital probe retest on Reel ${reelId}? Ambient lab condition: 23°C, 50% RH.`,
      confirmText: "Record Pass (7.1%)",
      onConfirm: () => {
        window.PackFlowStore.updateReelStatus(reelId, "Passed", 7.1);
        window.PackFlowComponents.showToast(`Reel ${reelId} retested: 7.1% Moisture (Passed QC)!`, "success");
      }
    });
  },

  printReelTag(reelId) {
    const reel = window.PackFlowStore.state.reels.find(r => r.id === reelId);
    if (!reel) return;
    const calc = window.PackFlowCalc;

    const html = `
      <div style="border:2px solid #000; padding:20px; font-family:var(--font-family-base); max-width:400px; margin:0 auto;">
        <div style="text-align:center; border-bottom:2px solid #000; padding-bottom:8px;">
          <h2 style="font-size:14pt; margin:0;">SHREE PACK INDUSTRIES</h2>
          <p style="font-size:9pt; margin:0;">RAW MATERIAL REEL BARCODE TAG</p>
        </div>
        <div style="margin:12px 0; text-align:center;">
          <h1 style="font-size:20pt; font-family:monospace; margin:4px 0;">${reel.id}</h1>
          <p style="font-size:10pt;">${reel.paperGrade}</p>
        </div>
        <table style="width:100%; font-size:10pt; border-collapse:collapse; margin-bottom:12px;">
          <tr><td><strong>GSM:</strong> ${reel.gsm} GSM</td><td><strong>BURST:</strong> ${reel.burstFactor} BF</td></tr>
          <tr><td><strong>DECKLE:</strong> ${reel.deckleMm} mm</td><td><strong>BAY:</strong> ${reel.warehouseBay}</td></tr>
          <tr><td><strong>GROSS WT:</strong> ${reel.grossWeightKg} kg</td><td><strong>CORE WT:</strong> ${reel.coreWeightKg} kg</td></tr>
          <tr><td><strong>NET WEIGHT:</strong></td><td><strong style="font-size:12pt;">${reel.netWeightKg} kg</strong></td></tr>
          <tr><td><strong>MOISTURE:</strong> ${reel.moisturePct}%</td><td><strong>QC:</strong> ${reel.qcStatus}</td></tr>
          <tr><td colspan="2"><strong>MILL:</strong> ${reel.mill}</td></tr>
        </table>
        <div style="text-align:center; font-size:8pt; border-top:1px solid #000; padding-top:6px;">
          INWARD DATE: ${calc.formatDate(reel.inwardDate)} • SCALE VERIFIED
        </div>
      </div>
    `;

    window.PackFlowComponents.openPrintView(`Tag_${reel.id}`, html);
  },

  // Finished Goods Warehouse
  renderFGWarehouse() {
    const state = window.PackFlowStore.state;

    return `
      <div class="card" style="margin-bottom: var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <h1 class="text-headline-lg font-bold">Finished Goods (FG) Warehouse & Pallet Dock</h1>
            <p class="text-body-md text-on-surface-variant">Quality-cleared corrugated cartons staged for truck loading and dispatch</p>
          </div>
          <div class="flex items-center gap-sm">
            <button class="btn btn-primary" onclick="location.hash='#/dispatch'">
              <span class="material-symbols-outlined text-[18px]">local_shipping</span>
              <span>Open Dispatch Schedule</span>
            </button>
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <div class="table-responsive">
          <table class="table-master">
            <thead>
              <tr>
                <th>FG ID & SKU</th>
                <th>Client Customer</th>
                <th>Order Reference</th>
                <th>Batch / Lot No</th>
                <th class="text-right">Total Finished</th>
                <th class="text-right">Allocated for Truck</th>
                <th class="text-right">Available Free</th>
                <th>Dock Location</th>
                <th class="text-center">QC Clearance</th>
                <th class="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              ${state.finishedGoods.map(fg => `
                <tr>
                  <td>
                    <strong class="text-primary font-tabular">${fg.id}</strong>
                    <div class="text-body-sm text-muted">${fg.sku}</div>
                  </td>
                  <td><strong>${fg.customer}</strong></td>
                  <td class="font-tabular">${fg.orderId}</td>
                  <td class="font-tabular">${fg.batchNo}</td>
                  <td class="text-right font-tabular font-bold">${fg.quantity.toLocaleString()}</td>
                  <td class="text-right font-tabular text-primary font-bold">${fg.allocatedQty.toLocaleString()}</td>
                  <td class="text-right font-tabular text-secondary font-bold">${fg.availableQty.toLocaleString()}</td>
                  <td><span class="spec-chip">${fg.warehouseBin}</span></td>
                  <td class="text-center">
                    <span class="badge ${fg.qcStatus === 'Approved' || fg.qcStatus === 'Passed' ? 'badge-success' : 'badge-warning'}">
                      ${fg.qcStatus}
                    </span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-outline btn-sm" onclick="location.hash='#/dispatch/new?so=${fg.orderId}'">
                      Schedule Dispatch
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
};
