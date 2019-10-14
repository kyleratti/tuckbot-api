import { Response } from "express";
import HttpStatusCode from "http-status-codes";
import { ResponseData } from "../../structures";

let appToken = "TODO"; // FIXME: read app token from configurator

/**
 * Checks if the specified request is authorized
 * @param req The request to evaluate
 */
function authorized(req): boolean {
  if (req.method === "GET") return req.headers.token === appToken;

  return req.body && req.body.token === appToken;
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
