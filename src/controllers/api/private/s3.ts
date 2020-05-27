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
  const mirrorsQuery = await Video.find({
    select: ["redditPostId"],
    order: {
      createdAt: "ASC",
    },
  });
  const mirrors = mirrorsQuery.map((mirror) => mirror.redditPostId);

  const [purgedS3, purgedApi] = [new Array<string>(), new Array<string>()];

  objects.forEach((obj) => {
    const [key, redditPostId] = [obj.key, obj.key.split(".")[0]];
    const exists = mirrors.find((mirror) => mirror === redditPostId) !== null;

    if (!exists) {
      // S3Endpoint.delete(key);
      req.log.info(
        `Reddit Post ID '%s' exists in object storage but missing from tuckbot; removing from object storage`,
        redditPostId
      );

      purgedS3.push(key);
    }
  });

  mirrors.forEach((mirror) => {
    const key = `${mirror}.mp4`;
    const exists = files.includes(key);

    if (!exists) {
      // mirror.remove();
      req.log.info(
        `Reddit Post ID '%s' exists but '%s' missing from object storage; removing`,
        mirror,
        key
      );

      purgedApi.push(key);
    }
  });

  return response(res, {
    data: {
      count: purgedS3.length + purgedApi.length,
      purgedS3: purgedS3.length,
      purgedApi: purgedApi.length,
    },
  });
});

export const PrivateS3Api = router;
