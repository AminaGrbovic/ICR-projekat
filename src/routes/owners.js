import express from "express";
import controller from "../controllers/ownerController.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();
router.use(authenticate, authorize("admin"));
router.get("/", asyncHandler(controller.getAll));
router.get("/:id", asyncHandler(controller.getById));
router.put("/:id", asyncHandler(controller.update));
router.delete("/:id", asyncHandler(controller.remove));

export default router;
