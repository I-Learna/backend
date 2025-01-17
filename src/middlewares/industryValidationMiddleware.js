const industryValidationSchema = require("../validation/industryValidationSchema");


const validateIndustry = (req, res, next) => {
    const { error } = industryValidationSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    next();
};

module.exports = validateIndustry