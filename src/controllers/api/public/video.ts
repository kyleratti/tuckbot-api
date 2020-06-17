import { Router } from "express";
import HttpStatusCode from "http-status-codes";
import { getConnection } from "typeorm";
import { response } from "../";
import { Video } from "../../../entity";

const router: Router = Router();

router.get("/random", async (req, res) => {
  const vid = await getConnection()
    .createQueryBuilder(Video, "video")
    .where("video.mirrorUrl != NULL")
    .where("_ROWID_ >= (abs(random()) % (SELECT max(_ROWID_) FROM video))") // NOTE: this is for SQLite as it does not support RAND() in ORDER BY
    .getOne();

  if (!vid) {
    req.log.error({
      msg: `Unable to find a random video: no videos found`,
    });

    return response(res, {
      status: HttpStatusCode.NOT_FOUND,
      message: "Unable to find a random video",
    });
  }

  req.log.debug({
    msg: `Retrieved random video`,
    video: vid.toLoggable(),
  });

  return response(res, {
    status: HttpStatusCode.OK,
    message: "OK",
    data: {
      redditPostId: vid.redditPostId,
      redditPostTitle: vid.redditPostTitle,
      mirrorUrl: vid.mirrorUrl,
    },
  });
});

router.get("/:redditPostId", async (req, res) => {
  const redditPostId = req.params.redditPostId;

  if (!redditPostId) {
    req.log.error({
      msg: `Unable to get video: missing data in request`,
      getVideoRequestData: {
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
      getVideoRequestData: {
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

  vid.viewed();

  req.log.debug({
    msg: `Retrieved video`,
    video: vid.toLoggable(),
  });

  return response(res, {
    status: HttpStatusCode.OK,
    message: "OK",
    data: {
      redditPostId: vid.redditPostId,
      redditPostTitle: vid.redditPostTitle,
      mirrorUrl: vid.mirrorUrl,
    },
  });
});

export const PublicVideoApi: Router = router;
