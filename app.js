import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import compress from "compression";
import swaggerUi from "swagger-ui-express";
import { readFile } from "fs/promises";
import dotenv from "dotenv";
import swaggerFile from "./swagger-output.json" assert { type: "json" };

dotenv.config();

const swaggerDocument = JSON.parse(
  await readFile(new URL("./swagger/index.json", import.meta.url))
);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compress());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.set("trust proxy", 1);
app.use("/fonts", express.static("fonts"));

export default app;
