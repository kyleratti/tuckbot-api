import format from "date-format";
import { Router } from "express";
import HttpStatusCode from "http-status-codes";
import { configurator } from "tuckbot-util";
import { LessThan } from "typeorm";
import { response } from "../";
import { Video } from "../../../entity";
import { S3Endpoint } from "../../../services";

const router = Router();

const apiToken = configurator.tuckbot.api.token;

export const LessThanDate = (date: Date) =>
  LessThan(format(date, "YYYY-MM-DD HH:MM:SS"));

router.all("/*", (req, res, next) => {
  if (!req.headers["x-tuckbot-api-token"]) {
    req.log.error(`Authentication attempted without authentication tokens`);

    return response(res, {
      status: HttpStatusCode.UNPROCESSABLE_ENTITY,
      message: "Auth parameters not provided",
    });
  }

  if (req.headers["x-tuckbot-api-token"] != apiToken) {
    req.log.error(`Authentication failed`);

    return response(res, {
      status: HttpStatusCode.UNAUTHORIZED,
      message: "Invalid credentials",
    });
  }

  req.log.debug(`Received valid admin authentication`);

  next();
});

router.get("/all", async (_req, res) => {
  const objects = await S3Endpoint.getAll();
  const files = objects.map((obj) => obj.key);

  return response(res, {
    data: {
      count: files.length,
      files: files,
    },
  });
});

export const PrivateS3Api = router;
