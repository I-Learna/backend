const { validationResult } = require('express-validator');

/**
 * Middleware to validate request and handle errors.
 * @param {Array} validations - Array of express-validator rules.
 * @returns {Function} - Middleware function to validate and handle errors.
 */
const validateRequest = (validations) => {
    return async (req, res, next) => {
        // Run all validation rules
        await Promise.all(validations.map((validation) => validation.run(req)));

        // Get validation results
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errorCode: 'VALIDATION_ERROR',
                message: 'Validation failed',
                errors: errors.array().map((error) => ({
                    field: error.path,
                    message: error.msg,
                }))
            });
        }

        next();
    };
};

module.exports = validateRequest;
