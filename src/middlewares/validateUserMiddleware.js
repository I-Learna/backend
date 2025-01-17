const userValidationSchema = require("../validation/userValidationSchema");


const validateUser = (req, res, next) => {
    const { error } = userValidationSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

module.exports = validateUser;