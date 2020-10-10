import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import bearerToken from "express-bearer-token";
import expressPinoLogger from "express-pino-logger";
import passport from "passport";
import { configurator, logger } from "tuckbot-util";
import { PrivateS3Api, PrivateVideoApi, PublicVideoApi } from "./controllers";
import { ApiRouterV2 } from "./controllers/api/v2";
import { db } from "./db";

logger.info(`Starting up...`);

export class ApiServer {
  private app: express.Application;
  private port: number;

  constructor() {
    let app = express();
    let port = configurator.app.apiPort || 3002;

    app.use(
      expressPinoLogger({ logger: logger, level: configurator.logger.level })
    );

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.use(cors());

    app.use(bearerToken());
    app.use(passport.initialize());
    // app.use(
    //   expressSession({
    //     secret: "cats",
    //   })
    // );
    // app.use(passport.session()); //

    app.use("/public/video", PublicVideoApi);

    app.use("/private/s3", PrivateS3Api);
    app.use("/private/video", PrivateVideoApi);

    app.use("/v2", ApiRouterV2);

    this.app = app;
    this.port = port;
  }

  async start() {
    try {
      await db.connect();
      logger.info(`Connected to database`);
    } catch (err) {
      logger.fatal({
        msg: `Unable to connect to database`,
        error: {
          message: err.message,
          stack: err.stack,
        },
      });
    }

    this.app.listen(this.port, () => {
      logger.info({
        msg: `Server started`,
        serverConfig: {
          address: `127.0.0.1`,
          protocol: `HTTP`,
          port: this.port,
        },
      });
    });
  }
}
