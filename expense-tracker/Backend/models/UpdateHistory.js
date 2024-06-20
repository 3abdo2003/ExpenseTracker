const mongoose = require('mongoose');

const updateHistorySchema = new mongoose.Schema({
    installmentPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'InstallmentPlan', required: true },
    year: { type: Number, required: true },
    additionalAmount: { type: Number, required: true },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.UpdateHistory || mongoose.model('UpdateHistory', updateHistorySchema);
