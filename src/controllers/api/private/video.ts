import { Router } from "express";
import HttpStatusCode from "http-status-codes";
import { response } from "../";
import { Video } from "../../../entity";

const router: Router = Router();

router.post("/", async (req, res) => {
  // TODO: AUTHENTICATION

  let redditPostId = req.params.redditPostId;
  let redditPostTitle = req.params.redditPostTitle;
  let mirrorUrl = req.params.mirrorUrl;

  if (!redditPostId || !redditPostTitle || !mirrorUrl) {
    return response(res, {
      status: HttpStatusCode.UNPROCESSABLE_ENTITY,
      message: "Data missing from request",
      data: {
        redditPostId: redditPostId,
        redditPostTitle: redditPostTitle,
        mirrorUrl: mirrorUrl
      }
    });
  }

  let vid = await Video.findOne({
    redditPostId: redditPostId
  });

  if (vid) {
    return response(res, {
      status: HttpStatusCode.SEE_OTHER,
      message: "Reddit post already exists in database",
      data: {
        redditPostId: redditPostId
      }
    });
  }

  vid = await Video.create({
    redditPostId: redditPostId,
    redditPostTitle: redditPostTitle,
    mirrorUrl: mirrorUrl
  });

  return response(res, {
    status: HttpStatusCode.CREATED,
    message: "Successfully created mirror in database",
    data: {
      redditPostId: redditPostId,
      redditPostTitle: redditPostTitle,
      mirrorUrl: mirrorUrl
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

export const PrivateVideoApi: Router = router;
