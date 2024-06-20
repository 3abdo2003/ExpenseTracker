const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');

// Add a new certificate
router.post('/certificates', async (req, res) => {
    try {
        const { bank, amount, interestRate, durationYears } = req.body;
        const certificate = new Certificate({ bank, amount, interestRate, durationYears });

        await certificate.save();
        res.status(201).send({ certificate, monthlyPayout: certificate.monthlyPayout });
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get all certificates
router.get('/certificates', async (req, res) => {
    try {
        const certificates = await Certificate.find();
        res.send(certificates);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
