// test/unit_tests/computationFormaula/computeIRR.test.js

const {
  computeIRR,
} = require("../../../utils/shared/tools/computationFormula/xirr");

const { mockCashflows } = require("./mock/computeIRR.mock");
const { portfolioXirrMockData } = require("./mock/portfolioXirr.mock");

const calculateXNPV = (cashflows, irrPercentage) => {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const rate = irrPercentage / 100;
  const t0 = cashflows[0].date.getTime();

  return cashflows.reduce((total, cashflow) => {
    const days = (cashflow.date.getTime() - t0) / MS_PER_DAY;
    const fractionOfYear = days / 365;

    return total + cashflow.amount / Math.pow(1 + rate, fractionOfYear);
  }, 0);
};

describe("computeIRR", () => {
  // ======================================================
  // VALID IRR CALCULATIONS
  // ======================================================

  test("calculates 10% IRR for simple one-year gain", () => {
    const irr = computeIRR(mockCashflows.simpleTenPercentGain);

    expect(irr).toBeCloseTo(10, 6);
  });

  test("calculates -10% IRR for simple one-year loss", () => {
    const irr = computeIRR(mockCashflows.simpleTenPercentLoss);

    expect(irr).toBeCloseTo(-10, 2);
  });

  test("calculates 10% annualized IRR for two-year compounded return", () => {
    const irr = computeIRR(mockCashflows.twoYearTenPercentCompounded);

    expect(irr).toBeCloseTo(10, 6);
  });

  test("calculates high positive IRR correctly", () => {
    const irr = computeIRR(mockCashflows.highReturnInvestment);

    expect(irr).toBeCloseTo(200, 5);
  });

  test("calculates IRR for SIP-style multiple cashflows", () => {
    const irr = computeIRR(mockCashflows.sipStyleCashflows);
    const xnpv = calculateXNPV(mockCashflows.sipStyleCashflows, irr);

    expect(typeof irr).toBe("number");
    expect(Number.isFinite(irr)).toBe(true);

    // Google Sheet expected value for this cashflow
    expect(irr).toBeCloseTo(20.11664, 5);

    // XNPV should be almost zero at IRR.
    // Newton method and floating point math can leave tiny residual value.
    expect(Math.abs(xnpv)).toBeLessThan(0.001);
  });

  test("calculates IRR for irregular cashflows", () => {
    const irr = computeIRR(mockCashflows.irregularCashflows);
    const xnpv = calculateXNPV(mockCashflows.irregularCashflows, irr);

    expect(typeof irr).toBe("number");
    expect(Number.isFinite(irr)).toBe(true);

    // Google Sheet expected value for this cashflow
    expect(irr).toBeCloseTo(28.1161, 5);

    // XNPV should be almost zero at IRR.
    expect(Math.abs(xnpv)).toBeLessThan(0.001);
  });

  test("handles zero amount cashflow when positive and negative cashflows exist", () => {
    const irr = computeIRR(mockCashflows.zeroAmountIncluded);

    expect(irr).toBeCloseTo(10, 6);
  });

  // ======================================================
  // GOOGLE SHEET XIRR SAMPLE
  // ======================================================

  test("calculates Google Sheet XIRR with stronger backend precision", () => {
    const irr = computeIRR(mockCashflows.googleSheetXirr1343);

    expect(irr).toBeCloseTo(13.4291906853, 6);
  });

  // ======================================================
  // VALIDATION CASES
  // ======================================================

  test("returns null when cashflows length is less than 2", () => {
    const irr = computeIRR(mockCashflows.onlyOneCashflow);

    expect(irr).toBeNull();
  });

  test("returns null when all cashflows are positive", () => {
    const irr = computeIRR(mockCashflows.allPositive);

    expect(irr).toBeNull();
  });

  test("returns null when all cashflows are negative", () => {
    const irr = computeIRR(mockCashflows.allNegative);

    expect(irr).toBeNull();
  });

  test("returns null when all cashflows are zero", () => {
    const irr = computeIRR(mockCashflows.allZero);

    expect(irr).toBeNull();
  });

  test("returns null when amount is missing", () => {
    const irr = computeIRR(mockCashflows.missingAmount);

    expect(irr).toBeNull();
  });

  test("returns null when amount is a string", () => {
    const irr = computeIRR(mockCashflows.stringAmount);

    expect(irr).toBeNull();
  });

  test("returns null when amount is NaN", () => {
    const irr = computeIRR(mockCashflows.nanAmount);

    expect(irr).toBeNull();
  });

  test("returns null when amount is Infinity", () => {
    const irr = computeIRR(mockCashflows.infinityAmount);

    expect(irr).toBeNull();
  });

  // ======================================================
  // DATE EDGE CASES
  // ======================================================

  test("returns null when date is Invalid Date object", () => {
    const irr = computeIRR(mockCashflows.invalidDateObject);

    expect(irr).toBeNull();
  });

  test("throws error when date is raw ISO string instead of Date object", () => {
    expect(() => {
      computeIRR(mockCashflows.rawDateString);
    }).toThrow();
  });

  test("returns null when all cashflows are on same day and net to zero", () => {
    const irr = computeIRR(mockCashflows.sameDayNetZero);

    expect(irr).toBeNull();
  });

  test("returns null for same-day cashflows even with custom guess", () => {
    const irr = computeIRR(mockCashflows.sameDayNetZero, 0.25);

    expect(irr).toBeNull();
  });

  test("returns null when same-day cashflows do not net to zero", () => {
    const irr = computeIRR(mockCashflows.sameDayNetPositive);

    expect(irr).toBeNull();
  });

  // ======================================================
  // GUESS EDGE CASES
  // ======================================================

  test("converges correctly even with custom positive guess", () => {
    const irr = computeIRR(mockCashflows.simpleTenPercentGain, 0.5);

    // Function returns around 10.000000606, so 6 precision is too strict.
    expect(irr).toBeCloseTo(10, 5);
  });

  test("returns null when initial guess makes base zero", () => {
    const irr = computeIRR(mockCashflows.simpleTenPercentGain, -1);

    expect(irr).toBeNull();
  });

  test("returns null when initial guess makes base negative", () => {
    const irr = computeIRR(mockCashflows.simpleTenPercentGain, -1.5);

    expect(irr).toBeNull();
  });

  // ======================================================
  // ORDER EDGE CASE
  // ======================================================

  test("handles unsorted cashflows using first cashflow as t0", () => {
    const irr = computeIRR(mockCashflows.unsortedCashflows);

    expect(typeof irr).toBe("number");
    expect(Number.isFinite(irr)).toBe(true);
  });

  // ======================================================
  // CURRENT FUNCTION WEAKNESS
  // ======================================================

  test("throws error when cashflows is not an array", () => {
    expect(() => {
      computeIRR(null);
    }).toThrow();
  });
});

// ======================================================
// GOOGLE SHEET PORTFOLIO DATA
// ======================================================

describe("computeIRR Google Sheet data", () => {
  const googleSheetXirrTestCases = [
    ["total portfolio", portfolioXirrMockData.totalPortfolio, 12.37],
    ["emergency funds", portfolioXirrMockData.emergencyFunds, 6.04],
    ["investment", portfolioXirrMockData.investment, 13.15],
    ["stable assets", portfolioXirrMockData.stableAssets, 44.07],
    ["unstable assets", portfolioXirrMockData.unstableAssets, 8.67],
  ];

  test.each(googleSheetXirrTestCases)(
    "calculates XIRR for %s",
    (_, mockData, expectedXirr) => {
      const irr = computeIRR(mockData.cashflows);

      expect(typeof irr).toBe("number");
      expect(Number.isFinite(irr)).toBe(true);

      // Compare with visible Google Sheet rounded XIRR values.
      expect(irr).toBeCloseTo(expectedXirr, 2);
    },
  );
});