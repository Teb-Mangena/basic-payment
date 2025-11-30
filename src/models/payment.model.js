import mongoose from "mongoose";

const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  subaccount: {
    type: String,
    required: true
  },
  authorization_url: {
    type: String,
    required: true
  },
  reference: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ["pending","success","failed","refunded"],
    default: "pending",
    required: true
  },
  fees: {
    type: Number,
    default: 0
  },
  commission: {
    type: Number,
    default: 0
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  metadata: {
    first_name: String,
    last_name: String,
    userId: String,
    plan: String
  },
  verifiedAt: {
    type: Date
  },
  refundDate: {
    type: Date
  }
},{timestamps:true});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;