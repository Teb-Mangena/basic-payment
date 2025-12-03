import express from "express";
import { createSubaccount, initPayment, paystackWebhook, refundPayment, verifyPayment } from "../controllers/payment.controller.js";
import { requireRole } from "../middlewares/role.middleware.js";
import protectAuth from "../middlewares/auth.middleware.js";

const router = express.Router();

// router.use(protectAuth)

router.post('/payment/initialize', initPayment);

router.get('/payment/verify-payment', verifyPayment);

router.post('/payment/refund', refundPayment);

router.post('/subaccount',createSubaccount);

router.post('/paystack/webhook', paystackWebhook);

export default router;