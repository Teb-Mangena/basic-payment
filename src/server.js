import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
// from config file
import ENV from "./config/env.js"
import connectDB from "./config/db.js";
// routes
import paymentRoutes from "./routes/payment.routes.js";

// console.log(ENV);

// create app
const app = express();
const {port} = ENV;

// middlewares 
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

// routes
app.use('/api', paymentRoutes);

// connect to db and listen to ports
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  });
})