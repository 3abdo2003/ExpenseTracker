const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
    amount: Number,
    dueDate: Date,
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'InstallmentPlan' },
    isPaid: { type: Boolean, default: false }
});

module.exports = mongoose.models.Installment || mongoose.model('Installment', installmentSchema);
