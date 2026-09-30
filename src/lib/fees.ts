// Fee math used by the Taxas screen simulators. Values in reais; results rounded to cents.

// EPSILON keeps half-cent cases like 1.005 from rounding down due to float representation.
const round2 = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;

export interface SaleSimulation {
  fee: number; // percentage part + fixed part
  net: number; // what the seller receives
  reserve: number; // part of net held back (PIX reserve), released later
  availableNow: number; // net - reserve, on the release day
}

export function simulateSale(value: number, percent: number, fixed: number, reservePercent = 0): SaleSimulation {
  const fee = round2((value * percent) / 100 + fixed);
  const net = round2(Math.max(0, value - fee));
  const reserve = round2((net * reservePercent) / 100);
  return { fee, net, reserve, availableNow: round2(net - reserve) };
}

// Withdrawal fee is a fixed amount per withdrawal (see /api/withdrawals/history: fee_amount).
export const simulateWithdrawal = (amount: number, fee: number) => round2(Math.max(0, amount - fee));

// Business days are not modeled: the API only gives "D+N" in calendar days.
export const releaseDate = (days: number, from = new Date()) =>
  new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
