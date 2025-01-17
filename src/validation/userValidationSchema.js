const Joi = require('joi');

// Validation schema
const userValidationSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(50)
        .regex(/^[a-zA-Z\s]+$/)
        .required()
        .messages({
            'string.pattern.base': 'Name must contain only letters and spaces',
        }),
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        .required()
        .messages({
            'string.pattern.base':
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        }),
    role: Joi.string().valid('User', 'Admin', 'OperationTeam', 'PaymentTeam').default('User'),
});


module.exports = userValidationSchema;
