/**
 * Validates request data against the provided schema.
 * @param {object} schema - Joi schema for validation.
 * @param {string} property - The request property to validate (e.g., "body", "query", "params").
 * @returns {function} Middleware for validation.
 */
const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false }); // Validate and capture all errors
    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'), // Field name
        message: detail.message, // Validation message
      }));
      return res.status(400).json({ errors }); // Send standardized error response
    }
    next();
  };
};

module.exports = validateRequest;
