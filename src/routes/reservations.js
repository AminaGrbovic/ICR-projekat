import express from "express";
import controller from "../controllers/reservationController.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import validate from "../middleware/validate.js";
import validator from "../validators/reservation.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();
router.use(authenticate, authorize("owner", "admin"));
router.get("/", asyncHandler(controller.getAll));
router.post(
  "/",
  authorize("owner", "admin"),
  validate(validator.createReservation),
  asyncHandler(controller.create)
);
router.delete("/:id", authorize("owner", "admin"), asyncHandler(controller.remove));

export default router;
