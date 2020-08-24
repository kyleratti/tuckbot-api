import { Response } from "express";
import HttpStatusCode from "http-status-codes";
import { getConnection } from "typeorm";
import { PublicRouter, respond, ResponseStatus } from "..";
import { Video } from "../../../../entity";

const router = PublicRouter();

type SingleVideoResponse = {
  status?: ResponseStatus;
  video: {
    redditPostId: string;
    redditPostTitle: string;
    mirrorUrl: string;
  };
};

const singleVideoResponse = (res: Response, vid: SingleVideoResponse) =>
  respond(res, { status: { code: HttpStatusCode.OK }, video: vid });

router.get("/random", async (_req, res) => {
  try {
    // NOTE: this is for SQLite as it does not support RAND() in ORDER BY
    const {
      redditPostId,
      redditPostTitle,
      mirrorUrl,
    } = await getConnection()
      .createQueryBuilder(Video, "video")
      .where("video.mirrorUrl != NULL")
      .where("_ROWID_ >= (abs(random()) % (SELECT max(_ROWID_) FROM video))")
      .getOne();

    if (!redditPostId)
      return respond(res, {
        status: { code: HttpStatusCode.NOT_FOUND },
        message: "Unable to locate any videos",
      });

    return singleVideoResponse(res, {
      video: {
        redditPostId,
        redditPostTitle,
        mirrorUrl,
      },
    });
  } catch (err) {
    return respond(res, {
      status: {
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
      },
    });
  }
});

router.get("/:redditPostId", async (req, res) => {
  const { redditPostId } = req.params;

  if (!redditPostId)
    return respond(res, {
      code: HttpStatusCode.UNPROCESSABLE_ENTITY,
      message: "redditPostId not provided",
    });

  try {
    const vid = await Video.findOne({
      redditPostId: redditPostId,
    });

    if (!vid)
      return respond(res, {
        status: { message: "Video not found" },
      });

    const { redditPostTitle, mirrorUrl } = vid;

    vid.viewed();

    return singleVideoResponse(res, {
      video: {
        redditPostId: redditPostId,
        redditPostTitle: redditPostTitle,
        mirrorUrl: mirrorUrl,
      },
    });
  } catch (err) {
    req.log.error({
      msg: `Error getting video`,
      requestParams: {
        redditPostId: redditPostId,
      },
      error: err,
    });

    return respond(res, {
      status: {
        code: HttpStatusCode.INTERNAL_SERVER_ERROR,
      },
    });
  }
});

export const PublicVideosApiRouter = router;
