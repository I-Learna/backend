const catchAsync = (fn) => (req, res, next) => {
  fn(req, res, next).catch((err) => {
      console.error('❌ catchAsync Error:', err.message);
      next(err);
  });
};

module.exports = catchAsync;
