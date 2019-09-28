import bodyParser from "body-parser";
import express from "express";
import configurator from "tuckbot-util/lib/configurator";
import { PrivateVideoApi, PublicVideoApi } from "./controllers";

export class ApiServer {
  private app: express.Application;
  private port: number;

  constructor() {
    let app = express();
    let port = configurator.app.apiPort || 3002;

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.use("/public", PublicVideoApi);
    app.use("/private", PrivateVideoApi);

    this.app = app;
    this.port = port;
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(
        `listening for API requests at http://127.0.0.1:${this.port}`
      );
    });
  }
}
