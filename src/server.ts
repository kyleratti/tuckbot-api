import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import expressPinoLogger from "express-pino-logger";
import pino from "pino";
import configurator from "tuckbot-util/lib/configurator";
import { PrivateS3Api, PrivateVideoApi, PublicVideoApi } from "./controllers";
import { database } from "./db";

let db = database;
export const logger = pino({
  name: "tuckbot-api",
  level: "debug",
});

export class ApiServer {
  private app: express.Application;
  private port: number;

  constructor() {
    let app = express();
    let port = configurator.app.apiPort || 3002;

    app.use(expressPinoLogger({ logger: logger, level: "debug" }));

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.use(cors());

    app.use("/public/video", PublicVideoApi);

    app.use("/private/s3", PrivateS3Api);
    app.use("/private/video", PrivateVideoApi);

    this.app = app;
    this.port = port;
  }

  async start() {
    try {
      await db.connect();
    } catch (err) {
      console.error(err);
    }

    this.app.listen(this.port, () => {
      logger.info(
        `listening for API requests at http://127.0.0.1:${this.port}`
      );
    });
  }
}
