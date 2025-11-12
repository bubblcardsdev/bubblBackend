import model, { sequelize } from "../models/index.js";

async function applyPromoCode({
  user_id,
  promoCodeRaw,
  orderItems, // [{ unitSellingPrice, quantity, ... }]
  totalSellingPrice, // number | string
  transaction,
}) {
  if (!promoCodeRaw || !promoCodeRaw.trim()) {
    return { discount: 0, promo: null, reason: null };
  }

  const promoCode = promoCodeRaw.trim().toUpperCase();

  const promo = await model.PromoCode.findOne({
    where: sequelize.where(
      sequelize.fn("upper", sequelize.col("code")),
      promoCode
    ),
    include: [{ model: model.PromoCodeType, attributes: ["name"] }],
    transaction,
  });

  if (!promo) {
    throw new Error("Invalid promo code.");
  }

  // expiry
  if (promo.expireAt && new Date(promo.expireAt) < new Date()) {
    throw new Error("Promo code has expired.");
  }

  if (promo.newUser) {
    // check if user is new
    const checkUserOrders = await model.Order.count({
      where: {
        customerId: user_id,
        orderStatusId: 3, // completed
      },
      transaction,
    });
    if (checkUserOrders > 0) {
      throw new Error("Promo code is valid only on your first purchase.");
    }
  }

  // global max uses
  if (promo.maxUses && promo.maxUses > 0) {
    const usedCount = await model.PromoCodeUsage.count({
      where: { promoCodeId: promo.id },
      transaction,
    });
    if (usedCount >= promo.maxUses) {
      throw new Error("Promo code usage limit reached.");
    }
  }

  // numeric helpers
  const toNum = (v) => Number.parseFloat(v || 0);
  const subtotal = toNum(totalSellingPrice); // pre-shipping

  // constraints
  if (promo.minValue && subtotal < toNum(promo.minValue)) {
    throw new Error(
      `Minimum order value for this promo is ₹${toNum(promo.minValue).toFixed(
        2
      )}.`
    );
  }

  const totalQty = orderItems.reduce((s, it) => s + (it.quantity || 0), 0);
  if (promo.minQuantity && totalQty < promo.minQuantity) {
    throw new Error(`Minimum quantity for this promo is ${promo.minQuantity}.`);
  }

  const type = promo.PromoCodeType?.name || "FLAT"; // default safety
  let discount = 0;

  if (type === "PERCENT") {
    const pct = Math.max(0, Math.min(100, toNum(promo.offerValue)));
    discount = Math.floor((subtotal * pct) / 100);
  } else if (type === "FLAT") {
    discount = toNum(promo.offerValue);
  } else if (type === "FREE_QUANTITY") {
    // Make the cheapest items free, up to freeQuantity
    const freeQty = Math.max(0, parseInt(promo.freeQuantity || 0, 10));

    if (freeQty > 0) {
      // Build an array of unit prices repeated per-quantity, sort asc, take freeQty
      // NOTE: adapt if your orderItems shape differs
      const unitPrices = [];
      orderItems.forEach((it) => {
        const price = toNum(it.unitSellingPrice || it.sellingPrice || 0);
        const qty = parseInt(it.quantity || 0, 10);
        for (let i = 0; i < qty; i++) unitPrices.push(price);
      });
      unitPrices.sort((a, b) => a - b);
      const actualFree = Math.min(freeQty, unitPrices.length);
      discount = unitPrices.slice(0, actualFree).reduce((s, p) => s + p, 0);
    }
  } else {
    // fallback
    discount = 0;
  }

  // cap by maxAmount (if set)
  if (promo.maxAmount && discount > toNum(promo.maxAmount)) {
    discount = toNum(promo.maxAmount);
  }

  // cannot exceed subtotal
  discount = Math.max(0, Math.min(discount, subtotal));

  return { discount, promo, reason: null };
}

export default applyPromoCode;
