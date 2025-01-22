const { body } = require('express-validator');
const Industry = require('../model/industry.model');
const { formatEnglishName } = require('../utils/slugifyName');

const industryValidationRules = [
    // Validate name (English letters only)
    body('name')
        .isString()
        .withMessage('Name must be a string')
        .matches(/^[a-zA-Z\s-]+$/)
        .withMessage('Name must contain only letters')
        .notEmpty()
        .withMessage('Name is required')
        .custom(async (name) => {
            const fomrattedName = formatEnglishName(name);
            const existingIndustry = await Industry.findOne({ slugName: fomrattedName });
            if (existingIndustry) {
                throw new Error('Industry Name already in use');
            }
        }),

    // Validate name_ar (Arabic letters only)
    body('name_ar')
        .isString()
        .withMessage('Arabic name must be a string')
        .matches(/^[\u0621-\u064A\s-]+$/)
        .withMessage('Arabic name must contain only Arabic letters')
        .notEmpty()
        .withMessage('Arabic name is required'),

];

module.exports = industryValidationRules;
