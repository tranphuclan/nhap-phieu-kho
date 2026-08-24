import express from "express";
import path from "node:path";
import { handlerError } from "./middlerware/handlerError";
import router from "./routes";

export const startServer = async (port: number = 3000) => {
  try {
    const app = express();

    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));

    app.use(express.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, "public")));

    app.use("/", router);
    app.use(handlerError);

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log("Error starting server:", error);
    throw error;
  }
}
