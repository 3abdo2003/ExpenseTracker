const mongoose = require('mongoose');

const installmentPlanSchema = new mongoose.Schema({
    planName: { type: String, unique: true },
    installments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Installment' }],
    yearlyPayments: { type: Map, of: Number }
});

installmentPlanSchema.methods.calculateYearlyPayments = function () {
    const yearlyPayments = new Map();

    // Calculate payments from installments
    this.installments.forEach(installment => {
        const year = installment.dueDate.getFullYear();
        if (!yearlyPayments.has(year)) {
            yearlyPayments.set(year, 0);
        }
        yearlyPayments.set(year, yearlyPayments.get(year) + installment.amount);
    });

    // Merge with existing additional yearly payments
    if (this.yearlyPayments) {
        this.yearlyPayments.forEach((amount, year) => {
            if (!yearlyPayments.has(year)) {
                yearlyPayments.set(year, 0);
            }
            yearlyPayments.set(year, yearlyPayments.get(year) + amount);
        });
    }

    return yearlyPayments;
};

installmentPlanSchema.methods.updateYearlyPayment = function (year, additionalAmount) {
    if (!this.yearlyPayments) {
        this.yearlyPayments = new Map();
    }
    const yearStr = year.toString();
    if (!this.yearlyPayments.has(yearStr)) {
        this.yearlyPayments.set(yearStr, 0);
    }
    const currentAmount = this.yearlyPayments.get(yearStr);
    this.yearlyPayments.set(yearStr, currentAmount + additionalAmount);
};

installmentPlanSchema.pre('save', async function (next) {
    if (this.installments.length > 0) {
        await this.populate('installments');
        this.yearlyPayments = this.calculateYearlyPayments();
    }
    next();
});

module.exports = mongoose.models.InstallmentPlan || mongoose.model('InstallmentPlan', installmentPlanSchema);
