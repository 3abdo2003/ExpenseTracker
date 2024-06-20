const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    bank: String,
    amount: Number,
    interestRate: Number,
    durationYears: Number,
    monthlyPayout: Number,
    yearlyPayout: Number
});

certificateSchema.methods.calculateMonthlyPayout = function () {
    const annualPayout = (this.amount * this.interestRate) / 100;
    return annualPayout / 12;
};

certificateSchema.methods.calculateYearlyPayout = function () {
    return (this.amount * this.interestRate) / 100;
};

certificateSchema.pre('save', function(next) {
    this.monthlyPayout = this.calculateMonthlyPayout();
    this.yearlyPayout = this.calculateYearlyPayout();
    next();
});

module.exports = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);
