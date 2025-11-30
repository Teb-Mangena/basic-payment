import "dotenv/config";

const isProd = process.env.NODE_ENV === "production";

const ENV = {
  port: process.env.PORT || 5050,
  mongo_uri: process.env.MONGO_URI,
  PAYSTACK_BASE_URL: process.env.PAYSTACK_BASE_URL,
  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY,
  NODE_ENV: process.env.NODE_ENV,
  CALLBACK_URL: isProd
  ? `${process.env.BACKEND_URL}/api/payment/verify-payment`
  : "http://localhost:5050/api/payment/verify-payment",
  JWT_SECRET: process.env.JWT_SECRET,
}

export default ENV;