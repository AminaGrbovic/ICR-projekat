import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import vetController from "../controllers/vetController.js";
import auth from "./auth.js";
import medicine from "./medicine.js";
import owners from "./owners.js";
import pets from "./pets.js";
import vets from "./vets.js";
import reservations from "./reservations.js";

const router = express.Router();

router.use(auth);
router.get(
  "/public/vets-count",
  asyncHandler(vetController.count)
);
router.use("/medicine", medicine);
router.use("/owners", owners);
router.use("/pets", pets);
router.use("/vets", vets);
router.use("/reservations", reservations);

export default router;
