module.exports.computeIRR = (cashflows, guess = 0.1) => {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  const valid = cashflows.every((c) => typeof c.amount === "number");
  if (!valid || cashflows.length < 2) return null;
  const hasPositive = cashflows.some((c) => c.amount > 0);
  const hasNegative = cashflows.some((c) => c.amount < 0);
  const hasDifferentDates = cashflows.some((cashflow) => {
    return cashflow.date.getTime() !== cashflows[0].date.getTime();
  });

  if (!hasDifferentDates) {
    return null;
  }
  if (!hasPositive || !hasNegative) return null;
  const t0 = cashflows[0].date.getTime();
  let rate = guess;
  const maxIter = 100;
  const tol = 1e-8;
  for (let i = 0; i < maxIter; i++) {
    let npv = 0;
    let dnpv = 0;
    for (const { date, amount } of cashflows) {
      const days = (date.getTime() - t0) / MS_PER_DAY;
      const frac = days / 365;
      const base = 1 + rate;
      if (base <= 0) return null;
      const denom = Math.pow(base, frac);
      npv += amount / denom;
      dnpv += (-frac * amount) / (denom * base);
    }
    if (Math.abs(npv) < tol) return rate * 100;
    const step = npv / dnpv;
    let newRate = rate - step * 0.5;
    if (!isFinite(newRate)) return null;
    if (Math.abs(newRate - rate) < tol) return newRate * 100;
    rate = newRate;
  }
  return rate * 100;
};
