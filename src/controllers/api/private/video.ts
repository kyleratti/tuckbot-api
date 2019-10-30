import { Router } from "express";
import HttpStatusCode from "http-status-codes";
import { Submission } from "snoowrap";
import { snooman } from "tuckbot-util";
import { LessThan } from "typeorm";
import { response } from "../";
import { Video } from "../../../entity";
import { authorized } from "../api";

const router: Router = Router();

// TODO: use middleware instead of this nonsense

router.post("/", async (req, res) => {
  authorized(req, res, async () => {
    let redditPostId = req.body.redditPostId;
    let redditPostTitle = req.body.redditPostTitle;
    let mirrorUrl = req.body.mirrorUrl;

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
    vid.save();

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
});

router.get("/:redditPostId", async (req, res) => {
  authorized(req, res, async () => {
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
});

router.delete("/:redditPostId", async (req, res) => {
  authorized(req, res, async () => {
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

    try {
      await vid.remove();
    } catch (e) {
      return response(res, {
        status: HttpStatusCode.INTERNAL_SERVER_ERROR,
        message: "Internal error while processing deletion",
        data: {
          redditPostId: redditPostId,
          message: e
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
});

router.get("/stalevideos", async (req, res) => {
  authorized(req, res, async () => {
    let now = new Date();

    let videos = await Video.find({
      select: ["redditPostId", "lastViewedAt", "lastPrunedAt"],
      where: {
        createdAt: LessThan(new Date().setDate(now.getDay() - 1)),
        lastPrunedAt: null,
        limit: 25
      },
      order: {
        createdAt: "ASC",
        lastPrunedAt: "ASC"
      }
    });

    return response(res, {
      status: HttpStatusCode.OK,
      data: {
        videos: videos
      }
    });
  });
});

export const PrivateVideoApi: Router = router;
