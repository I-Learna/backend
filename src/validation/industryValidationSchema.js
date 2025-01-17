const Joi = require('joi');

const industryValidationSchema = Joi.object({
    name: Joi.string()
        .pattern(/^[a-zA-Z\s]+$/)
        .required()
        .messages({
            'string.pattern.base': 'Name must contain only letters',
            'string.empty': 'Name is required',
        }),
    description: Joi.string().optional(),
});

module.exports = industryValidationSchema;
