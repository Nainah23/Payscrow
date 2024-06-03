const axios = require('axios');
require('dotenv').config({ path: 'var.env' });

const { MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CALLBACK_URL } = process.env;

const getMpesaToken = async () => {
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    const response = await axios.get('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
        headers: { Authorization: `Basic ${auth}` }
    });
    return response.data.access_token;
};

const initiateMpesaPayment = async (phoneNumber, amount, transactionId) => {
    const token = await getMpesaToken();
    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, -4);
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

    const response = await axios.post('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: phoneNumber,
        CallBackURL: MPESA_CALLBACK_URL,
        AccountReference: transactionId,
        TransactionDesc: `Payment for transaction ${transactionId}`
    }, { headers: { Authorization: `Bearer ${token}` } });

    return response.data;
};

module.exports = { getMpesaToken, initiateMpesaPayment };
