exports.calculatePriceAfterDiscount = (price, discount) => {
  if (!discount || discount.type === 'none') return price;
  if (discount.type === 'amount') return Math.max(0, price - discount.value);
  if (discount.type === 'percentage') return Math.max(0, price - (price * discount.value) / 100);
  return price;
};

exports.calculateTotalDuration = (units) => {
  return units.reduce((sum, unit) => sum + (unit.duration || 0), 0);
};

exports.calculateTotalPrice = (units) => {
  return units.reduce(
    (sum, unit) => sum + this.calculatePriceAfterDiscount(unit.price, unit.discount),
    0
  );
};
