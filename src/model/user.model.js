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
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],

        select: false
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
            values: ['User', 'Admin', 'OperationTeam', 'PaymentTeam', 'Freelancer'],
            message: '{VALUE} is not a valid role',
        },
        default: 'User',
    },

    isEmailVerified: { type: Boolean, default: false },
    verificationCodeExpires: { type: Date },
    verificationCode: { type: String, length: [6, 'verification code is 6 character'] },

    resetPasswordToken: {
        type: String,
        default: null,
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
    },
}, { timestamps: true });


// ✅ Define Virtual Field for confirmPassword
userSchema
    .virtual('confirmPassword')
    .get(function () {
        return this._confirmPassword;
    })
    .set(function (value) {
        this._confirmPassword = value;
    });

// ✅ Compare plain confirmPassword with plain password before hashing
userSchema.pre('validate', function (next) {
    if (this.provider === 'local' && this.isModified('password')) {
        if (this._confirmPassword !== this.password) {
            this.invalidate('confirmPassword', 'Passwords do not match');
        }
    }
    next();
});

// hash password before saving (Only for local signups)
userSchema.pre('save', async function (next) {

    if (this.provider !== 'local') return next(); // Skip for non-local providers

    if (!this.isModified('password')) {
        next();
    }


    this.password = await bcrypt.hash(this.password, 10);

    this._confirmPassword = undefined; // Ensure confirmPassword is not stored
    next();
});
// compare password (Only for local signups)
userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// Add a method to update the refresh token
userSchema.methods.setRefreshToken = function (refreshToken) {
    this.refreshToken = refreshToken;
    return this.save();

};



const User = mongoose.model('User', userSchema);
module.exports = User;
