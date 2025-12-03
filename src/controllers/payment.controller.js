import ENV from "../config/env.js";
import Payment from "../models/payment.model.js";
import Subaccount from "../models/subaccount.model.js";
import crypto from "crypto";
import { paystackInstance } from "../lib/Paystack.js";
import User from "../models/user.model.js";

// initialize payment
export const initPayment = async (req,res) => {
  const { email, amount,subaccount_code } = req.body; 
  const user = req.user;

  try {
    const response = await paystackInstance.post('/transaction/initialize',{ 
      email, 
      amount: amount * 100,
      subaccount: subaccount_code,
      bearer: "subaccount", // account that will pay transaction fee
      callback_url: ENV.CALLBACK_URL,
      metadata: {
        first_name: user.name,
        last_name: user.surname,
        userId: user.id
        // plan: "premium"
      }
    });

    const { authorization_url, reference } = response.data.data;

    const payment = new Payment({
      email,
      amount,
      subaccount: subaccount_code,
      authorization_url,
      reference,
      status: "pending",
      metadata: {
        first_name: user.name,
        last_name: user.surname,
        userId: user.id
      }
    });

    await payment.save();

    await User.findByIdAndUpdate(
      user.id, 
      { $push: { payments: payment._id } }, 
      {new: true}
    );

    res.status(200).json({ 
      authorization_url, 
      reference
    });
  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const verifyPayment = async (req,res) => {
  const {reference} = req.query;

  try {
    const response = await paystackInstance.get(`/transaction/verify/${reference}`);
    const txData = response.data.data;

    const updatePayment = await Payment.findOneAndUpdate(
      { reference }, 
      {
        status: txData.status,
        verifiedAt: new Date(),
        amount: txData.amount / 100,
        fees: (txData.fees / 100) || 0,
        commission: (txData.amount / 100) * 0.10 
      }, 
      {
        new: true
      }
    );

    if(!updatePayment) {
      return res.status(404).json({
        message: "Payment record not found"
      })
    }

    res.status(200).json({
      message: "Payment successfully verified",
      updatedData: updatePayment,
      data: txData
    });

  } catch (error) {
    res.status(500).json({ message: "Internal server error" })
    console.log(error.response?.data || error.message);
  }
}

export const createSubaccount = async (req,res) => {
  const {business_name,bank_code,account_number} = req.body;
  const artistId = req.user.id;

  try {
    const response = await paystackInstance.post('/subaccount', {
      business_name,
      settlement_bank: bank_code,
      account_number,
      percentage_charge: 10,
      description: "Mzansi GigLink artist subaccount"
    });

    const { subaccount_code } = response.data.data;

    const existing = await Subaccount.findOne({ artistId });
    if (existing) {
      return res.status(400).json({ message: "Artist already has a subaccount" });
    }

    const account = new Subaccount({
      business_name,
      bank_code,
      account_number,
      subaccount_code,
      percentage_charge: 10,
      description: "Mzansi GigLink artist subaccount",
      artistId
    });

    await account.save();

    await User.findByIdAndUpdate(
      artistId,
      { subaccount: account._id },
      { new: true }
    );

    res.status(201).json({
      message: "Subaccount created",
      subaccount_code,
      artistId,
      subaccount: account,
      data: response.data
    })

  } catch (error) {
    res.status(500).json({ message: "internal server error"});
    console.log(error.response?.message || error.message);
  }
}

export const refundPayment = async (req, res) => {
  const { reference } = req.body;

  try {
    // verify transaction to get amount and fees
    const verifyResponse = await paystackInstance.get(`/transaction/verify/${reference}`);
    const { amount, fees } = verifyResponse.data.data;

    // Business rule: refund only artist’s share (90%) minus fees
    const percentageCharge = 0.9;
    const artistGross = amount * percentageCharge;
    let refundAmount = artistGross - fees;

    // Prevent negative refunds
    refundAmount = Math.max(refundAmount, 0);

    const response = await paystackInstance.post('/refund', {
      transaction: reference,
      amount: refundAmount
    });

    const updatedRefund = await Payment.findOneAndUpdate(
      { reference }, {
        status: response.data.data.status || "refunded",
        refundAmount: refundAmount / 100,
        refundDate: new Date(),
        fees: (fees / 100) || 0,
        commission: (amount / 100) * 0.10 
      }, { new: true }
    );

    if (!updatedRefund) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    res.status(200).json({
      message: "Partial refund initiated",
      refundAmount: refundAmount / 100,
      updatedData: updatedRefund,
      data: response.data
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: "Refund failed" });
  }
};

// paystack webhook
export const paystackWebhook = async (req,res) => {
  const secret = ENV.PAYSTACK_SECRET_KEY;

  const hash = crypto
  .createHmac('sha512',secret)
  .update(JSON.stringify(req.body))
  .digest('hex');

  if(hash !== req.headers["x-paystack-signature"]){
    return res.status(401).json({ message: "Invalid signature"});
  }

  const event = req.body;

  try {
    if(event.event === "charge.success"){
      const txData = event.data;

      await Payment.findOneAndUpdate(
        { reference: txData.reference },
        {
          status: "success",
          verifiedAt: new Date(),
          amount: txData.amount / 100,
          fees: (txData.fees / 100) || 0,
          commission: (txData.amount / 100) * 0.10
        },
        { new: true }
      )
    }

    if(event.event === "charge.failed"){
      const txData = event.data;

      await Payment.findOneAndUpdate(
        { reference: txData.reference },
        {
          status: "failed",
          verifiedAt: new Date(),
          amount: txData.amount / 100,
          fees: (txData.fees / 100) || 0,
          commission: (txData.amount / 100) * 0.10
        },
        { new: true}
      )
    }

    if(event.event === "refund.processed"){
      const txData = event.data;

      await Payment.findOneAndUpdate(
        { reference: txData.reference },
        {
          status: "refunded",
          refundAmount: txData.amount / 100,
          amount: txData.amount / 100,
          fees: (txData.fees / 100) || 0,
          commission: (txData.amount / 100) * 0.10
        },
        { new: true }
      )
    }
    
    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Webhook handling failed" });
  }
}