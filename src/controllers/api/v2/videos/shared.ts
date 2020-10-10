import { RequestHandler } from "express";
import HttpStatusCode from "http-status-codes";
import { configurator } from "tuckbot-util";
import { Video } from "../../../../entity";
import { ACMApi, S3Endpoint } from "../../../../services";
import { respond } from "../actions";

/**
 * Retrieves all videos from the database.
 * @param req The request object
 * @param res The response object
 */
export const getAll: RequestHandler = async (req, res) => {
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
};

/**
 * Handles the route to delete a specific video from the database.
 * Will also attempt to delete from a-centralized-mirror and S3.
 * @param req The request object
 * @param res The response object
 */
export const deleteOne: RequestHandler = async (req, res) => {
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

    await vid.remove();
  } catch (err) {
    req.log.error({
      msg: "Unable to process removal from API",
      error: err,
    });

    return respond(res, {
      status: { code: HttpStatusCode.INTERNAL_SERVER_ERROR },
    });
  }

  try {
    await ACMApi.remove({
      redditPostId,
      url: `${configurator.tuckbot.frontend.url}/${redditPostId}`,
    });
  } catch (err) {
    req.log.error({
      msg: "Unable to process removal from ACM",
      error: err,
    });

    return respond(res, {
      status: { code: HttpStatusCode.INTERNAL_SERVER_ERROR },
    });
  }

  try {
    await S3Endpoint.delete(`${redditPostId}.mp4`); // TODO: find a better way to get file names
  } catch (err) {
    req.log.error({
      msg: "Unable to process removal from S3",
      error: err,
    });

    return respond(res, {
      status: { code: HttpStatusCode.INTERNAL_SERVER_ERROR },
    });
  }

  return respond(res);
};
