import dotenv from "dotenv";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { rateLimit } from "express-rate-limit";
import swaggerSpec from "./config/swagger.js";
import trimStrings from "./middleware/trimStrings.js";
import cors from "./middleware/cors.js";
import api from "./routes/api.js";

dotenv.config();

const app = express();

app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(trimStrings);
app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({ message: "Too Many Attempts." }),
  })
);

app.get("/", (_req, res) => {
  res.send("Express server je pokrenut!");
});
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.use("/api", api);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((_req, res) => {
  res.status(404).json({ message: "Not Found" });
});

app.use((error, _req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  if (error.status === 422 && error.details) {
    return res.status(422).json({ message: error.message, errors: error.details });
  }
  if (error.name === "ValidationError" && error.errors) {
    const errors = Object.fromEntries(
      Object.entries(error.errors).map(([field, detail]) => [field, [detail.message]])
    );
    return res.status(422).json({
      message: "The given data was invalid.",
      errors,
    });
  }
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "data";
    return res.status(422).json({
      message: "The given data was invalid.",
      errors: { [field]: [`The ${field} has already been taken.`] },
    });
  }
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Invalid JSON body" });
  }
  if (error.status) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
});

export default app;
