const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // AshFitVerse Specific Fields
    accessLevel: { type: String, enum: ['free', 'trial', 'paid'], default: 'free' },
    trialStartDate: { type: Date },
    isSubscribed: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);