const slugify = require("slugify");

const formatName = (name) => {
    const options = {
        replacement: '-', // Replace spaces or special characters with a space
        lower: true,      // Convert to lowercase
        strict: true,     // Remove special characters
        trim: true        // Remove leading and trailing spaces
    };

    return slugify(name, options);
};

module.exports = formatName;