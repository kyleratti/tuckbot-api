import { Response } from "express";
import HttpStatusCode from "http-status-codes";

export interface ResponseStatus {
  code?: number;
  message?: string;
}

interface ResponseData {
  status?: ResponseStatus;
  [key: string]: unknown;
};

/**
 * Responds to an incoming Express request with the specified data
 * @param res The Express response object
 * @param data The data to respond with
 * @example response(res, {
 *  status: {
 *    code: HttpStatusCode.INTERNAL_SERVER_ERROR,
 *    message: "Database timed out"
 *  }
 * })
 * @example response(res, {
 *  video: {
 *    redditPostId: "test",
 *    mirrorUrl: "https://cdn.tuckbot.tv/test.mp4"
 *  }
 * })
 */
const respond = (res: Response, data?: ResponseData) => {
  data ||= {};
  data.status ||= {};

  if (!data.status?.code) data.status.code = HttpStatusCode.OK;
  if (!data.status?.message)
    data.status.message = HttpStatusCode.getStatusText(data.status.code);

  // return res.status(data.status.code).send(data).end();
  return res.status(data.status.code).json(data);
};

export { respond };
