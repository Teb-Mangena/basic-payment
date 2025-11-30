import validator from "validator";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import genToken from "../config/genToken.js";

export const signupUser = async (req,res) => {
  const {name,surname,stageName,email,password,role} = req.body;

  try {
    if(!name || !surname || !email || !password){
      return res.status(400).json({ message: "All fields must be filled"});
    }

    if(!validator.isEmail(email)){
      return res.status(400).json({ message:"Please enter a valid email"});
    }

    if(!validator.isStrongPassword(password)){
      return res.status(400).json({ message:"Password not strong strong enough"});
    }

    const exists = await User.findOne({email});
    if(exists){
      return res.status(400).json({ message:"Email is already registered"});
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password,salt);

    const user = await User.create({
      name,
      surname,
      stageName,
      email,
      password: hashPassword,
      role
    });

    const token = genToken(res,user._id);

    res.status(201).json({user,token});
  } catch (error) {
    console.log("Error in signupUser",error);
    res.status(500).json({ message:"Internal server error"});
  }
}

export const loginUser = async (req,res) => {
  const { email,password} = req.body;
  
  try {
    if(!email || !password){
      return res.status(400).json({ message:"All fields must be filled"});
    }

    const user = await User.findOne({email});
    if(!user){
      return res.status(400).json({ message: "Incorrect credentials"});
    }

    const match = await bcrypt.compare(password,user.password);
    if(!match){
      return res.status(400).json({ message: "Incorrect credentials"});
    }

    const token = genToken(res,user._id);

    res.status(200).json({user,token});

  } catch (error) {
    console.log("Error in loginUser",error);
    res.status(500).json({ message:"Internal server error"});
  }
}

export const logoutUser = async (req,res) => {
  try {
    res.cookie("token","",{
      maxAge: 0
    });

    res.status(200).json({ message: "Logged out successfully"});
  } catch (error) {
    console.error("Error in the Logout",error);
    res.status(500).json({ message: "Internal server error"});
  }
}

export const checkAuth = async (req,res) => {
  try {
    res.status(200).json({
      message: "User logged in",
      user: req.user
    });
  } catch (error) {
    console.error("Error in the CheckAuth",error);
    res.status(500).json({ message: "Internal server error"});
  }
}