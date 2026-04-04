const Derived = require("../../../models/Portfolio_Models/PortfolioMetrix_Models/finantialAssetDerivedMetrix");

const mongoose = require("mongoose");

const toDecimal = (val) => mongoose.Types.Decimal128.fromString(String(val));

const toNumber = (val) => parseFloat(val?.toString() || "0");

const add = (a, b) => toDecimal((toNumber(a) + toNumber(b)).toFixed(10));
const sub = (a, b) => toDecimal((toNumber(a) - toNumber(b)).toFixed(10));
const mul = (a, b) => toDecimal((toNumber(a) * toNumber(b)).toFixed(10));

const Price = require("../../../models/AssetsData_Models/Metrix_Models/AssetPriceHistory");

async function getLatestPrice(assetMetadataId, session) {
  const doc = await Price.findOne({ assetId: assetMetadataId })
    .sort({ date: -1 })
    .session(session);

  if (!doc) throw new Error("No market price");

  return toDecimal(doc.close);
}

async function updateDerivedIncremental({
  asset,
  type,
  qty,
  price,
  totalCost,
  profit,
  dividendAmount,
  session,
}) {
  let doc = await Derived.findOne({
    financialAssetId: asset._id,
    portfolioGroupId: asset.portfolioGroupId,
    userId: asset.userId,
  }).session(session);

  if (!doc) {
    const created = await Derived.create(
      [
        {
          financialAssetId: asset._id,
          portfolioGroupId: asset.portfolioGroupId,
          userId: asset.userId,
        },
      ],
      { session },
    );
    doc = created[0];
  }

  // ===== BUY =====
  if (type === "buy") {
    const amount = mul(qty, price);

    doc.ledgerSnapshot.investmentValue = add(
      doc.ledgerSnapshot.investmentValue,
      amount,
    );

    doc.fifoSnapshot.investmentValue = add(
      doc.fifoSnapshot.investmentValue,
      amount,
    );
  }

  // ===== SELL =====
  if (type === "sell") {
    doc.ledgerSnapshot.realizedGain = add(
      doc.ledgerSnapshot.realizedGain,
      profit,
    );

    doc.ledgerSnapshot.investmentValue = sub(
      doc.ledgerSnapshot.investmentValue,
      totalCost,
    );

    doc.fifoSnapshot.realizedGain = add(doc.fifoSnapshot.realizedGain, profit);

    doc.fifoSnapshot.investmentValue = sub(
      doc.fifoSnapshot.investmentValue,
      totalCost,
    );
  }

  // ===== DIVIDEND =====
  if (type === "dividend") {
    const div = toDecimal(dividendAmount);

    doc.ledgerSnapshot.realizedGain = add(doc.ledgerSnapshot.realizedGain, div);

    doc.fifoSnapshot.realizedGain = add(doc.fifoSnapshot.realizedGain, div);
  }

  // ===== MARKET VALUE =====
  const priceNow = await getLatestPrice(asset.assetMetadataId, session);

  const qtyDecimal = toDecimal(asset.totalQty);

  const currentValue = mul(qtyDecimal, priceNow);

  doc.fifoSnapshot.currentValue = currentValue;

  doc.fifoSnapshot.unrealizedGain = sub(
    currentValue,
    doc.fifoSnapshot.investmentValue,
  );

  await doc.save({ session });
}

module.exports = { updateDerivedIncremental };
