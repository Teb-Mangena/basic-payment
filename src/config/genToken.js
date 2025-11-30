import jwt from "jsonwebtoken";
import ENV from "./env.js";

const genToken = (res,id) => {
  const token = jwt.sign({id},ENV.JWT_SECRET,{ expiresIn: "7d" });

  res.cookie("token",token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "none",
    secure: ENV.NODE_ENV === "development" ? false : true
  })

  return token;
}

export default genToken;