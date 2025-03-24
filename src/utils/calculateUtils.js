const calculatePriceAfterDiscount = (price, discount) => {
  if (!discount || discount.type === 'none') return price;
  if (discount.type === 'amount') return Math.max(0, price - discount.value);
  if (discount.type === 'percentage') return Math.max(0, price - (price * discount.value) / 100);
  return price;
};

const calculateTotalDuration = (item) => {
  return item.reduce((sum, unit) => sum + (unit.duration || 0), 0);
};

const calculateTotalPrice = (item) => {
  return item.reduce(
    (sum, unit) => sum + calculatePriceAfterDiscount(unit.price || 0, unit.discount),
    0
  );
};

module.exports = {
  calculatePriceAfterDiscount,
  calculateTotalDuration,
  calculateTotalPrice,
};
