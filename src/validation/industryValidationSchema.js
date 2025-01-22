const Joi = require('joi');

const industryValidationSchema = Joi.object({
    name: Joi.string()
        .pattern(/^[a-zA-Z\s-]+$/)
        .required()
        .messages({
            'string.pattern.base': 'Name must contain only letters',
            'string.empty': 'Name is required',
        }),
    name_ar: Joi.string()
        .pattern(/^[\u0621-\u064A\s-]+$/)
        .required()
        .messages({
            'string.pattern.base': 'Arabic name must contain only Arabic letters',
            'string.empty': 'Arabic name is required',
        }),
    description: Joi.string().optional(),
});



module.exports = industryValidationSchema;
