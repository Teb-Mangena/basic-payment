import axios from "axios";
import ENV from "../config/env.js";

export const paystackInstance = axios.create({
  baseURL: ENV.PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${ENV.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
})