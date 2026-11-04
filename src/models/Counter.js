import database from "../config/database.js";

const { mongoose } = database;

const counterSchema = new mongoose.Schema(
  { _id: String, sequence: Number },
  { versionKey: false }
);

export default
  mongoose.models.Counter || mongoose.model("Counter", counterSchema, "counters");
