import format from "date-format";
import { Router } from "express";
import HttpStatusCode from "http-status-codes";
import { configurator } from "tuckbot-util";
import { LessThan } from "typeorm";
import { response } from "../";
import { Video } from "../../../entity";
import { ACMApi, S3Endpoint } from "../../../services";

const router = Router();

export const LessThanDate = (date: Date) =>
  LessThan(format(date, "YYYY-MM-DD HH:MM:SS"));

router.all("/*", (req, res, next) => {
  // FIXME: move this authentication middleware to ../api
  if (!req.headers["x-tuckbot-api-token"]) {
    req.log.error(`Authentication attempted without authentication tokens`);

    return response(res, {
      status: HttpStatusCode.UNPROCESSABLE_ENTITY,
      message: "Auth parameters not provided",
    });
  }

  if (req.headers["x-tuckbot-api-token"] != configurator.tuckbot.api.token) {
    req.log.error(`Admin authentication failed`);

    return response(res, {
      status: HttpStatusCode.UNAUTHORIZED,
      message: "Invalid credentials",
    });
  }

  req.log.debug(`Received valid admin authentication`);

  next();
});

router.post("/prune/:redditPostId", async (req, res) => {
  const redditPostId = req.params.redditPostId;

  const video = await Video.findOne({
    where: {
      redditPostId: redditPostId,
    },
  });

  if (!video) {
    req.log.debug({
      msg: `Unable to prune video: video not in database`,
      redditPostId: redditPostId,
    });

    return response(res, {
      status: HttpStatusCode.NOT_FOUND,
      message: `Video not found in database`,
      data: {
        redditPostId: redditPostId,
      },
    });
  }

  try {
    await video.prune();

    req.log.debug({
      msg: `Pruned video`,
      redditPostId: redditPostId,
      video: video.toLoggable(),
    });
  } catch (err) {
    req.log.error({
      msg: `Unable to prune video`,
      redditPostId: redditPostId,
      error: err,
    });

    return response(res, {
      status: HttpStatusCode.INTERNAL_SERVER_ERROR,
      message: `Unable to prune video`,
      data: {
        redditPostId: redditPostId,
        message: err,
      },
    });
  }

  return response(res, {
    data: {
      redditPostId: redditPostId,
    },
  });
});

router.get("/stalevideos", async (req, res) => {
  const now = new Date();
  const minimumAge = new Date();
  minimumAge.setDate(now.getDay() - 1);

  const repruneAge = new Date();
  repruneAge.setDate(now.getDay() - 20);

  req.log.debug({
    msg: `Retrieving stale videos`,
    minimumAge: minimumAge.toDateString(),
    repruneAge: repruneAge.toDateString(),
  });

  const videos = await Video.find({
    select: ["redditPostId", "lastViewedAt", "lastPrunedAt"],
    where: [
      { createdAt: LessThanDate(minimumAge), lastPrunedAt: null },
      {
        createdAt: LessThanDate(minimumAge),
        lastPrunedAt: LessThanDate(repruneAge),
      },
    ],
    order: {
      createdAt: "ASC",
      lastPrunedAt: "ASC",
    },
    skip: 0,
    take: 10,
  });

  req.log.debug({
    msg: `Retrieved stale videos`,
    staleVideos: videos,
  });

  return response(res, {
    data: {
      staleVideos: videos,
    },
  });
});

router.post("/", async (req, res) => {
  const [redditPostId, redditPostTitle, mirrorUrl] = [
    req.body.redditPostId,
    req.body.redditPostTitle,
    req.body.mirrorUrl,
  ];

  if (!redditPostId || !redditPostTitle || !mirrorUrl) {
    req.log.error({
      msg: `Unable to update video: missing data in request`,
      updateRequestData: {
        redditPostId: redditPostId,
        redditPostTitle: redditPostTitle,
        mirrorUrl: mirrorUrl,
      },
    });

    return response(res, {
      status: HttpStatusCode.UNPROCESSABLE_ENTITY,
      message: "Data missing from request",
      data: {
        redditPostId: redditPostId,
        redditPostTitle: redditPostTitle,
        mirrorUrl: mirrorUrl,
      },
    });
  }

  let vid = await Video.findOne({
    redditPostId: redditPostId,
  });

  if (vid) {
    req.log.info({
      msg: `Unable to create video: already exists in database`,
      redditPostId: redditPostId,
    });

    return response(res, {
      status: HttpStatusCode.SEE_OTHER,
      message: "Reddit post already exists in database",
      data: {
        redditPostId: redditPostId,
      },
    });
  }

  vid = Video.create({
    redditPostId: redditPostId,
    redditPostTitle: redditPostTitle,
    mirrorUrl: mirrorUrl,
  });
  await vid.save();

  req.log.info({
    msg: `Created video in database`,
    video: vid.toLoggable(),
  });

  return response(res, {
    status: HttpStatusCode.CREATED,
    message: "Successfully created mirror in database",
    data: {
      redditPostId: redditPostId,
      redditPostTitle: redditPostTitle,
      mirrorUrl: mirrorUrl,
    },
  });
});

router.get("/all", async (req, res) => {
  const videos = await Video.find({
    order: {
      createdAt: "DESC",
    },
  });

  req.log.debug({
    msg: `Retrieved all mirrors from database`,
    videos: videos.map((video) => video.toLoggable()),
  });

  return response(res, {
    data: {
      count: videos.length,
      videos: videos,
    },
  });
});

router.get("/:redditPostId", async (req, res) => {
  const redditPostId = req.params.redditPostId;

  if (!redditPostId) {
    req.log.error({
      msg: `Unable to get video: missing data in request`,
      getRequestData: {
        redditPostId: redditPostId,
      },
    });

    return response(res, {
      status: HttpStatusCode.UNPROCESSABLE_ENTITY,
      message: "redditPostId not provided",
    });
  }

  const vid = await Video.findOne({
    redditPostId: redditPostId,
  });

  if (!vid) {
    req.log.debug({
      msg: `Unable to get video: does not exist`,
      getRequestData: {
        redditPostId: redditPostId,
      },
    });

    return response(res, {
      status: HttpStatusCode.NOT_FOUND,
      message: "Video not found in database",
      data: {
        redditPostId: redditPostId,
      },
    });
  }

  req.log.debug({
    msg: `Retrieved video`,
    getRequestData: {
      redditPostId: redditPostId,
    },
    video: vid.toLoggable(),
  });

  return response(res, {
    data: {
      redditPostId: vid.redditPostId,
      redditPostTitle: vid.redditPostTitle,
      mirrorUrl: vid.mirrorUrl,
    },
  });
});

router.delete("/:redditPostId", async (req, res) => {
  const redditPostId = req.params.redditPostId;

  if (!redditPostId) {
    req.log.error({
      msg: `Unable to delete video: missing data in request`,
      deleteRequestData: {
        redditPostId: redditPostId,
      },
    });

    return response(res, {
      status: HttpStatusCode.UNPROCESSABLE_ENTITY,
      message: "redditPostId not provided",
    });
  }

  const vid = await Video.findOne({
    redditPostId: redditPostId,
  });

  if (!vid) {
    req.log.debug({
      msg: `Unable to delete video: does not exist`,
      deleteRequestData: {
        redditPostId: redditPostId,
      },
    });

    return response(res, {
      status: HttpStatusCode.NOT_FOUND,
      message: "Video not found in database",
      data: {
        redditPostId: redditPostId,
      },
    });
  }

  try {
    await vid.remove();
  } catch (err) {
    req.log.error({
      msg: `Unable to delete video: error when removed from database`,
      error: err,
    });

    return response(res, {
      status: HttpStatusCode.INTERNAL_SERVER_ERROR,
      message: "Internal error while processing deletion",
      data: {
        redditPostId: redditPostId,
        message: err,
      },
    });
  }

  req.log.debug({
    msg: `Deleted video from database`,
    deleteRequestData: {
      redditPostId: redditPostId,
    },
    video: vid.toLoggable(),
  });

  try {
    await ACMApi.remove({
      redditPostId: redditPostId,
      url: `${configurator.tuckbot.frontend.url}/${redditPostId}`,
    });

    req.log.info({
      msg: `Deleted video from a-centralized-mirror API`,
      deleteRequestData: {
        redditPostId: redditPostId,
      },
    });
  } catch (err) {
    req.log.fatal({
      msg: `Unable to delete video from a-centralized-mirror`,
      error: err,
    });
  }

  try {
    await S3Endpoint.delete(redditPostId + ".mp4"); // TODO: find a way to handle file extensions properly

    req.log.debug({
      msg: `Deleted video from S3 storage`,
      deleteRequestData: {
        redditPostId: redditPostId,
      },
    });
  } catch (err) {
    req.log.error({
      msg: `Unable to delete video from S3 storage`,
      error: err,
    });
  }

  req.log.debug({
    msg: `Deleted video`,
    deleteRequestData: {
      redditPostId: redditPostId,
    },
    video: vid.toLoggable(),
  });

  return response(res, {
    data: {
      redditPostId: vid.redditPostId,
      redditPostTitle: vid.redditPostTitle,
      mirrorUrl: vid.mirrorUrl,
    },
  });
});

export const PrivateVideoApi: Router = router;
