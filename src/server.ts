import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import configurator from "tuckbot-util/lib/configurator";
import { PrivateVideoApi, PublicVideoApi } from "./controllers";
import { database } from "./db";

dotenv.config();

let db = database;

export class ApiServer {
  private app: express.Application;
  private port: number;

  constructor() {
    let app = express();
    let port = configurator.app.apiPort || 3002;

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.use(cors());

    app.use("/public/video", PublicVideoApi);
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
      console.log(
        `listening for API requests at http://127.0.0.1:${this.port}`
      );
    });
  }
}
