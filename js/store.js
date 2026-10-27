/**
 * PackFlow ERP - Centralized Reactive State Store & Persistence
 * Manages LocalStorage persistence, state transitions, and event dispatching.
 */

class PackFlowStore {
  constructor() {
    this.STORAGE_KEY = "PACKFLOW_ERP_STATE_V1";
    this.subscribers = [];
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load from localStorage, initializing fresh state.", e);
    }
    return JSON.parse(JSON.stringify(window.PackFlowSeedData));
  }

  saveState() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
    this.notify();
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.subscribers.forEach(cb => {
      try {
        cb(this.state);
      } catch (e) {
        console.error("Store subscriber error:", e);
      }
    });
  }

  resetDemoData() {
    this.state = JSON.parse(JSON.stringify(window.PackFlowSeedData));
    localStorage.removeItem(this.STORAGE_KEY);
    this.saveState();
  }

  // ==========================================
  // CUSTOMER ACTIONS
  // ==========================================
  addCustomer(customerData) {
    const id = "CUST-" + String(this.state.customers.length + 1).padStart(3, "0");
    const newCustomer = {
      id,
      code: "CUST-" + (customerData.name ? customerData.name.substring(0, 3).toUpperCase() : "NEW"),
      outstandingBalance: 0,
      status: "Active",
      ...customerData
    };
    this.state.customers.unshift(newCustomer);
    this.saveState();
    return newCustomer;
  }

  // ==========================================
  // QUOTATION & SALES ACTIONS
  // ==========================================
  addQuotation(quoteData) {
    const id = "QUOT-2026-" + String(this.state.quotations.length + 42).padStart(4, "0");
    const newQuote = {
      id,
      date: new Date().toISOString().split("T")[0],
      status: "Approved",
      convertedToSO: null,
      ...quoteData
    };
    this.state.quotations.unshift(newQuote);
    this.saveState();
    return newQuote;
  }

  convertQuotationToSO(quotationId) {
    const quote = this.state.quotations.find(q => q.id === quotationId);
    if (!quote) throw new Error("Quotation not found");

    const soId = "SO-2026-" + String(this.state.salesOrders.length + 142).padStart(5, "0");
    quote.convertedToSO = soId;

    const newSO = {
      id: soId,
      customer: quote.customer,
      customerId: quote.customerId,
      customerPo: "PO-" + soId.substring(8),
      quotationRef: quote.id,
      date: new Date().toISOString().split("T")[0],
      deliveryDate: quote.validTill,
      productName: quote.productName,
      productId: quote.productId,
      boxDimensions: quote.boxDimensions,
      orderedQty: quote.quantity,
      producedQty: 0,
      dispatchedQty: 0,
      balanceQty: quote.quantity,
      unitPrice: quote.unitPrice,
      taxableAmount: quote.subtotal,
      taxAmount: (quote.cgst || 0) + (quote.sgst || 0) + (quote.igst || 0),
      totalAmount: quote.totalAmount,
      advanceReceived: 0,
      paymentStatus: "Payment Pending",
      productionStatus: "Queued (Planning)",
      dispatchStatus: "Not Dispatched",
      priority: "Standard",
      salesPerson: "Sunil Mehra"
    };

    this.state.salesOrders.unshift(newSO);
    this.saveState();
    return newSO;
  }

  addSalesOrder(soData) {
    const soId = "SO-2026-" + String(this.state.salesOrders.length + 142).padStart(5, "0");
    const newSO = {
      id: soId,
      date: new Date().toISOString().split("T")[0],
      producedQty: 0,
      dispatchedQty: 0,
      balanceQty: soData.orderedQty,
      paymentStatus: "Pending Verification",
      productionStatus: "Queued (Deckle Allotment)",
      dispatchStatus: "Not Dispatched",
      ...soData
    };
    this.state.salesOrders.unshift(newSO);
    this.saveState();
    return newSO;
  }

  // ==========================================
  // PRODUCTION & JOB CARDS
  // ==========================================
  addJob(jobData) {
    const jobId = "JOB-2026-" + String(this.state.jobs.length + 81).padStart(5, "0");
    const newJob = {
      id: jobId,
      producedQty: 0,
      scrapQty: 0,
      reworkQty: 0,
      completionPct: 0,
      status: "In Production",
      currentStage: "Corrugation (5P/3P)",
      targetDate: new Date().toISOString().split("T")[0],
      ...jobData
    };
    this.state.jobs.unshift(newJob);

    // Update SO production status
    const so = this.state.salesOrders.find(s => s.id === jobData.salesOrderId);
    if (so) {
      so.productionStatus = "In Production";
    }

    this.saveState();
    return newJob;
  }

  updateJobProgress(jobId, { stage, addedGoodQty, addedScrapQty, operatorName }) {
    const job = this.state.jobs.find(j => j.id === jobId);
    if (!job) return;

    if (addedGoodQty) job.producedQty = Math.min(job.plannedQty, job.producedQty + Number(addedGoodQty));
    if (addedScrapQty) job.scrapQty = (job.scrapQty || 0) + Number(addedScrapQty);
    if (stage) job.currentStage = stage;
    if (operatorName) job.supervisor = operatorName;

    job.completionPct = Math.round((job.producedQty / job.plannedQty) * 100);

    // Update parent SO produced qty
    const so = this.state.salesOrders.find(s => s.id === job.salesOrderId);
    if (so) {
      so.producedQty = Math.max(so.producedQty, job.producedQty);
      if (job.completionPct >= 100) {
        job.status = "Quality Check";
        so.productionStatus = "In QA Inspection";
      } else {
        so.productionStatus = "In " + job.currentStage;
      }
    }

    this.saveState();
  }

  completeJobAndReleaseToQC(jobId) {
    const job = this.state.jobs.find(j => j.id === jobId);
    if (!job) return;

    job.producedQty = job.plannedQty;
    job.completionPct = 100;
    job.status = "Quality Check";
    job.currentStage = "QC & Bundling";

    // Add or update Finished Goods staging entry
    const existingFG = this.state.finishedGoods.find(fg => fg.orderId === job.salesOrderId);
    if (existingFG) {
      existingFG.quantity += job.producedQty;
      existingFG.qcStatus = "Passed";
      existingFG.availableQty += job.producedQty;
    } else {
      this.state.finishedGoods.unshift({
        id: "FG-" + String(this.state.finishedGoods.length + 1).padStart(3, "0"),
        sku: "BOX-AUTO",
        customer: job.customer,
        orderId: job.salesOrderId,
        batchNo: "BATCH-" + job.id.substring(4),
        quantity: job.producedQty,
        allocatedQty: 0,
        availableQty: job.producedQty,
        qcStatus: "Passed",
        warehouseBin: "Dock FG-Auto",
        packingType: "Palletized & Strapped"
      });
    }

    const so = this.state.salesOrders.find(s => s.id === job.salesOrderId);
    if (so) {
      so.productionStatus = "Completed (Ready for Dispatch)";
      so.producedQty = so.orderedQty;
    }

    this.saveState();
  }

  // ==========================================
  // INVENTORY & REEL TRACKING
  // ==========================================
  addReel(reelData) {
    const reelId = "REEL-25-" + String(this.state.reels.length + 895).padStart(4, "0");
    const newReel = {
      id: reelId,
      grossWeightKg: Number(reelData.grossWeightKg),
      coreWeightKg: Number(reelData.coreWeightKg || 18),
      netWeightKg: Number(reelData.grossWeightKg) - Number(reelData.coreWeightKg || 18),
      currentValue: (Number(reelData.grossWeightKg) - Number(reelData.coreWeightKg || 18)) * Number(reelData.ratePerKg),
      inwardDate: new Date().toISOString().split("T")[0],
      qcStatus: "Passed",
      ...reelData
    };
    this.state.reels.unshift(newReel);
    this.saveState();
    return newReel;
  }

  updateReelStatus(reelId, newStatus, moisture) {
    const reel = this.state.reels.find(r => r.id === reelId);
    if (reel) {
      reel.qcStatus = newStatus;
      if (moisture) reel.moisturePct = Number(moisture);
      this.saveState();
    }
  }

  // ==========================================
  // PROCUREMENT & GRN
  // ==========================================
  addPurchaseOrder(poData) {
    const id = "PO-2026-" + String(this.state.purchaseOrders.length + 72).padStart(4, "0");
    const newPO = {
      id,
      date: new Date().toISOString().split("T")[0],
      status: "Approved",
      ...poData
    };
    this.state.purchaseOrders.unshift(newPO);
    this.saveState();
    return newPO;
  }

  recordGoodsReceipt(poId, acceptedMt, rate) {
    const po = this.state.purchaseOrders.find(p => p.id === poId);
    if (po) {
      po.status = "Delivered";
    }

    // Inward a corresponding reel
    this.addReel({
      paperGrade: po ? po.item : "Kraft Liner 180 GSM",
      mill: po ? po.supplier : "Century Pulp & Paper",
      gsm: 180,
      burstFactor: 24,
      deckleMm: po ? po.deckleMm : 1800,
      grossWeightKg: Math.round(acceptedMt * 1000),
      coreWeightKg: 20,
      ratePerKg: rate || (po ? po.ratePerKg : 44),
      moisturePct: 7.2,
      warehouseBay: "Bay A-03"
    });
  }

  // ==========================================
  // DISPATCH & LOGISTICS
  // ==========================================
  addDispatch(dispatchData) {
    const id = "DISP-2026-" + String(this.state.dispatches.length + 94).padStart(4, "0");
    const challanNo = "CH-2026-" + String(this.state.dispatches.length + 84).padStart(4, "0");
    const ewayBillNo = "2410" + Math.floor(10000000 + Math.random() * 90000000);

    const newDispatch = {
      id,
      challanNo,
      ewayBillNo,
      date: new Date().toISOString().split("T")[0],
      status: "Out for Delivery",
      ...dispatchData
    };
    this.state.dispatches.unshift(newDispatch);

    // Update SO dispatched & balance quantities
    const so = this.state.salesOrders.find(s => s.id === dispatchData.salesOrderId);
    if (so) {
      const dispatchedAmount = Number(dispatchData.quantity);
      so.dispatchedQty = Math.min(so.orderedQty, (so.dispatchedQty || 0) + dispatchedAmount);
      so.balanceQty = Math.max(0, so.orderedQty - so.dispatchedQty);
      if (so.balanceQty === 0) {
        so.dispatchStatus = "Fully Dispatched";
      } else {
        so.dispatchStatus = "Partially Dispatched";
      }
    }

    this.saveState();
    return newDispatch;
  }

  // ==========================================
  // FINANCE & PAYMENTS
  // ==========================================
  addInvoice(invoiceData) {
    const id = "INV-2026-" + String(this.state.invoices.length + 323).padStart(5, "0");
    const newInvoice = {
      id,
      invoiceDate: new Date().toISOString().split("T")[0],
      paidAmount: 0,
      outstandingAmount: invoiceData.totalAmount,
      status: "Unpaid",
      hsnCode: "48191010",
      ...invoiceData
    };
    this.state.invoices.unshift(newInvoice);

    // Update customer outstanding
    const customer = this.state.customers.find(c => c.name === invoiceData.customer || c.id === invoiceData.customerId);
    if (customer) {
      customer.outstandingBalance = (customer.outstandingBalance || 0) + Number(invoiceData.totalAmount);
    }

    this.saveState();
    return newInvoice;
  }

  recordPayment(paymentData) {
    const id = "RCPT-2026-" + String(this.state.payments.length + 12).padStart(4, "0");
    const newPayment = {
      id,
      date: new Date().toISOString().split("T")[0],
      ...paymentData
    };
    this.state.payments.unshift(newPayment);

    const amountPaid = Number(paymentData.amount);

    // Update invoice if linked
    if (paymentData.allocatedToInvoice) {
      const inv = this.state.invoices.find(i => i.id === paymentData.allocatedToInvoice);
      if (inv) {
        inv.paidAmount = (inv.paidAmount || 0) + amountPaid;
        inv.outstandingAmount = Math.max(0, inv.totalAmount - inv.paidAmount);
        inv.status = inv.outstandingAmount === 0 ? "Paid" : "Partially Paid";
      }
    }

    // Update customer outstanding
    const customer = this.state.customers.find(c => c.name === paymentData.customer || c.id === paymentData.customerId);
    if (customer) {
      customer.outstandingBalance = Math.max(0, (customer.outstandingBalance || 0) - amountPaid);
    }

    this.saveState();
    return newPayment;
  }

  // ==========================================
  // APPROVALS WORKFLOW
  // ==========================================
  handleApproval(approvalId, decision, reason = "") {
    const appr = this.state.approvals.find(a => a.id === approvalId);
    if (!appr) return;

    appr.status = decision === "approve" ? "Approved" : "Rejected";
    appr.decisionDate = new Date().toISOString().split("T")[0];
    appr.decisionReason = reason;

    // Apply side effect
    if (decision === "approve") {
      if (appr.reference.startsWith("PO-")) {
        const po = this.state.purchaseOrders.find(p => p.id === appr.reference);
        if (po) po.status = "Approved";
      } else if (appr.reference.startsWith("SO-")) {
        const so = this.state.salesOrders.find(s => s.id === appr.reference);
        if (so) {
          so.paymentStatus = "Authorized (Credit Override)";
          if (so.dispatchStatus === "Halted") so.dispatchStatus = "Released for Dispatch";
        }
      } else if (appr.reference.startsWith("QUOT-")) {
        const quot = this.state.quotations.find(q => q.id === appr.reference);
        if (quot) quot.status = "Approved";
      }
    }

    this.saveState();
  }

  // ==========================================
  // METRICS & COMPUTED AGGREGATIONS
  // ==========================================
  getMetrics() {
    const totalDispatchedToday = this.state.dispatches.reduce((acc, d) => acc + (d.quantity * 0.68 / 1000), 0);
    const totalReceivables = this.state.customers.reduce((acc, c) => acc + (c.outstandingBalance || 0), 0);
    const activeJobsCount = this.state.jobs.filter(j => j.status === "In Production" || j.status === "Quality Check").length;
    const pendingApprovalsCount = this.state.approvals.filter(a => a.status === "Pending").length;
    const totalReelStockMt = this.state.reels.reduce((acc, r) => acc + (r.netWeightKg / 1000), 0);
    const totalReelStockVal = this.state.reels.reduce((acc, r) => acc + (r.currentValue || 0), 0);
    const fgBoxesCount = this.state.finishedGoods.reduce((acc, fg) => acc + (fg.availableQty || 0), 0);

    return {
      dispatchedValueToday: "₹38,45,200",
      monthlyNetRevenue: "₹4,82,60,000",
      plantOutputTodayMt: totalDispatchedToday ? (84.6 + totalDispatchedToday).toFixed(1) : "84.6",
      totalReceivables: totalReceivables,
      activeJobsCount,
      pendingApprovalsCount,
      corrugationOee: "88.4%",
      totalReelStockMt: totalReelStockMt.toFixed(1),
      totalReelStockVal: totalReelStockVal,
      fgBoxesCount,
      trimScrapPct: "2.14%"
    };
  }
}

// Global Store Instance
window.PackFlowStore = new PackFlowStore();
