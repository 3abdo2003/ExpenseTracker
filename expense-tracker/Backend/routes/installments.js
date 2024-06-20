const express = require('express');
const router = express.Router();
const Installment = require('../models/Installment');
const InstallmentPlan = require('../models/InstallmentPlan');
const UpdateHistory = require('../models/UpdateHistory');

// Add an installment plan with installments
router.post('/installment-plans', async (req, res) => {
    try {
        const { planName, installments } = req.body;
        const installmentPlan = new InstallmentPlan({ planName });
        await installmentPlan.save();

        const installmentIds = await Promise.all(installments.map(async (installmentData) => {
            const installment = new Installment({
                amount: installmentData.amount,
                dueDate: installmentData.dueDate,
                plan: installmentPlan._id,
                isPaid: installmentData.isPaid || false
            });
            await installment.save();
            return installment._id;
        }));

        installmentPlan.installments = installmentIds;
        await installmentPlan.save();

        res.status(201).send({ message: 'Installment plan added successfully', installmentPlan });
    } catch (error) {
        res.status(400).send({ error: 'Error creating installment plan', details: error.message });
    }
});

// Get all installment plans
router.get('/installment-plans', async (req, res) => {
    try {
        const installmentPlans = await InstallmentPlan.find().populate('installments');
        res.send(installmentPlans);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Mark an installment as paid
router.patch('/installments/:id/pay', async (req, res) => {
    try {
        const installment = await Installment.findById(req.params.id);
        if (!installment) {
            return res.status(404).send({ error: 'Installment not found' });
        }
        installment.isPaid = true;
        await installment.save();

        const installmentPlan = await InstallmentPlan.findById(installment.plan);
        if (installmentPlan) {
            await installmentPlan.save();
        }

        res.send({ message: 'Installment marked as paid', installment });
    } catch (error) {
        res.status(400).send(error);
    }
});

// Mark an installment as unpaid
router.patch('/installments/:id/unpay', async (req, res) => {
    try {
      const installment = await Installment.findById(req.params.id);
      if (!installment) {
        return res.status(404).send({ error: 'Installment not found' });
      }
      installment.isPaid = false;
      await installment.save();
  
      const installmentPlan = await InstallmentPlan.findById(installment.plan);
      if (installmentPlan) {
        await installmentPlan.save();
      }
  
      res.send({ message: 'Installment marked as unpaid', installment });
    } catch (error) {
      res.status(400).send(error);
    }
  });
  

// Get total yearly payments for all installment plans
router.get('/total-yearly-payments', async (req, res) => {
    try {
        const installmentPlans = await InstallmentPlan.find();
        const totalYearlyPayments = {};

        installmentPlans.forEach(plan => {
            if (plan.yearlyPayments) {
                plan.yearlyPayments.forEach((amount, year) => {
                    if (!totalYearlyPayments[year]) {
                        totalYearlyPayments[year] = 0;
                    }
                    totalYearlyPayments[year] += amount;
                });
            }
        });

        res.send(totalYearlyPayments);
    } catch (error) {
        res.status(500).send({ error: 'Error calculating total yearly payments', details: error.message });
    }
});

// Add utilities or maintenance cost for a specific year
router.patch('/installment-plans/:id/add-cost', async (req, res) => {
    try {
        const { year, additionalAmount } = req.body;
        const additionalAmountNumber = Number(additionalAmount);

        if (isNaN(additionalAmountNumber)) {
            return res.status(400).send({ error: 'Invalid additional amount' });
        }

        const installmentPlan = await InstallmentPlan.findById(req.params.id);

        if (!installmentPlan) {
            return res.status(404).send({ error: 'Installment plan not found' });
        }

        const yearStr = year.toString();

        if (!installmentPlan.yearlyPayments) {
            installmentPlan.yearlyPayments = new Map();
        }

        if (!installmentPlan.yearlyPayments.has(yearStr)) {
            installmentPlan.yearlyPayments.set(yearStr, 0);
        }

        const currentAmount = installmentPlan.yearlyPayments.get(yearStr);
        const newAmount = currentAmount + additionalAmountNumber;
        installmentPlan.yearlyPayments.set(yearStr, newAmount);

        const yearlyPaymentsObj = Object.fromEntries(installmentPlan.yearlyPayments);
        await InstallmentPlan.findByIdAndUpdate(req.params.id, { yearlyPayments: yearlyPaymentsObj }, { new: true });

        // Save the update history
        const updateHistory = new UpdateHistory({
            installmentPlan: req.params.id,
            year: year,
            additionalAmount: additionalAmountNumber
        });
        await updateHistory.save();

        res.send({ message: 'Yearly payment updated successfully', yearlyPayments: yearlyPaymentsObj });
    } catch (error) {
        res.status(400).send({ error: 'Error updating yearly payment', details: error.message });
    }
});

// Get update history for a specific installment plan
router.get('/installment-plans/:id/update-history', async (req, res) => {
    try {
        const updateHistory = await UpdateHistory.find({ installmentPlan: req.params.id });

        res.send(updateHistory);
    } catch (error) {
        res.status(500).send({ error: 'Error fetching update history', details: error.message });
    }
});

// Get all update history
router.get('/update-history', async (req, res) => {
    try {
        const updateHistory = await UpdateHistory.find();

        res.send(updateHistory);
    } catch (error) {
        res.status(500).send({ error: 'Error fetching update history', details: error.message });
    }
});

module.exports = router;


module.exports = router;
