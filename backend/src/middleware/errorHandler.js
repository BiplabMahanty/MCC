function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || error.status || 500;
  let code = error.code || 'INTERNAL_ERROR';
  let message = error.message;

  if (error.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_RESOURCE';
    message = 'A record with that value already exists.';
  }

  const isServerError = statusCode >= 500;

  req.log.error({ err: error }, 'Request failed');

  return res.status(statusCode).json({
    status: 'error',
    code: isServerError ? 'INTERNAL_ERROR' : code,
    message: isServerError ? 'Internal server error' : message,
    ...(error.details && !isServerError && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
}

module.exports = errorHandler;
