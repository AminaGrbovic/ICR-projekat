import mongoose from "mongoose";

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to the .env file.");
  }

  await mongoose.connect(uri);
}

export default { mongoose, connect };
