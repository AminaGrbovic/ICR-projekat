import app from "./app.js";
import database from "./config/database.js";
import adminBootstrap from "./services/adminBootstrap.js";

const port = process.env.PORT || 3000;

async function start() {
  try {
    await database.connect();
    await adminBootstrap.ensureInitialAdmin();
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server is listening on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exitCode = 1;
  }
}

start();
