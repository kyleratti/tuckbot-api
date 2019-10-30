import { Request, Response } from "express";
import HttpStatusCode from "http-status-codes";
import { ResponseData } from "../../structures";
import { configurator } from "tuckbot-util";

const apiToken = configurator.tuckbot.api.token;

/**
 * Checks if the specified request is authorized
 * @param req The request to evaluate
 * @param res The response
 * @param success The function called if the request is successfully authorized
 */
export function authorized(req: Request, res: Response, success: Function) {
  if (!req.headers["x-tuckbot-api-token"]) {
    req.log.error(`Authentication attempted without authentication tokens`);

    return response(res, {
      status: HttpStatusCode.UNPROCESSABLE_ENTITY,
      message: "Auth parameters not provided"
    });
  }

  if (req.headers["x-tuckbot-api-token"] != apiToken) {
    req.log.error(`Authentication failed`);

    return response(res, {
      status: HttpStatusCode.UNAUTHORIZED,
      message: "Invalid credentials"
    });
  }

  req.log.debug(`Received valid admin authentication`);

  success();
}

export function response(
  res: Response,
  data: ResponseData
): Express.Application {
  return res.status(data.status).send({
    status: {
      status: data.status,
      message: data.message
        ? data.message
        : data.status === HttpStatusCode.OK
        ? "OK"
        : "RESPONSE PARSE ERROR"
    },
    data: data.data
  });
}
