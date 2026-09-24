function notFound(req, res) {
  res.status(404).json({
    status: 'error',
    code: 'ROUTE_NOT_FOUND',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = notFound;
