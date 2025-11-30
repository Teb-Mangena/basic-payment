import mongoose from "mongoose";

const Schema = mongoose.Schema;

const subaccountSchema = new Schema({
  business_name: {
    type: String,
    required: true
  },
  bank_code: {
    type: String,
    required: true
  },
  account_number: {
    type: String,
    required: true
  },
  subaccount_code: {
    type: String,
    required: true,
    unique: true
  },
  percentage_charge: {
    type: Number,
    default: 90
  },
  description: {
    type: String
  },
},{timestamps:true});

const Subaccount = mongoose.model('Subaccount', subaccountSchema);

export default Subaccount;