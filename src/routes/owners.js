import express from "express";
import controller from "../controllers/ownerController.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import asyncHandler from "../utils/asyncHandler.js";
import validate from "../middleware/validate.js";
import validators from "../validators/auth.js";

const router = express.Router();
router.use(authenticate, authorize("owner", "admin"));
router.get("/", authorize("admin"), asyncHandler(controller.getAll));
router.get("/me", authorize("owner"), asyncHandler(controller.getMe));
router.put(
  "/me",
  authorize("owner"),
  validate(validators.updateOwner),
  asyncHandler(controller.updateMe)
);
router.get("/:id", authorize("admin"), asyncHandler(controller.getById));
router.put(
  "/:id",
  authorize("admin"),
  validate(validators.updateOwner),
  asyncHandler(controller.update)
);
router.delete("/:id", authorize("admin"), asyncHandler(controller.remove));

export default router;
