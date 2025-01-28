const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [3, 'Name must be at least 3 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters'],
        validate: {
            validator: function (value) {
                return /^[a-zA-Z\s]+$/.test(value); 
            },
            message: 'Name must contain only letters and spaces',
        },
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: 'Invalid email format',
        },
    },
    password: {
        type: String,
        minlength: [8, 'Password must be at least 8 characters long'],
        validate: {
            validator: function (value) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
            },
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        },
    },
    confirmPassword: {
        type: String,
        required: [true, 'Confirm Password is required'],
        validate: {
            validator: function (value) {
                return value === this.password; // Ensure confirmPassword matches password
            },
            message: 'Confirm Password must match Password',
        },
    },
    provider: {
        type: String,
        enum: ['local', 'google', 'linkedin'],
        default: 'local',
    },
    providerId: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: {
            values: ['User', 'Admin', 'OperationTeam', 'PaymentTeam'],
            message: '{VALUE} is not a valid role',
        },
        default: 'User',
    },
    resetPasswordToken: {
        type: String,
        default: null,
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
    },
}, { timestamps: true });


// Add a method to update the refresh token
userSchema.methods.setRefreshToken = function (refreshToken) {
    this.refreshToken = refreshToken;
    return this.save();
};

// hash password before saving (Only for local signups)
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// compare password (Only for local signups)
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
