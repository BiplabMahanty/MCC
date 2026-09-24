function asyncHandler(handler) {
  return function handledRoute(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
