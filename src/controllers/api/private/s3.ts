import { Router } from "express";
import HttpStatusCode from "http-status-codes";
import { configurator } from "tuckbot-util";
import { response } from "../";
import { Video } from "../../../entity";
import { S3Endpoint } from "../../../services";

const router = Router();

const apiToken = configurator.tuckbot.api.token;

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

router.delete("/prune", async (req, res) => {
  const objects = await S3Endpoint.getAll();
  const files = objects.map((obj) => obj.key);
  const mirrors = await Video.find({
    order: {
      createdAt: "ASC",
    },
  });
  const purged = new Array<string>();

  mirrors.forEach((mirror) => {
    const key = `${mirror.redditPostId}.mp4`;
    const exists = files.includes(key);

    if (!exists) {
      // mirror.remove();
      req.log.info(
        `Reddit Post ID '%s' exists but '%s' missing from object storage; removing`,
        mirror.redditPostId,
        key
      );

      purged.push(key);
    }
  });

  return response(res, {
    data: {
      count: purged.length,
      purged: purged,
    },
  });
});

export const PrivateS3Api = router;
