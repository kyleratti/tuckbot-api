import format from "date-format";
import HttpStatusCode from "http-status-codes";
import { configurator } from "tuckbot-util";
import { LessThan } from "typeorm";
import { Video } from "../../../../entity";
import { ACMApi, S3Endpoint } from "../../../../services";
import { respond } from "../actions";
import { PrivateRouter } from "../privaterouter";

const router = PrivateRouter;

const LessThanDate = (date: Date) =>
  LessThan(format(date, "YYYY-MM-DD HH:MM:SS"));

router.delete("/prune/:redditPostId", async (req, res) => {
  const { redditPostId } = req.params;

  let vid: Video;

  // BEGIN: Retrieve or fail
  try {
    vid = await Video.findOne({
      where: {
        redditPostId,
      },
    });

    if (!vid)
      return respond(res, {
        status: { code: HttpStatusCode.NOT_FOUND },
        redditPostId,
      });
  } catch (err) {
    req.log.error({
      msg: `Error retrieving video for pruning`,
      error: err,
    });

    return respond(res, {
      status: { code: HttpStatusCode.INTERNAL_SERVER_ERROR },
    });
  }
  // END: Retrieve or fail

  // BEGIN: Prune or fail
  try {
    await vid.prune();

    return respond(res, { redditPostId });
  } catch (err) {
    req.log.error({
      msg: `Error pruning video`,
      error: err,
      redditPostId,
    });
  }
  // END: Prune or fail
});

const daysFromNow = (num: number) => {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDay() + num);

  return targetDate;
};

/**
 * The minimum number of days old a video must be before it can be prund
 */
const minimumAge = () => daysFromNow(-1);

const REPRUNE_DAYS = 30;
/**
 * The minimum number of days old a video must be before it can be pruned again
 */
const repruneAt = () => daysFromNow(REPRUNE_DAYS * -1);

router.get("/stale", async (req, res) => {
  const [minAge, repruneAge] = [minimumAge(), repruneAt()];

  try {
    const vids = await Video.find({
      select: ["redditPostId", "lastViewedAt", "lastPrunedAt"],
      where: [
        { createdAt: LessThanDate(minAge), lastPrunedAt: null },
        {
          createdAt: LessThanDate(minAge),
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

    return respond(res, { videos: vids });
  } catch (err) {
    req.log.error({ msg: "Error retrieving stale video list", error: err });

    return respond(res, {
      status: { code: HttpStatusCode.INTERNAL_SERVER_ERROR },
    });
  }
});

router.get("/all", async (req, res) => {
  try {
    const videos = await Video.find({
      order: {
        createdAt: "DESC",
      },
    });

    return respond(res, { videos: videos });
  } catch (err) {
    return respond(res, {
      status: { code: HttpStatusCode.INTERNAL_SERVER_ERROR },
    });
  }
});

router.put("/", async (req, res) => {
  const { redditPostId, redditPostTitle, mirrorUrl } = req.body;

  if (!redditPostId || !redditPostTitle || !mirrorUrl)
    return respond(res, {
      status: { code: HttpStatusCode.UNPROCESSABLE_ENTITY },
    });

  try {
    let vid = await Video.findOne({
      redditPostId,
    });

    if (vid)
      return respond(res, {
        status: {
          code: HttpStatusCode.SEE_OTHER,
          message: "A mirror for this post already exists in the database",
        },
      });

    vid = Video.create({
      redditPostId,
      redditPostTitle,
      mirrorUrl,
    });
    await vid.save();

    req.log.info({
      msg: "Created video in database",
      video: vid.toLoggable(),
    });

    return respond(res, {
      status: { code: HttpStatusCode.CREATED },
      video: {
        redditPostId,
        redditPostTitle,
        mirrorUrl,
      },
    });
  } catch (err) {
    req.log.error({
      msg: "Unable to create mirror in database",
      error: err,
    });

    return respond(res, {
      status: { code: HttpStatusCode.INTERNAL_SERVER_ERROR },
    });
  }
});

router.delete("/:redditPostId", async (req, res) => {
  const { redditPostId } = req.params;

  if (!redditPostId)
    return respond(res, {
      status: {
        code: HttpStatusCode.UNPROCESSABLE_ENTITY,
        message: "redditPostId not specified",
      },
    });

  try {
    const vid = await Video.findOne({
      where: {
        redditPostId,
      },
    });

    if (!vid)
      return respond(res, { status: { code: HttpStatusCode.NOT_FOUND } });

    await ACMApi.remove({
      redditPostId,
      url: `${configurator.tuckbot.frontend.url}/${redditPostId}`,
    });

    await S3Endpoint.delete(`${redditPostId}.mp4`); // TODO: find a better way to get file names

    await vid.remove();
  } catch (err) {
    req.log.error({
      msg: "Unable to process removal",
      error: err,
    });

    return respond(res, {
      status: { code: HttpStatusCode.INTERNAL_SERVER_ERROR },
    });
  }
});

export const PrivateVideosApiRouter = router;
