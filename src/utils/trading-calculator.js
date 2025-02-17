export const EQUITY_TYPES = {
  DELIVERY: "DELIVERY",
  INTRADAY: "INTRADAY",
  FNO_FUTURES: "F&O-FUTURES",
  FNO_OPTIONS: "F&O-OPTIONS",
};

export const RATES = {
  STT: {
    DELIVERY: 0.001,
    INTRADAY: 0.000297,
    "F&O-FUTURES": 0.0001,
    "F&O-OPTIONS": 0.0005,
  },
  EXCHANGE: {
    DELIVERY: 0.0000322,
    INTRADAY: 0.0000307,
    "F&O-FUTURES": 0.00002,
    "F&O-OPTIONS": 0.00053,
  },
  SEBI: 0.000001,
  STAMP: {
    DELIVERY: 0.00015,
    INTRADAY: 0.00003,
    "F&O-FUTURES": 0.00002,
    "F&O-OPTIONS": 0.00003,
  },
  GST: 0.18,
  DP_CHARGES: 13.0,
};

const calculateSTT = (price, quantity, isSell, equityType) => {
  const sttRate = RATES.STT[equityType];
  const turnover = price * quantity;

  if (equityType === "DELIVERY") {
    return sttRate * turnover;
  }
  return isSell ? sttRate * turnover : 0;
};

const calculateExchangeCharges = (price, quantity, equityType) => {
  return RATES.EXCHANGE[equityType] * price * quantity;
};

const calculateSebiCharges = (price, quantity) => {
  return RATES.SEBI * price * quantity;
};

const calculateStampDuty = (price, quantity, isBuy, equityType) => {
  return isBuy ? RATES.STAMP[equityType] * price * quantity : 0;
};

const calculateGST = (brokerage, exchangeCharges, sebiCharges) => {
  return RATES.GST * (brokerage + exchangeCharges + sebiCharges);
};

const calculateDPCharges = (equityType, isSell) => {
  if (equityType === "DELIVERY" && isSell) {
    return RATES.DP_CHARGES;
  }
  return 0;
};

export const calculateCharges = (
  price,
  quantity,
  isSell,
  equityType,
  totalBrokerage
) => {
  const turnover = price * quantity;
  // Split the brokerage equally between buy and sell
  const brokerage = totalBrokerage / 2;
  const sttCharges = calculateSTT(price, quantity, isSell, equityType);
  const exchangeCharges = calculateExchangeCharges(price, quantity, equityType);
  const sebiCharges = calculateSebiCharges(price, quantity);
  const stampDuty = calculateStampDuty(price, quantity, !isSell, equityType);
  const gstCharges = calculateGST(brokerage, exchangeCharges, sebiCharges);
  const dpCharges = calculateDPCharges(equityType, isSell);

  const totalCharges =
    sttCharges +
    exchangeCharges +
    sebiCharges +
    stampDuty +
    gstCharges +
    dpCharges +
    brokerage;

  return {
    turnover,
    brokerage,
    sttCharges,
    exchangeCharges,
    sebiCharges,
    stampDuty,
    gstCharges,
    dpCharges,
    totalCharges,
  };
};

export const calculateResults = (formData) => {
  const {
    equityType,
    buyPrice,
    buyQuantity,
    sellPrice,
    sellQuantity,
    brokerage,
  } = formData;

  const totalBrokerageValue = parseFloat(brokerage);

  // Calculate buy side
  const buyCharges =
    buyPrice && buyQuantity
      ? calculateCharges(
          parseFloat(buyPrice),
          parseFloat(buyQuantity),
          false,
          equityType,
          totalBrokerageValue
        )
      : null;

  // Calculate sell side
  const sellCharges =
    sellPrice && sellQuantity
      ? calculateCharges(
          parseFloat(sellPrice),
          parseFloat(sellQuantity),
          true,
          equityType,
          totalBrokerageValue
        )
      : null;

  // Calculate combined results
  let combined = null;
  if (buyCharges && sellCharges) {
    const profitLoss = sellCharges.turnover - buyCharges.turnover;
    const totalCharges = buyCharges.totalCharges + sellCharges.totalCharges;
    const netProfitLoss = profitLoss - totalCharges;

    combined = {
      profitLoss,
      totalCharges,
      netProfitLoss,
      brokerage: buyCharges.brokerage + sellCharges.brokerage,
      sttCharges: buyCharges.sttCharges + sellCharges.sttCharges,
      exchangeCharges: buyCharges.exchangeCharges + sellCharges.exchangeCharges,
      sebiCharges: buyCharges.sebiCharges + sellCharges.sebiCharges,
      stampDuty: buyCharges.stampDuty + sellCharges.stampDuty,
      gstCharges: buyCharges.gstCharges + sellCharges.gstCharges,
      dpCharges: buyCharges.dpCharges + sellCharges.dpCharges,
    };
  }

  return {
    buy: buyCharges,
    sell: sellCharges,
    combined,
  };
};
