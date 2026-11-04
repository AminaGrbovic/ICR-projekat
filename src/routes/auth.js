import express from "express";
import controller from "../controllers/authController.js";
import validate from "../middleware/validate.js";
import validators from "../validators/auth.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();

router.post(
  "/owners/register",
  validate(validators.registerOwner),
  asyncHandler(controller.registerOwner)
);
router.post(
  "/login",
  validate(validators.login),
  asyncHandler(controller.login)
);

export default router;
