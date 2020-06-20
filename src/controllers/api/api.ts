import { Response } from "express";
import HttpStatusCode from "http-status-codes";
import {
  DataOnlyResponse,
  isResponseData,
  ResponseData,
} from "../../structures";

export function response(
  res: Response,
  responseData: ResponseData | DataOnlyResponse
): Express.Application {
  if (isResponseData(responseData)) {
    return res.status(responseData.status).send({
      status: {
        status: responseData.status, // TODO: deprecated key, remove later on
        code: responseData.status,
        message: responseData.message
          ? responseData.message
          : responseData.status === HttpStatusCode.OK
          ? "OK"
          : "RESPONSE PARSE ERROR",
      },
      data: responseData.data,
    });
  }

  return res.status(HttpStatusCode.OK).send({
    status: {
      status: HttpStatusCode.OK, // TODO: deprecated key, remove later on
      code: HttpStatusCode.OK,
      message: "OK",
    },
    data: responseData.data,
  });
}
