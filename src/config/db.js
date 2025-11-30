import mongoose from "mongoose";
import ENV from "./env.js";

async function connectDB (){
  try {
    await mongoose.connect(ENV.mongo_uri);

    console.log("Connected to DB successfully");
  } catch (error) {
    console.log("Error in the connectDB",error);
    process.exit(1);
  }
}

export default connectDB;