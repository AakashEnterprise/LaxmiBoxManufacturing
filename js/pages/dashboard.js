/**
 * PackFlow ERP - Dashboard Page Renderers
 * Executive Dashboard & Factory Floor Live Telemetry
 */

window.PackFlowPages = window.PackFlowPages || {};

window.PackFlowPages.dashboard = {
  renderExecutiveDashboard() {
    const metrics = window.PackFlowStore.getMetrics();
    const state = window.PackFlowStore.state;
    const calc = window.PackFlowCalc;

    const pendingApprovals = state.approvals.filter(a => a.status === "Pending");

    return `
      <!-- Top Briefing Bar -->
      <div class="card" style="margin-bottom: var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <div class="flex items-center gap-xs" style="margin-bottom:4px;">
              <span class="badge badge-success badge-pill">
                <span class="telemetry-pulse-dot animate-pulse"></span> LIVE PLANT TELEMETRY
              </span>
              <span class="text-body-sm text-muted">• Sanand Unit #1</span>
            </div>
            <h1 class="text-headline-lg">Good morning, Rajesh. Here's today's plant overview.</h1>
            <p class="text-body-md text-on-surface-variant flex items-center gap-xs" style="margin-top:2px;">
              <span class="material-symbols-outlined text-[16px] text-primary">schedule</span>
              Unit 1: Sanand Industrial Estate, Ahmedabad • Shift 1 Active (06:00 - 14:00) • Live Telemetry Synchronized
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-sm">
            <div class="topbar-selector">
              <span class="material-symbols-outlined text-[18px] text-tertiary">calendar_month</span>
              <span class="text-label-md font-bold">Today: ${calc.formatDate(new Date())}</span>
            </div>
            <div class="topbar-selector">
              <span class="material-symbols-outlined text-[18px] text-tertiary">timelapse</span>
              <span class="text-label-md">Shift: <strong class="text-primary">Shift 1 (Day)</strong></span>
            </div>
            <button class="btn btn-outline" onclick="window.print()">
              <span class="material-symbols-outlined text-[18px] text-primary">picture_as_pdf</span>
              <span>Plant Brief</span>
            </button>
            <button class="btn btn-primary" onclick="location.hash='#/sales-orders/new'">
              <span class="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Create Quick Order</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 10 Primary Enterprise KPI Cards -->
      <div class="kpi-grid">
        <!-- KPI 1 -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span>DISPATCHED VALUE (TODAY)</span>
            <span class="material-symbols-outlined text-primary text-[18px]">local_shipping</span>
          </div>
          <div>
            <div class="kpi-value font-tabular">${metrics.dispatchedValueToday}</div>
            <div class="kpi-subtext">
              <span>Target: ₹42.00L</span>
              <span class="text-primary font-bold">91.5%</span>
            </div>
          </div>
          <div class="kpi-progress">
            <div class="kpi-progress-bar" style="width: 91.5%; background-color: var(--color-primary);"></div>
          </div>
        </div>

        <!-- KPI 2 -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span>MONTHLY NET REVENUE (MTD)</span>
            <span class="material-symbols-outlined text-secondary text-[18px]">trending_up</span>
          </div>
          <div>
            <div class="kpi-value font-tabular">${metrics.monthlyNetRevenue}</div>
            <div class="kpi-subtext">
              <span class="text-secondary font-bold">▲ +12.4%</span>
              <span class="text-muted">vs Prev MTD</span>
            </div>
          </div>
          <div class="text-body-sm text-muted">Run rate: ₹5.4 Cr projected</div>
        </div>

        <!-- KPI 3 -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span>PLANT OUTPUT (TODAY)</span>
            <span class="material-symbols-outlined text-tertiary text-[18px]">precision_manufacturing</span>
          </div>
          <div>
            <div class="kpi-value font-tabular">${metrics.plantOutputTodayMt} <span style="font-size:14px; font-weight:normal;">MT</span></div>
            <div class="kpi-subtext">
              <span>Boxes: 1,42,800 units</span>
              <span class="text-secondary font-bold">Target: 90 MT</span>
            </div>
          </div>
          <div class="kpi-progress">
            <div class="kpi-progress-bar" style="width: 94%; background-color: var(--color-secondary);"></div>
          </div>
        </div>

        <!-- KPI 4 -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span>OUTSTANDING RECEIVABLES</span>
            <span class="material-symbols-outlined text-error text-[18px]">account_balance_wallet</span>
          </div>
          <div>
            <div class="kpi-value font-tabular">${calc.formatCurrency(metrics.totalReceivables)}</div>
            <div class="kpi-subtext">
              <span class="text-error font-bold">&gt;45 Days Overdue</span>
              <span class="text-error font-bold font-tabular">₹14,80,000</span>
            </div>
          </div>
          <div class="text-body-sm text-error">3 accounts flagged</div>
        </div>

        <!-- KPI 5 -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span>JOBS IN ACTIVE WORK</span>
            <span class="material-symbols-outlined text-primary text-[18px]">assignment_turned_in</span>
          </div>
          <div>
            <div class="kpi-value font-tabular text-primary">${metrics.activeJobsCount} <span style="font-size:14px; color:var(--color-on-surface); font-weight:normal;">Work Orders</span></div>
            <div class="kpi-subtext">
              <span>Corrug: 2 • Flexo: 1</span>
              <span>QC: 1</span>
            </div>
          </div>
          <div class="text-body-sm text-muted">Est. Finish: 22:30 hrs</div>
        </div>

        <!-- KPI 6 -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span>CORRUGATION OEE</span>
            <span class="material-symbols-outlined text-secondary text-[18px]">speed</span>
          </div>
          <div>
            <div class="kpi-value font-tabular">${metrics.corrugationOee}</div>
            <div class="kpi-subtext">
              <span>Line 1: 92%</span>
              <span>Line 2: 84%</span>
            </div>
          </div>
          <div class="kpi-progress">
            <div class="kpi-progress-bar" style="width: 88.4%; background-color: var(--color-secondary);"></div>
          </div>
        </div>

        <!-- KPI 7 -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span>KRAFT REEL INVENTORY</span>
            <span class="material-symbols-outlined text-primary text-[18px]">album</span>
          </div>
          <div>
            <div class="kpi-value font-tabular">${metrics.totalReelStockMt} <span style="font-size:14px; font-weight:normal;">T</span></div>
            <div class="kpi-subtext">
              <span>Valuation: ${calc.formatCurrency(metrics.totalReelStockVal)}</span>
              <span class="badge badge-success">Buffer OK</span>
            </div>
          </div>
          <div class="text-body-sm text-muted">Coverage: ~11 Production Days</div>
        </div>

        <!-- KPI 8 -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span>FG READY FOR DISPATCH</span>
            <span class="material-symbols-outlined text-tertiary text-[18px]">inventory_2</span>
          </div>
          <div>
            <div class="kpi-value font-tabular">${metrics.fgBoxesCount.toLocaleString()} <span style="font-size:14px; font-weight:normal;">Boxes</span></div>
            <div class="kpi-subtext">
              <span>Staged in FG Docks</span>
              <span class="text-primary font-bold">6 Trucks Loading</span>
            </div>
          </div>
          <div class="kpi-progress">
            <div class="kpi-progress-bar" style="width: 76%; background-color: var(--color-primary);"></div>
          </div>
        </div>

        <!-- KPI 9 -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span>TRIM SCRAP / REJECTION</span>
            <span class="material-symbols-outlined text-secondary text-[18px]">recycling</span>
          </div>
          <div>
            <div class="kpi-value font-tabular text-secondary">${metrics.trimScrapPct}</div>
            <div class="kpi-subtext">
              <span>Threshold: &lt; 2.50%</span>
              <span class="badge badge-success">GREEN</span>
            </div>
          </div>
          <div class="text-body-sm text-secondary">Saved ₹78,000 kraft trim today</div>
        </div>

        <!-- KPI 10 -->
        <div class="kpi-card" style="background-color: var(--color-error-container); border-color: rgba(186,26,26,0.3);">
          <div class="kpi-header" style="color: var(--color-on-error-container);">
            <span style="font-weight:700;">CRITICAL APPROVALS</span>
            <span class="material-symbols-outlined text-error text-[18px]">priority_high</span>
          </div>
          <div>
            <div class="kpi-value font-tabular text-error">${metrics.pendingApprovalsCount} Pending</div>
            <div class="kpi-subtext" style="color: var(--color-on-error-container);">
              <span>2 POs • 1 Credit • 1 Price</span>
            </div>
          </div>
          <button class="btn btn-destructive btn-sm w-full" style="margin-top:6px;" onclick="location.hash='#/approvals'">
            Open Approvals Inbox
          </button>
        </div>
      </div>

      <!-- MAIN OPERATIONAL COCKPIT (12-Col Split) -->
      <div class="grid grid-cols-12 gap-lg">
        <!-- LEFT 8 COLS: Live Machines & Active Orders -->
        <div style="grid-column: span 8 / span 8; display:flex; flex-direction:column; gap: var(--space-lg);">
          <!-- SECTION 1: Live Machine Line Telemetry Grid -->
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <div class="flex items-center gap-xs">
                  <h2 class="card-title">Live Corrugation & Finishing Shop Floor Telemetry</h2>
                  <span class="badge badge-success animate-pulse">Synced 12s ago</span>
                </div>
                <span class="card-subtitle">Real-time sensor feed from Omron PLC & SCADA machine controllers</span>
              </div>
              <div class="flex items-center gap-sm">
                <span class="text-body-sm flex items-center gap-xs">
                  <span class="telemetry-pulse-dot" style="background-color:var(--color-secondary);"></span> 4 Running
                </span>
                <span class="text-body-sm flex items-center gap-xs">
                  <span class="telemetry-pulse-dot" style="background-color:var(--color-warning);"></span> 1 Setup
                </span>
              </div>
            </div>

            <!-- Machine Matrix Cards -->
            <div class="machine-matrix">
              ${state.machines.map(m => `
                <div class="machine-card">
                  <div>
                    <div class="machine-header">
                      <div>
                        <div class="machine-tag">${m.code}</div>
                        <h4 class="machine-name">${m.name}</h4>
                      </div>
                      <span class="badge ${m.status === 'Running' ? 'badge-success' : 'badge-warning'}">
                        ${m.status === 'Running' ? '<span class="telemetry-pulse-dot animate-ping" style="width:6px;height:6px;"></span>' : ''}
                        ${m.status}
                      </span>
                    </div>

                    <div class="machine-speed-gauge">
                      <span class="text-label-sm text-muted">Operating Speed:</span>
                      <span class="machine-speed-val font-tabular">${m.speed}</span>
                    </div>

                    <div class="machine-stats-list">
                      <div class="machine-stat-row">
                        <span class="text-muted">Active Job:</span>
                        <span class="text-primary font-bold font-tabular">${m.activeJob}</span>
                      </div>
                      <div class="machine-stat-row">
                        <span class="text-muted">Setup:</span>
                        <span>${m.fluteSetup}</span>
                      </div>
                      <div class="machine-stat-row">
                        <span class="text-muted">Deckle / Trim:</span>
                        <span class="font-tabular">${m.deckleTrim}</span>
                      </div>
                      <div class="machine-stat-row">
                        <span class="text-muted">Chief Operator:</span>
                        <span>${m.operator}</span>
                      </div>
                    </div>
                  </div>

                  <div style="background-color:#ffffff; padding:6px 10px; border-radius:var(--radius-md); border:1px solid #e2e8f0;">
                    <div class="flex justify-between text-label-sm text-muted" style="margin-bottom:3px;">
                      <span>Line OEE Efficiency</span>
                      <span class="font-bold text-on-surface font-tabular">${m.oeePct}%</span>
                    </div>
                    <div class="kpi-progress" style="margin:0;">
                      <div class="kpi-progress-bar" style="width:${m.oeePct}%; background-color:var(--color-secondary);"></div>
                    </div>
                  </div>
                </div>
              `).join("")}

              <!-- Utilities Boiler Card -->
              <div class="machine-card" style="background-color: var(--color-surface-container);">
                <div>
                  <div class="machine-header">
                    <div>
                      <div class="machine-tag" style="color:var(--color-outline);">UTILITIES & BOILER</div>
                      <h4 class="machine-name">Steam Boiler & Air Compressors</h4>
                    </div>
                    <span class="material-symbols-outlined text-[20px] text-primary">water_drop</span>
                  </div>
                  <div class="machine-stats-list" style="margin-top:10px;">
                    <div class="machine-stat-row">
                      <span class="text-muted">Steam Pressure:</span>
                      <strong class="font-tabular">11.8 bar (Optimum)</strong>
                    </div>
                    <div class="machine-stat-row">
                      <span class="text-muted">Starch Viscosity:</span>
                      <strong class="font-tabular">34 Stein-Hall sec</strong>
                    </div>
                    <div class="machine-stat-row">
                      <span class="text-muted">Power Load Factor:</span>
                      <strong class="text-secondary font-tabular">742 kVA (Nominal)</strong>
                    </div>
                  </div>
                </div>
                <div style="background-color:#ffffff; padding:6px 10px; border-radius:var(--radius-md); font-size:12px; display:flex; justify-content:space-between;">
                  <span class="text-muted">Preventive Maintenance:</span>
                  <strong class="text-on-surface">42 Hours</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- SECTION 2: Active High-Priority Job Orders Table -->
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <h2 class="card-title">Active Work Orders & High-Priority Delivery Track</h2>
                <span class="card-subtitle">Corrugated carton specifications, step progress, and dispatch status</span>
              </div>
              <div class="card-actions">
                <button class="btn btn-outline btn-sm" onclick="location.hash='#/production/jobs'">
                  <span>View All 18 Shop-Floor Job Cards</span>
                  <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table-master">
                <thead>
                  <tr>
                    <th>Job ID & Customer</th>
                    <th>Carton Specification Master</th>
                    <th class="text-right">Target</th>
                    <th class="text-right">Produced</th>
                    <th>Workflow Progress</th>
                    <th>Promise Date</th>
                    <th class="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.jobs.map(job => `
                    <tr onclick="location.hash='#/production/jobs/${job.id}'" style="cursor:pointer;">
                      <td>
                        <div class="font-tabular font-bold text-primary">${job.id}</div>
                        <div class="font-bold text-on-surface">${job.customer}</div>
                        <div class="text-body-sm text-muted">${job.salesOrderId}</div>
                      </td>
                      <td style="max-width:260px;">
                        <div class="font-medium text-on-surface truncate">${job.productName}</div>
                        <div class="flex gap-xs" style="margin-top:4px;">
                          <span class="spec-chip">${job.deckleMm}mm Deckle</span>
                          <span class="spec-chip">${job.workCenter}</span>
                        </div>
                      </td>
                      <td class="text-right font-tabular font-bold">${job.plannedQty.toLocaleString()}</td>
                      <td class="text-right font-tabular text-secondary font-bold">${job.producedQty.toLocaleString()}</td>
                      <td style="min-width:160px;">
                        <div class="flex justify-between text-label-sm text-muted" style="margin-bottom:3px;">
                          <span>${job.currentStage}</span>
                          <span class="font-bold text-on-surface font-tabular">${job.completionPct}%</span>
                        </div>
                        <div class="kpi-progress" style="margin:0;">
                          <div class="kpi-progress-bar" style="width:${job.completionPct}%; background-color:var(--color-primary);"></div>
                        </div>
                      </td>
                      <td class="font-tabular text-on-surface">${calc.formatDate(job.targetDate)}</td>
                      <td class="text-center">
                        <span class="badge ${job.completionPct >= 100 ? 'badge-success' : (job.completionPct > 50 ? 'badge-info' : 'badge-warning')}">
                          ${job.status}
                        </span>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- RIGHT 4 COLS: Approvals, Reel Stock Radar, Dispatch Fleets -->
        <div style="grid-column: span 4 / span 4; display:flex; flex-direction:column; gap: var(--space-lg);">
          <!-- URGENT APPROVALS ACTION DRAWER CARD -->
          <div class="card" style="border-left: 4px solid var(--color-error);">
            <div class="card-header">
              <div class="flex items-center gap-xs">
                <span class="material-symbols-outlined text-error text-[22px]">notification_important</span>
                <h3 class="card-title">Urgent Approvals (${pendingApprovals.length})</h3>
              </div>
              <span class="badge badge-error">Action Needed</span>
            </div>
            <p class="text-body-sm text-on-surface-variant" style="margin-bottom:var(--space-md);">
              Decisions blocking raw material procurement, credit overrides, and production dispatch.
            </p>

            <div class="flex flex-col gap-sm">
              ${pendingApprovals.map(appr => `
                <div style="background-color:var(--color-surface-container-low); padding:var(--space-md); border-radius:var(--radius-lg); border:1px solid #e2e8f0;">
                  <div class="flex justify-between items-start">
                    <div>
                      <span class="text-label-sm font-bold text-primary">${appr.type}</span>
                      <h4 class="text-body-md font-bold text-on-surface" style="margin-top:2px;">${appr.title}</h4>
                      <div class="font-tabular text-body-sm text-muted" style="margin-top:2px;">${appr.amount} • Ref: ${appr.reference}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-xs" style="margin-top:var(--space-sm);">
                    <button class="btn btn-primary btn-sm flex-1" onclick="PackFlowStore.handleApproval('${appr.id}', 'approve'); PackFlowComponents.showToast('Approved ${appr.title}', 'success');">
                      Approve
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="PackFlowStore.handleApproval('${appr.id}', 'reject', 'Management rejected'); PackFlowComponents.showToast('Rejected request', 'warning');">
                      Reject
                    </button>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- RAW MATERIAL PAPER REEL RADAR -->
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <h3 class="card-title">Paper Reel Stock Radar</h3>
                <span class="card-subtitle">GSM stock levels, deckle availability & buffers</span>
              </div>
              <span class="material-symbols-outlined text-muted text-[20px]">layers</span>
            </div>

            <div class="flex flex-col gap-sm">
              <div style="background-color:var(--color-surface-container-low); padding:10px; border-radius:var(--radius-md);">
                <div class="flex justify-between items-center" style="margin-bottom:4px;">
                  <span class="text-body-sm font-bold">120 GSM Semi-Chemical Fluting</span>
                  <span class="font-tabular font-bold">124.0 MT</span>
                </div>
                <div class="kpi-progress"><div class="kpi-progress-bar" style="width:78%; background-color:var(--color-secondary);"></div></div>
                <div class="flex justify-between text-label-sm text-muted" style="margin-top:4px;">
                  <span>Buffer: 14 Days</span>
                  <span class="text-secondary font-bold">Reorder Trigger: &lt; 35 MT</span>
                </div>
              </div>

              <div style="background-color:var(--color-surface-container-low); padding:10px; border-radius:var(--radius-md);">
                <div class="flex justify-between items-center" style="margin-bottom:4px;">
                  <span class="text-body-sm font-bold">150 GSM Golden Kraft Liner</span>
                  <span class="font-tabular font-bold">148.5 MT</span>
                </div>
                <div class="kpi-progress"><div class="kpi-progress-bar" style="width:85%; background-color:var(--color-primary);"></div></div>
                <div class="flex justify-between text-label-sm text-muted" style="margin-top:4px;">
                  <span>Buffer: 18 Days</span>
                  <span class="text-secondary font-bold">Reorder Trigger: &lt; 40 MT</span>
                </div>
              </div>

              <div style="background-color:var(--color-surface-container-low); padding:10px; border-radius:var(--radius-md);">
                <div class="flex justify-between items-center" style="margin-bottom:4px;">
                  <span class="text-body-sm font-bold">180 GSM Virgin Top Kraft (24 BF)</span>
                  <span class="font-tabular font-bold text-warning">82.0 MT</span>
                </div>
                <div class="kpi-progress"><div class="kpi-progress-bar" style="width:48%; background-color:var(--color-warning);"></div></div>
                <div class="flex justify-between text-label-sm text-muted" style="margin-top:4px;">
                  <span class="text-warning font-bold">Buffer: 5.5 Days left</span>
                  <span class="text-primary font-bold">PO Pending: 80 MT</span>
                </div>
              </div>

              <div style="background-color:var(--color-surface-container-low); padding:10px; border-radius:var(--radius-md);">
                <div class="flex justify-between items-center" style="margin-bottom:4px;">
                  <span class="text-body-sm font-bold">230 GSM White Back Duplex</span>
                  <span class="font-tabular font-bold">58.0 MT</span>
                </div>
                <div class="kpi-progress"><div class="kpi-progress-bar" style="width:62%; background-color:var(--color-tertiary);"></div></div>
                <div class="flex justify-between text-label-sm text-muted" style="margin-top:4px;">
                  <span>Buffer: 9 Days</span>
                  <span class="text-secondary font-bold">Reorder Trigger: &lt; 20 MT</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <span class="flex items-center gap-xs">
                <span class="material-symbols-outlined text-[16px] text-primary">barcode_scanner</span>
                Reels in Yard: 374 Spools
              </span>
              <a href="#/inventory/reels" class="text-primary font-bold" style="text-decoration:none;">Reel Store Master →</a>
            </div>
          </div>

          <!-- TODAY'S DISPATCH FLEETS LIST -->
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <h3 class="card-title">Today's Dispatch Fleets (6 Scheduled)</h3>
                <span class="card-subtitle">Vehicles, e-way bills and delivery schedules</span>
              </div>
              <span class="material-symbols-outlined text-muted text-[20px]">local_shipping</span>
            </div>

            <div class="flex flex-col gap-sm">
              ${state.dispatches.map(d => `
                <div style="background-color:var(--color-surface-container-low); padding:10px; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <div class="flex items-center gap-xs">
                      <strong class="font-tabular text-body-md">${d.vehicleNo}</strong>
                      <span class="badge ${d.status.includes('Hold') ? 'badge-error' : (d.status.includes('Loading') ? 'badge-info' : 'badge-success')}">
                        ${d.status}
                      </span>
                    </div>
                    <div class="text-body-sm text-on-surface-variant" style="margin-top:2px;">
                      ${d.customer} • ${d.quantity.toLocaleString()} Boxes
                    </div>
                    <div class="text-body-sm text-muted font-tabular">
                      E-Way Bill: ${d.ewayBillNo} • ${d.transporter}
                    </div>
                  </div>
                  <div>
                    <span class="material-symbols-outlined ${d.status.includes('Hold') ? 'text-error' : 'text-secondary'} text-[20px]">
                      ${d.status.includes('Hold') ? 'block' : 'check_circle'}
                    </span>
                  </div>
                </div>
              `).join("")}
            </div>

            <div class="card-footer">
              <span>Total Dispatched Today: 42.8 MT</span>
              <a href="#/dispatch" class="text-primary font-bold" style="text-decoration:none;">Full Dispatch Schedule →</a>
            </div>
          </div>
        </div>
      </div>

      <!-- BOTTOM FINANCIAL AGEING STRIP -->
      <div class="card" style="margin-top:var(--space-md);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <div class="flex items-center gap-xs">
              <span class="material-symbols-outlined text-primary text-[20px]">account_balance</span>
              <h3 class="text-headline-sm">Receivables Health & Credit Exposure Matrix</h3>
            </div>
            <p class="text-body-sm text-on-surface-variant">Outstanding billing total ${calc.formatCurrency(metrics.totalReceivables)} across commercial packaging clients</p>
          </div>
          <div class="flex flex-wrap items-center gap-md">
            <div style="background-color:var(--color-surface-container-low); padding:8px 14px; border-radius:var(--radius-md);">
              <span class="text-label-sm text-muted uppercase block">Current (0-30 Days)</span>
              <span class="text-body-md font-tabular font-bold text-secondary">₹1,18,40,000</span>
              <span class="text-body-sm text-muted block">72.1% of ledger</span>
            </div>
            <div style="background-color:var(--color-surface-container-low); padding:8px 14px; border-radius:var(--radius-md);">
              <span class="text-label-sm text-muted uppercase block">Due (31-45 Days)</span>
              <span class="text-body-md font-tabular font-bold text-warning">₹31,00,000</span>
              <span class="text-body-sm text-muted block">18.9% of ledger</span>
            </div>
            <div style="background-color:var(--color-error-container); padding:8px 14px; border-radius:var(--radius-md);">
              <span class="text-label-sm text-error uppercase font-bold block">Overdue (&gt;45 Days)</span>
              <span class="text-body-md font-tabular font-bold text-error">₹14,80,000</span>
              <span class="text-body-sm text-error block">9.0% • Follow-up Active</span>
            </div>
            <button class="btn btn-outline" onclick="location.hash='#/finance/receivables'">
              <span class="material-symbols-outlined text-[18px]">receipt_long</span>
              <span>Customer Ledgers</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  renderFactoryLive() {
    const state = window.PackFlowStore.state;
    const calc = window.PackFlowCalc;

    const stages = [
      { id: "stage-1", name: "1. Queued / Staged", count: 2, dotClass: "bg-surface-container-high" },
      { id: "stage-2", name: "2. Corrugation (5P/3P)", count: 2, dotClass: "bg-secondary animate-ping" },
      { id: "stage-3", name: "3. Flexo & Slotting", count: 2, dotClass: "bg-primary" },
      { id: "stage-4", name: "4. Die-Cut & Crease", count: 1, dotClass: "bg-tertiary" },
      { id: "stage-5", name: "5. Folding & Stitch", count: 1, dotClass: "bg-primary" },
      { id: "stage-6", name: "6. QC & Bundling", count: 1, dotClass: "bg-secondary" }
    ];

    return `
      <!-- Action Banner -->
      <div class="card" style="margin-bottom:var(--space-md); background-color:var(--color-surface-container-low);">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <div>
            <div class="flex items-center gap-xs">
              <h1 class="text-headline-lg">Factory Floor Live Operations</h1>
              <span class="badge badge-success badge-pill">
                <span class="telemetry-pulse-dot animate-pulse"></span> LIVE 15s PULSE
              </span>
            </div>
            <p class="text-body-md text-on-surface-variant">Real-time Corrugation, Printing, Die-Cutting, and Finishing shop-floor execution stream</p>
          </div>
          <div class="flex flex-wrap items-center gap-sm">
            <div class="topbar-selector" style="background:#ffffff;">
              <span class="material-symbols-outlined text-[18px] text-primary">schedule</span>
              <span>Shift: <strong>Shift 1: General (06:00 - 14:00)</strong></span>
            </div>
            <div class="topbar-selector" style="background:#ffffff;">
              <span class="material-symbols-outlined text-[18px] text-tertiary">person</span>
              <span>Floor Supt: <strong>Mahesh Sharma</strong></span>
            </div>
            <button class="btn btn-outline" onclick="PackFlowComponents.showToast('Telemetry refreshed from SCADA', 'info')">
              <span class="material-symbols-outlined text-[18px] text-secondary">sync</span>
              <span>Auto-Sync</span>
            </button>
            <button class="btn btn-destructive btn-sm" onclick="PackFlowComponents.confirm({title:'E-Stop Log', message:'Emergency Machine Halt Log record opened. No critical stoppages active.', confirmText:'Acknowledge'})">
              <span class="material-symbols-outlined text-[18px]">eject</span>
              <span>E-Stop Log</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Top Telemetry & Metric Strip -->
      <div class="grid grid-cols-4 gap-md" style="margin-bottom:var(--space-md);">
        <div class="kpi-card">
          <div class="kpi-header">
            <span>Line Availability</span>
            <span class="material-symbols-outlined text-primary text-[20px]">precision_manufacturing</span>
          </div>
          <div class="kpi-value font-tabular">4 / 5 <span style="font-size:14px; color:var(--color-secondary);">80% Active</span></div>
          <div class="kpi-progress"><div class="kpi-progress-bar" style="width:80%; background-color:var(--color-primary);"></div></div>
          <div class="kpi-subtext" style="margin-top:6px;">Line #2 in Preventive Maint. • Target: 90%</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span>Plant Speed & Output</span>
            <span class="material-symbols-outlined text-primary text-[20px]">speed</span>
          </div>
          <div class="kpi-value font-tabular">18,200 <span style="font-size:14px; font-weight:normal;">RM / Hr</span></div>
          <div class="text-body-sm text-secondary font-bold">+840 RM/Hr vs Average</div>
          <div class="kpi-subtext" style="margin-top:6px;">Max Rating: 22,000 RM</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-header">
            <span>Yield vs Trim Waste</span>
            <span class="material-symbols-outlined text-secondary text-[20px]">pie_chart</span>
          </div>
          <div class="kpi-value font-tabular text-secondary">97.8% <span style="font-size:14px; color:var(--color-error);">Scrap 2.2%</span></div>
          <div class="kpi-progress"><div class="kpi-progress-bar" style="width:97.8%; background-color:var(--color-secondary);"></div></div>
          <div class="kpi-subtext" style="margin-top:6px;">Kraft Trim: 1.8 Tonnes • Optimal &lt; 2.5%</div>
        </div>

        <div class="kpi-card" style="border-left: 4px solid var(--color-error);">
          <div class="kpi-header" style="color:var(--color-error);">
            <span>Active Bottleneck</span>
            <span class="badge badge-error">4 Jobs Queue</span>
          </div>
          <div class="text-headline-sm font-bold" style="margin:4px 0;">Flexo Printing Line #2</div>
          <div class="text-body-sm text-on-surface-variant">Delay: Awaiting Plate Mounting & Color Match (42m wait)</div>
        </div>
      </div>

      <!-- 6-Stage Kanban Production Workflow Board -->
      <div class="card" style="margin-bottom:var(--space-md);">
        <div class="card-header">
          <div class="flex items-center gap-xs">
            <span class="material-symbols-outlined text-primary text-[22px]">view_kanban</span>
            <h2 class="card-title">Live Shop Floor Routing Matrix</h2>
            <span class="badge badge-info">${state.jobs.length} Active Production Batches</span>
          </div>
          <div class="flex items-center gap-sm text-body-sm text-muted">
            <span class="flex items-center gap-xs"><span class="telemetry-pulse-dot" style="background:var(--color-secondary);"></span> In Progress</span>
            <span class="flex items-center gap-xs"><span class="telemetry-pulse-dot" style="background:var(--color-outline);"></span> Staged</span>
          </div>
        </div>

        <div class="kanban-board">
          ${stages.map((stg, idx) => {
            const stageJobs = state.jobs.filter(j => {
              if (idx === 0) return j.completionPct < 15;
              if (idx === 1) return j.currentStage.includes("Corrugation");
              if (idx === 2) return j.currentStage.includes("Flexo");
              if (idx === 3) return j.currentStage.includes("Die");
              if (idx === 4) return j.currentStage.includes("Folding");
              return j.currentStage.includes("QC");
            });

            return `
              <div class="kanban-col">
                <div class="kanban-col-header">
                  <div class="flex items-center gap-xs">
                    <span class="telemetry-pulse-dot ${stg.dotClass}" style="width:7px; height:7px;"></span>
                    <span>${stg.name}</span>
                  </div>
                  <span class="badge badge-draft">${stageJobs.length}</span>
                </div>

                <div class="flex flex-col gap-sm" style="flex:1;">
                  ${stageJobs.length === 0 ? `
                    <div style="padding:20px; text-align:center; color:var(--color-outline); font-size:12px;">
                      No jobs currently at this station
                    </div>
                  ` : stageJobs.map(job => `
                    <div class="kanban-job-card" onclick="location.hash='#/production/jobs/${job.id}'">
                      <div class="flex justify-between items-center">
                        <span class="font-tabular font-bold text-primary">${job.id}</span>
                        <span class="text-label-sm text-muted">${job.salesOrderId}</span>
                      </div>
                      <h4 class="text-body-md font-bold text-on-surface truncate">${job.productName}</h4>
                      <div class="text-body-sm text-on-surface-variant">${job.customer}</div>

                      <div class="flex gap-xs" style="margin:4px 0;">
                        <span class="spec-chip">${job.deckleMm}mm Deckle</span>
                        <span class="spec-chip">${job.workCenter}</span>
                      </div>

                      <div style="margin-top:6px;">
                        <div class="flex justify-between text-label-sm text-muted" style="margin-bottom:2px;">
                          <span>Output:</span>
                          <span class="font-tabular font-bold text-secondary">${job.producedQty.toLocaleString()} / ${job.plannedQty.toLocaleString()}</span>
                        </div>
                        <div class="kpi-progress">
                          <div class="kpi-progress-bar" style="width:${job.completionPct}%; background-color:var(--color-primary);"></div>
                        </div>
                      </div>

                      <div class="flex justify-between items-center text-body-sm text-muted" style="margin-top:6px; border-top:1px solid #f1f5f9; padding-top:4px;">
                        <span>Op: ${job.supervisor}</span>
                        <span class="text-primary font-bold">Action →</span>
                      </div>
                    </div>
                  `).join("")}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- Split Bottom Telemetry & Downtime Panel -->
      <div class="grid grid-cols-12 gap-lg">
        <!-- Machine Telemetry Table (7 cols) -->
        <div style="grid-column: span 7 / span 7;">
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <h3 class="card-title">Live Machine Telemetry & Line Conditions</h3>
                <span class="card-subtitle">Sanand Plant #1 Sensor Network</span>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table-master">
                <thead>
                  <tr>
                    <th>Machine & Asset ID</th>
                    <th>Status</th>
                    <th class="text-right">Speed</th>
                    <th class="text-right">Temp / Steam</th>
                    <th>Operator</th>
                    <th class="text-right">OEE</th>
                  </tr>
                </thead>
                <tbody>
                  ${state.machines.map(m => `
                    <tr>
                      <td>
                        <strong class="text-on-surface">${m.name}</strong>
                        <div class="text-body-sm text-muted">${m.code}</div>
                      </td>
                      <td>
                        <span class="badge ${m.status === 'Running' ? 'badge-success' : 'badge-warning'}">
                          ${m.status}
                        </span>
                      </td>
                      <td class="text-right font-tabular font-bold">${m.speed}</td>
                      <td class="text-right font-tabular text-on-surface">11.4 bar / 176°C</td>
                      <td>${m.operator}</td>
                      <td class="text-right font-tabular text-secondary font-bold">${m.oeePct}%</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Downtime & Root Cause Log (5 cols) -->
        <div style="grid-column: span 5 / span 5;">
          <div class="card">
            <div class="card-header">
              <div class="card-title-group">
                <h3 class="card-title">Shift Downtime & Root Cause</h3>
                <span class="card-subtitle">Recorded micro-stoppages</span>
              </div>
              <span class="badge badge-error">35 Min Lost</span>
            </div>

            <div class="flex flex-col gap-sm">
              <div style="background-color:var(--color-surface-container-low); padding:10px; border-radius:var(--radius-md);">
                <div class="flex justify-between items-center">
                  <strong class="text-body-md">Paper Web Break at Reel Stand #2</strong>
                  <span class="text-error font-bold font-tabular text-label-sm">12 Min Lost</span>
                </div>
                <p class="text-body-sm text-on-surface-variant" style="margin-top:2px;">Line 1: High tension tear on 140 GSM Fluting reel #RL-9921. Splicing re-threaded.</p>
                <div class="flex justify-between text-label-sm text-muted" style="margin-top:4px;">
                  <span>08:14 - 08:26 AM • Raw Material Defect</span>
                  <span class="text-secondary font-bold">Resolved</span>
                </div>
              </div>

              <div style="background-color:var(--color-surface-container-low); padding:10px; border-radius:var(--radius-md);">
                <div class="flex justify-between items-center">
                  <strong class="text-body-md">Ink Viscosity & pH Calibration</strong>
                  <span class="text-on-surface-variant font-bold font-tabular text-label-sm">8 Min Lost</span>
                </div>
                <p class="text-body-sm text-on-surface-variant" style="margin-top:2px;">Flexo #1: Cyan ink foaming on barcode zone. Water addition + defoamer dosage.</p>
                <div class="flex justify-between text-label-sm text-muted" style="margin-top:4px;">
                  <span>09:42 - 09:50 AM • Process Parameter</span>
                  <span class="text-secondary font-bold">Resolved</span>
                </div>
              </div>

              <div style="background-color:var(--color-surface-container-low); padding:10px; border-radius:var(--radius-md);">
                <div class="flex justify-between items-center">
                  <strong class="text-body-md">Rotary Die Stripping Finger Realignment</strong>
                  <span class="text-on-surface-variant font-bold font-tabular text-label-sm">15 Min Lost</span>
                </div>
                <p class="text-body-sm text-on-surface-variant" style="margin-top:2px;">Die-Cutter #2: Waste trim jamming in ejection chamber on 500x300 produce tray run.</p>
                <div class="flex justify-between text-label-sm text-muted" style="margin-top:4px;">
                  <span>10:15 - 10:30 AM • Tooling & Setup</span>
                  <span class="text-secondary font-bold">Resolved</span>
                </div>
              </div>
            </div>

            <button class="btn btn-outline btn-sm w-full" style="margin-top:var(--space-md);" onclick="PackFlowComponents.showToast('Micro-stop logging dialog opened', 'info')">
              <span class="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Log Unplanned Micro-Stop</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }
};
