const AppError = require('../utils/AppError');

function validate(schema, source = 'body') {
  return function validationMiddleware(req, res, next) {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      next(
        new AppError('Validation failed.', 400, 'VALIDATION_ERROR', details),
      );
      return;
    }

    req[source] = result.data;
    next();
  };
}

module.exports = validate;
