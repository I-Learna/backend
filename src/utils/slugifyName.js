const slugify = require("slugify");

// Function for Arabic strings
const formatArabicName = (name) => {
    name = name.trim()
        .replace(/\s+/g, '-') // Replace spaces with dashes
        .replace(/[^\u0621-\u064A\s-]/g, '');
    return name;
};

// Function for English strings
const formatEnglishName = (name) => {
    const options = {
        replacement: '-', // Replace spaces or special characters with a hyphen
        lower: true,      // Convert to lowercase
        strict: true,     // Remove special characters
        trim: true        // Remove leading and trailing spaces
    };

    return slugify(name, options);
};

const capitalizeWords = (str) => {
    return str
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());

};


module.exports = {
    formatArabicName,
    formatEnglishName,
    capitalizeWords
};
