const transactionModel = require('../models/transactionModel');
const { initiateMpesaPayment } = require('../config/mpesa');
require('dotenv').config({ path: 'var.env' });

const ESCROW_FEE_PERCENTAGE = process.env.ESCROW_FEE_PERCENTAGE;

exports.createTransaction = async (req, res) => {
    try {
        const { senderId, recipientId, amount, phoneNumber } = req.body;
        const transaction = await transactionModel.createTransaction(senderId, recipientId, amount);
        const paymentResponse = await initiateMpesaPayment(phoneNumber, amount, transaction.id);
        res.status(201).json({ transaction, paymentResponse });
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await transactionModel.getTransactionById(id);
        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.verifyTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { handshakeData } = req.body;
        const isVerified = await transactionModel.verifyHandshake(id, handshakeData);
        if (!isVerified) {
            return res.status(400).send('Verification failed');
        }
        await transactionModel.updateTransactionStatus(id, 'completed', ESCROW_FEE_PERCENTAGE);
        res.status(200).json({ message: 'Transaction verified and completed' });
    } catch (error) {
        res.status(500).send(error.message);
    }
};
