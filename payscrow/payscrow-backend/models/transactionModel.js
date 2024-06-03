const db = require('../config/db');

exports.createTransaction = (senderId, recipientId, amount) => {
    const query = 'INSERT INTO transactions (sender_id, recipient_id, amount, status) VALUES (?, ?, ?, ?)';
    return new Promise((resolve, reject) => {
        db.query(query, [senderId, recipientId, amount, 'pending'], (err, results) => {
            if (err) return reject(err);
            resolve({ id: results.insertId, senderId, recipientId, amount, status: 'pending' });
        });
    });
};

exports.getTransactionById = (id) => {
    const query = 'SELECT * FROM transactions WHERE id = ?';
    return new Promise((resolve, reject) => {
        db.query(query, [id], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
};

exports.verifyHandshake = (id, handshakeData) => {
    const query = 'SELECT * FROM handshake_instructions WHERE transaction_id = ?';
    return new Promise((resolve, reject) => {
        db.query(query, [id], (err, results) => {
            if (err) return reject(err);
            const isValid = results.some(instruction => instruction.instructions_text === handshakeData);
            resolve(isValid);
        });
    });
};

exports.updateTransactionStatus = (id, status, escrowFeePercentage) => {
    const query = 'UPDATE transactions SET status = ?, escrow_fee = amount * ? / 100 WHERE id = ?';
    return new Promise((resolve, reject) => {
        db.query(query, [status, escrowFeePercentage, id], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};
