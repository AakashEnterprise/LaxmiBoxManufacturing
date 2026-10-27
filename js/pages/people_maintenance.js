/**
 * PackFlow ERP - Workforce, Maintenance & Waste Management Pages
 * Employees, Shift Rosters, Machine Register, Preventive Maintenance, and Scrap Tracking.
 */

window.PackFlowPages = window.PackFlowPages || {};

window.PackFlowPages.people = {
  renderEmployees() {
    const state = window.PackFlowStore.state;

    return `
      <div class="card" style="margin-bottom: var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <h1 class="text-headline-lg font-bold">Workforce Directory & Shift Rosters</h1>
            <p class="text-body-md text-on-surface-variant">Plant managers, machine operators, shift supervisors, and attendance tracking</p>
          </div>
          <div class="flex items-center gap-sm">
            <button class="btn btn-primary" onclick="PackFlowComponents.showToast('Employee onboarding modal opened', 'info')">
              <span class="material-symbols-outlined text-[18px]">person_add</span>
              <span>+ Add Employee</span>
            </button>
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <div class="table-responsive">
          <table class="table-master">
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Employee Name</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Shift Roster</th>
                <th class="text-center">Today's Attendance</th>
              </tr>
            </thead>
            <tbody>
              ${state.employees.map(e => `
                <tr>
                  <td><strong class="text-primary font-tabular">${e.id}</strong></td>
                  <td><strong>${e.name}</strong></td>
                  <td>${e.designation}</td>
                  <td><span class="spec-chip">${e.department}</span></td>
                  <td>${e.shift}</td>
                  <td class="text-center">
                    <span class="badge badge-success">Present</span>
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

window.PackFlowPages.maintenance = {
  renderMaintenance() {
    const state = window.PackFlowStore.state;

    return `
      <div class="card" style="margin-bottom: var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <div class="flex items-center gap-xs">
              <span class="material-symbols-outlined text-primary text-[24px]">build</span>
              <h1 class="text-headline-lg font-bold">Plant Equipment & Preventive Maintenance</h1>
            </div>
            <p class="text-body-md text-on-surface-variant">Machine registry, calibration schedules, lubrication tickets, and breakdown resolution</p>
          </div>
          <div class="flex items-center gap-sm">
            <button class="btn btn-destructive" onclick="PackFlowPages.maintenance.openBreakdownModal()">
              <span class="material-symbols-outlined text-[18px]">eject</span>
              <span>Log Breakdown Ticket</span>
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-md" style="margin-bottom:var(--space-md);">
        ${state.machines.map(m => `
          <div class="card">
            <div class="card-header">
              <span class="machine-tag">${m.code}</span>
              <span class="badge ${m.status === 'Running' ? 'badge-success' : 'badge-warning'}">${m.status}</span>
            </div>
            <h3 class="card-title">${m.name}</h3>
            <p class="text-body-sm text-muted">Type: ${m.type} • Op: ${m.operator}</p>

            <div style="background:var(--color-surface-container-low); padding:10px; border-radius:var(--radius-md); margin:10px 0; font-size:13px;">
              <div class="flex justify-between"><span>Nominal Speed:</span><strong class="font-tabular">${m.speed}</strong></div>
              <div class="flex justify-between" style="margin-top:4px;"><span>Line OEE:</span><strong class="font-tabular text-secondary">${m.oeePct}%</strong></div>
            </div>

            <div class="card-footer">
              <span class="text-body-sm text-muted">Next Service: In 4 Days</span>
              <button class="btn btn-outline btn-sm" onclick="PackFlowComponents.showToast('Preventive checklist logged for ${m.name}', 'success')">
                Service Checklist
              </button>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  },

  openBreakdownModal() {
    window.PackFlowComponents.openModal({
      title: "Log Unplanned Breakdown Ticket",
      size: "modal-md",
      bodyHtml: `
        <div class="form-group">
          <label class="form-label required">Affected Asset</label>
          <select id="bdMachine">
            <option value="LINE-01">Corrugator 2200mm High Speed (5-Ply)</option>
            <option value="LINE-02">3-Ply Single Facer Line B</option>
            <option value="CONV-01">4-Color Flexo Printer Slotter</option>
            <option value="DIE-01">Bobst Novacut 1600 Die-Cutter</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label required">Root Cause & Symptom</label>
          <input type="text" id="bdSymptom" placeholder="e.g. Steam condensate valve jamming / Belt slippage">
        </div>
        <div class="form-group">
          <label class="form-label required">Priority Level</label>
          <select id="bdPriority">
            <option value="Critical Line Stoppage" selected>Critical Line Stoppage</option>
            <option value="Minor Process Degradation">Minor Process Degradation</option>
          </select>
        </div>
      `,
      footerHtml: `
        <button class="btn btn-outline" onclick="PackFlowComponents.closeModal()">Cancel</button>
        <button class="btn btn-destructive" onclick="PackFlowComponents.closeModal(); PackFlowComponents.showToast('Breakdown ticket logged & dispatched to maintenance crew!', 'warning');">
          Submit Breakdown Ticket
        </button>
      `
    });
  }
};

window.PackFlowPages.waste = {
  renderWaste() {
    return `
      <div class="card" style="margin-bottom: var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <div class="flex items-center gap-xs">
              <span class="material-symbols-outlined text-secondary text-[24px]">recycling</span>
              <h1 class="text-headline-lg font-bold">Scrap & Waste Management</h1>
            </div>
            <p class="text-body-md text-on-surface-variant">Kraft trim losses, setup rejections, baling press compaction, and recycling resale revenue</p>
          </div>
          <div class="flex items-center gap-sm">
            <button class="btn btn-outline" onclick="PackFlowComponents.showToast('Baling press lot sold to paper mill', 'success')">
              <span class="material-symbols-outlined text-[18px]">sell</span>
              <span>Record Scrap Sale</span>
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-md" style="margin-bottom:var(--space-md);">
        <div class="kpi-card">
          <div class="kpi-header">Trim Waste Rate</div>
          <div class="kpi-value font-tabular text-secondary">2.14%</div>
          <div class="text-body-sm text-secondary">Threshold &lt; 2.50% (Green)</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header">Today's Scrap Baled</div>
          <div class="kpi-value font-tabular">1,820 <span style="font-size:14px; font-weight:normal;">kg</span></div>
          <div class="text-body-sm text-muted">Bales: 4 Compressed Lots</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header">Scrap Recovery Rate</div>
          <div class="kpi-value font-tabular">₹18.50 <span style="font-size:14px; font-weight:normal;">/ kg</span></div>
          <div class="text-body-sm text-muted">Sold to Gujarat Kraft Mill</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-header">Salvage Revenue</div>
          <div class="kpi-value font-tabular text-secondary">₹33,670</div>
          <div class="text-body-sm text-secondary">Credited to Expense Ledger</div>
        </div>
      </div>
    `;
  }
};
