import jsonwebtoken from "jsonwebtoken";
import database from "../config/database.js";
import Admin from "../models/Admin.js";
import Owner from "../models/Owner.js";
import errors from "../utils/errors.js";
import jwt from "../utils/jwt.js";

const { JsonWebTokenError, TokenExpiredError, NotBeforeError } = jsonwebtoken;
const { mongoose } = database;
const { AppError } = errors;
const { verifyToken } = jwt;

export default async function authenticate(req, res, next) {
  const match = /^Bearer\s+(.+)$/i.exec(req.get("authorization") || "");
  if (!match) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let claims;
  try {
    claims = verifyToken(match[1]);
  } catch (error) {
    if (
      error instanceof JsonWebTokenError ||
      error instanceof TokenExpiredError ||
      error instanceof NotBeforeError
    ) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return next(error);
  }

  if (!["admin", "owner"].includes(claims.role) || !claims.sub) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (mongoose.connection.readyState !== 1) {
    return next(new AppError(503, "Database is not connected"));
  }

  const id = Number(claims.sub);
  if (!Number.isSafeInteger(id)) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user =
    claims.role === "admin"
      ? await Admin.findById(id)
      : await Owner.findOne({ _id: id, status: 1 });
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.auth = { role: claims.role, user };
  return next();
};
