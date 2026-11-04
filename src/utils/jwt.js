import jwt from "jsonwebtoken";
import errors from "./errors.js";

const { AppError } = errors;

function secret() {
  if (!process.env.JWT_SECRET) {
    throw new AppError(500, "JWT_SECRET is not configured");
  }
  return process.env.JWT_SECRET;
}

function createToken(id, role) {
  return jwt.sign({ role }, secret(), { subject: String(id), expiresIn: "60m" });
}

function verifyToken(token) {
  return jwt.verify(token, secret());
}

export default { createToken, verifyToken };
