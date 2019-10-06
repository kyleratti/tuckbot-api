import { Router } from "express";
import HttpStatusCode from "http-status-codes";
import { response } from "../";
import { Video } from "../../../entity";
import { getConnection } from "typeorm";

const router: Router = Router();

router.get("/random", async (req, res) => {
  let vid = await getConnection()
    .createQueryBuilder(Video, "video")
    .where("video.mirrorUrl != NULL")
    .where("_ROWID_ >= (abs(random()) % (SELECT max(_ROWID_) FROM video))") // NOTE: this is for SQLite as it does not support RAND() in ORDER BY
    .getOne();

  return response(res, {
    status: HttpStatusCode.OK,
    message: "OK",
    data: {
      redditPostId: vid.redditPostId,
      redditPostTitle: vid.redditPostTitle,
      mirrorUrl: vid.mirrorUrl
    }
  });
});

router.get("/:redditPostId", async (req, res) => {
  let redditPostId = req.params.redditPostId;

  if (!redditPostId) {
    return response(res, {
      status: HttpStatusCode.UNPROCESSABLE_ENTITY,
      message: "redditPostId not provided"
    });
  }

  let vid = await Video.findOne({
    redditPostId: redditPostId
  });

  if (!vid) {
    return response(res, {
      status: HttpStatusCode.NOT_FOUND,
      message: "Video not found in database",
      data: {
        redditPostId: redditPostId
      }
    });
  }

  vid.viewed();

  return response(res, {
    status: HttpStatusCode.OK,
    message: "OK",
    data: {
      redditPostId: vid.redditPostId,
      redditPostTitle: vid.redditPostTitle,
      mirrorUrl: vid.mirrorUrl
    }
  });
});

export const PublicVideoApi: Router = router;
