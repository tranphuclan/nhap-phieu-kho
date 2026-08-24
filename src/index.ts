import "dotenv/config";
import { startServer } from "./app";
import { DATABASE_URL, DATABASE_NAME, PORT } from "./config/index";
import { connectDatabase } from "./database";

(async () => {
  try {
    await connectDatabase(DATABASE_URL, DATABASE_NAME)
    await startServer(PORT)
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
})()