import express from "express";
import controller from "../controllers/vetController.js";
import authenticate from "../middleware/authenticate.js";
import authorize from "../middleware/authorize.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = express.Router();
router.use(authenticate, authorize("owner", "admin"));
router.get("/", asyncHandler(controller.getAll));
router.get("/:id", asyncHandler(controller.getById));
router.post("/", authorize("admin"), asyncHandler(controller.create));
router.put("/:id", authorize("admin"), asyncHandler(controller.update));
router.delete("/:id", authorize("admin"), asyncHandler(controller.remove));

export default router;
