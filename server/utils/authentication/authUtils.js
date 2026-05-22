import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.log("bcrypt Error", error);
    throw new Error(error.message);
  }
};

export const generateJWTToken = (data, expiresIn = "10m") => {
  try {
    return jwt.sign(data, process.env.JWT_SECRET, {
      expiresIn,
    });
  } catch (error) {
    console.log("JWT Error:", error);
    throw new Error(error.message);
  }
};
