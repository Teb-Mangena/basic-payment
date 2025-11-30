import "dotenv/config";

const ENV = {
  port: process.env.PORT || 5050,
  mongo_uri: process.env.MONGO_URI,
  PAYSTACK_BASE_URL: process.env.PAYSTACK_BASE_URL,
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  CALLBACK_URL: process.env.FRONTEND_URL + "/api/payment/verify-payment",
  CANCEL_ACTION: process.env.FRONTEND_URL 
}

export default ENV;