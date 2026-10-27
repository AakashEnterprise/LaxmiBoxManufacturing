/**
 * PackFlow ERP - Domain Calculations & Industrial Costing Engine
 * Corrugated board weights, GSM formulas, Deckle slitting optimization, and Indian Tax / Currency formatting.
 */

window.PackFlowCalc = {
  // Format Indian Rupee currency: ₹12,45,000 or ₹12,45,000.50
  formatCurrency(amount, includeDecimals = false) {
    if (isNaN(amount) || amount === null || amount === undefined) return "₹0";
    const num = Number(amount);
    const parts = num.toFixed(includeDecimals ? 2 : 0).split(".");
    let integerPart = parts[0];
    const isNegative = integerPart.startsWith("-");
    if (isNegative) integerPart = integerPart.substring(1);

    // Indian Numbering System regex
    let lastThree = integerPart.substring(integerPart.length - 3);
    let otherNumbers = integerPart.substring(0, integerPart.length - 3);
    if (otherNumbers !== "") lastThree = "," + lastThree;
    const formatted = (isNegative ? "-" : "") + otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;

    return "₹" + formatted + (includeDecimals ? "." + parts[1] : "");
  },

  // Format Date to DD MMM YYYY (e.g., 27 Oct 2026)
  formatDate(dateStr) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(date.getDate()).padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  },

  // Calculate Corrugated Box Sheet Dimensions, Weight & Cost
  calculateBoxQuote({
    length = 450,
    width = 300,
    height = 280,
    plies = 5,
    fluteType = "B+C",
    topLinerGsm = 180,
    fluting1Gsm = 140,
    middleLinerGsm = 120,
    fluting2Gsm = 140,
    innerLinerGsm = 140,
    paperPricePerKg = 42,
    conversionCostPerBox = 4.5,
    printingColors = 2,
    wastagePct = 3.0,
    marginPct = 15.0,
    quantity = 10000,
    isInterState = false
  }) {
    // Standard RSC allowance: Length = 2*(L+W) + 40mm joint tab; Width = W + H + 20mm flap
    const sheetLengthMm = (2 * (Number(length) + Number(width))) + 45;
    const sheetWidthMm = Number(width) + Number(height) + 20;
    const boardAreaSqM = (sheetLengthMm * sheetWidthMm) / 1000000;

    // Flute draw / take-up factors
    const takeUpB = 1.35;
    const takeUpC = 1.43;
    const takeUpE = 1.25;

    let totalGsmPerSqM = 0;
    if (Number(plies) === 3) {
      const flutingFactor = fluteType === "E" ? takeUpE : takeUpB;
      totalGsmPerSqM = Number(topLinerGsm) + (Number(fluting1Gsm) * flutingFactor) + Number(innerLinerGsm);
    } else if (Number(plies) === 5) {
      totalGsmPerSqM = Number(topLinerGsm) +
                       (Number(fluting1Gsm) * takeUpB) +
                       Number(middleLinerGsm) +
                       (Number(fluting2Gsm) * takeUpC) +
                       Number(innerLinerGsm);
    } else { // 7-ply
      totalGsmPerSqM = Number(topLinerGsm) +
                       (Number(fluting1Gsm) * 1.5) +
                       Number(middleLinerGsm) +
                       (Number(fluting2Gsm) * 1.35) +
                       Number(middleLinerGsm) +
                       (Number(fluting1Gsm) * 1.4) +
                       Number(innerLinerGsm);
    }

    // Weight per box in KG
    const rawBoxWeightKg = (boardAreaSqM * totalGsmPerSqM) / 1000;
    const boxWeightWithWasteKg = rawBoxWeightKg * (1 + (Number(wastagePct) / 100));

    // Raw paper cost
    const paperCostPerBox = boxWeightWithWasteKg * Number(paperPricePerKg);

    // Printing cost: ₹0.35 per color per box
    const printCostPerBox = Number(printingColors) * 0.35;

    // Total factory cost per box
    const factoryCostPerBox = paperCostPerBox + Number(conversionCostPerBox) + printCostPerBox;

    // Selling price with desired margin
    const unitPrice = factoryCostPerBox / (1 - (Number(marginPct) / 100));
    const roundedUnitPrice = Math.round(unitPrice * 100) / 100;

    const subtotal = roundedUnitPrice * Number(quantity);
    const taxRate = 0.12; // 12% GST on Corrugated Paper Boxes (HSN 48191010)

    const cgst = isInterState ? 0 : subtotal * 0.06;
    const sgst = isInterState ? 0 : subtotal * 0.06;
    const igst = isInterState ? subtotal * 0.12 : 0;
    const totalTax = cgst + sgst + igst;
    const grandTotal = subtotal + totalTax;

    return {
      sheetLengthMm,
      sheetWidthMm,
      boardAreaSqM: boardAreaSqM.toFixed(3),
      boxWeightKg: boxWeightWithWasteKg.toFixed(3),
      factoryCostPerBox: factoryCostPerBox.toFixed(2),
      unitPrice: roundedUnitPrice,
      subtotal,
      cgst,
      sgst,
      igst,
      totalTax,
      grandTotal,
      estimatedProfit: (subtotal - (factoryCostPerBox * Number(quantity))).toFixed(0),
      estimatedMarginPct: Number(marginPct).toFixed(1)
    };
  },

  // Deckle Width Slitting Waste Minimizer
  calculateDeckleTrim(sheetWidthMm, selectedDeckleMm) {
    const cutCount = Math.floor(selectedDeckleMm / sheetWidthMm);
    if (cutCount <= 0) {
      return { cutCount: 0, trimMm: selectedDeckleMm, trimPct: 100, isOptimal: false };
    }
    const utilizedMm = cutCount * sheetWidthMm;
    const trimMm = selectedDeckleMm - utilizedMm;
    const trimPct = ((trimMm / selectedDeckleMm) * 100).toFixed(2);
    const isOptimal = Number(trimPct) <= 2.5;

    return {
      cutCount,
      utilizedMm,
      trimMm,
      trimPct,
      isOptimal
    };
  }
};
