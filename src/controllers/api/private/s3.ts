import { Router } from "express";
import HttpStatusCode from "http-status-codes";
import { configurator } from "tuckbot-util";
import { response } from "../";
import { Video } from "../../../entity";
import { ACMApi, S3Endpoint } from "../../../services";

const router = Router();

const apiToken = configurator.tuckbot.api.token;
router.all("/*", (req, res, next) => {
  // FIXME: move this authentication middleware to ../api
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

router.get("/all", async (req, res) => {
  const objects = await S3Endpoint.getAll();
  const files = objects.map((obj) => obj.key);

  req.log.debug({
    msg: `Retrieved all objects in S3 storage`,
    s3Objects: files,
  });

  return response(res, {
    data: {
      count: files.length,
      files: files,
    },
  });
});

const removeFromACM = (redditPostId: string) =>
  ACMApi.remove({
    redditPostId: redditPostId,
    url: `${process.env.TUCKBOT_FRONTEND_URL}/${redditPostId}`,
  });

/**
 * Deletes files in S3 storage that are no longer in the database.
 *
 * There's no point in paying to keep videos stored that the frontend
 * is incapable of serving. It's a waste of money.
 *
 * WARN: This is a very database-intense operation.
 */
router.delete("/prune", async (req, res) => {
  const files = (await S3Endpoint.getAll()).map((obj) => obj.key);
  const dbMirrors = (
    await Video.find({
      select: ["redditPostId"],
      order: {
        createdAt: "ASC",
      },
    })
  ).map((mirror) => mirror.redditPostId);

  const [purgedS3, purgedApi] = [new Array<string>(), new Array<string>()];

  let fileName: string;
  let redditPostId: string;
  let exists = false;

  files.forEach(async (file) => {
    redditPostId = file.split(".")[0];
    exists = dbMirrors.includes(redditPostId);

    if (!exists) {
      // if file exists in S3 but not the API, delete from S3
      // and notify ACM to remove the mirror from reddit
      try {
        await S3Endpoint.delete(file);
      } catch (err) {
        req.log.error({
          msg: `Unable to prune file from S3`,
          redditPostId: redditPostId,
          error: err,
        });
      }

      try {
        await removeFromACM(redditPostId);
      } catch (err) {
        req.log.error({
          msg: `Unable to prune video from ACM`,
          redditPostId: redditPostId,
          error: err,
        });
      }

      purgedS3.push(redditPostId);
    }
  });

  for (const redditPostId of dbMirrors) {
    fileName = `${redditPostId}.mp4`;
    exists = files.includes(fileName);

    if (!exists) {
      // if the mirror exists in the API but not S3, delete from the API
      // and notify ACM to remove the mirror from reddit
      try {
        const vid = await Video.findOne({
          redditPostId: redditPostId,
        });
        await vid.remove();
      } catch (err) {
        req.log.error({
          msg: `Unable to prune video from API`,
          redditPostId: redditPostId,
          error: err,
        });
      }

      try {
        await ACMApi.remove({
          redditPostId: redditPostId,
          url: `${process.env.TUCKBOT_FRONTEND_URL}/watch/${redditPostId}`,
        });

        removeFromACM(redditPostId);
      } catch (err) {
        req.log.error({
          msg: `Unable to prune video from ACM`,
          redditPostId: redditPostId,
          error: err,
        });
      }

      purgedApi.push(redditPostId);
    }
  }

  if (purgedS3.length > 0)
    req.log.info({
      msg: `Removed video${
        purgedS3.length === 1 ? "" : "s"
      } from S3: no data in API`,
      purgedFiles: purgedS3,
    });

  if (purgedApi.length > 0)
    req.log.info({
      msg: `Removed video${
        purgedApi.length === 1 ? "" : "s"
      } from API: no file on S3`,
      purgedPosts: purgedApi,
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
