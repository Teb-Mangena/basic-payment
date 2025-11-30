import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  stageName: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["business_owner","artist","admin"],
    default: "business_owner"
  },
  subaccount: {
    type: Schema.Types.ObjectId,
    ref: "Subaccount"
  },
  payments: [{
    type: Schema.Types.ObjectId,
    ref: "Payment"
  }],
  location: {
    country: String,
    city: String,
    address: String,
    placeName: String
  }
},{timestamps:true});

const User = mongoose.model('User', userSchema);

export default User;