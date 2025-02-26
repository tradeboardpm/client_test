// Constants for different equity types
export const EQUITY_TYPES = {
  DELIVERY: "DELIVERY",
  INTRADAY: "INTRADAY",
  FNO_FUTURES: "F&O-FUTURES",
  FNO_OPTIONS: "F&O-OPTIONS",
};

// Constants for transaction types
export const TRANSACTION_TYPES = {
  BUY: "buy",
  SELL: "sell",
};

// Rate constants for different charges
const RATES = {
  // STT (Securities Transaction Tax) rates
  STT: {
    [EQUITY_TYPES.DELIVERY]: 0.001, // 0.1% both sides
    [EQUITY_TYPES.INTRADAY]: 0.00025, // 0.025% sell side
    [EQUITY_TYPES.FNO_FUTURES]: 0.0002, // 0.02% sell side
    [EQUITY_TYPES.FNO_OPTIONS]: 0.001, // 0.1% sell side on premium
  },

  // Exchange Transaction charges (using NSE rates)
  EXCHANGE: {
    [EQUITY_TYPES.DELIVERY]: 0.0000297, // 0.00297%
    [EQUITY_TYPES.INTRADAY]: 0.0000297, // 0.00297%
    [EQUITY_TYPES.FNO_FUTURES]: 0.0000173, // 0.00173%
    [EQUITY_TYPES.FNO_OPTIONS]: 0.0003503, // 0.03503%
  },

  // SEBI charges (₹10 per crore = 0.0000001)
  SEBI: 0.0000001,

  // Stamp duty rates (buy side only)
  STAMP: {
    [EQUITY_TYPES.DELIVERY]: 0.00015, // 0.015%
    [EQUITY_TYPES.INTRADAY]: 0.00003, // 0.003%
    [EQUITY_TYPES.FNO_FUTURES]: 0.00002, // 0.002%
    [EQUITY_TYPES.FNO_OPTIONS]: 0.00003, // 0.003%
  },

  // GST rate
  GST: 0.18, // 18%
};

// Calculate brokerage
function calculateBrokerage(equityType, turnover) {
  if (
    equityType === EQUITY_TYPES.FNO_OPTIONS ||
    equityType === EQUITY_TYPES.FNO_FUTURES
  ) {
    return 20; // Flat ₹20 per executed order
  }
  // 0.03% or ₹20, whichever is lower
  return Math.min(turnover * 0.0003, 20);
}

// Calculate STT charges
function calculateSTT(equityType, action, turnover) {
  const sttRate = RATES.STT[equityType];
  if (equityType === EQUITY_TYPES.DELIVERY) {
    return sttRate * turnover;
  }
  return action === TRANSACTION_TYPES.SELL ? sttRate * turnover : 0;
}

// Calculate Exchange Transaction charges
function calculateExchangeCharges(equityType, turnover) {
  return RATES.EXCHANGE[equityType] * turnover;
}

// Calculate SEBI charges
function calculateSEBICharges(turnover) {
  return RATES.SEBI * turnover;
}

// Calculate Stamp Duty
function calculateStampDuty(equityType, action, turnover) {
  return action === TRANSACTION_TYPES.BUY
    ? RATES.STAMP[equityType] * turnover
    : 0;
}

// Calculate GST
function calculateGST(equityType, turnover, brokerage) {
  const exchangeCharges = calculateExchangeCharges(equityType, turnover);
  const sebiCharges = calculateSEBICharges(turnover);
  return RATES.GST * (brokerage + exchangeCharges + sebiCharges);
}

// Main function to calculate total charges
export function calculateCharges(params) {
  const { equityType, action, price, quantity } = params;

  const turnover = price * quantity;
  const brokerage = calculateBrokerage(equityType, turnover);

  // Calculate individual components
  const sttCharges = calculateSTT(equityType, action, turnover);
  const exchangeCharges = calculateExchangeCharges(equityType, turnover);
  const sebiCharges = calculateSEBICharges(turnover);
  const stampDuty = calculateStampDuty(equityType, action, turnover);
  const gstCharges = calculateGST(equityType, turnover, brokerage);

  // Calculate total charges
  const totalCharges =
    sttCharges +
    exchangeCharges +
    sebiCharges +
    stampDuty +
    gstCharges +
    brokerage;

  // Return detailed breakdown
  return {
    turnover,
    brokerage,
    sttCharges,
    exchangeCharges,
    sebiCharges,
    stampDuty,
    gstCharges,
    totalCharges,
    breakEvenPoints: totalCharges / quantity,
  };
}
