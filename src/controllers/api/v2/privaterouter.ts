import { Router } from "express";
import HttpStatusCode from "http-status-codes";
import { respond } from "./actions";

const router = Router();

router.all("/*", (req, res, next) => {
  if (!req.headers["x-tuckbot-api-token"]) {
    req.log.error(`Authentication attempted without authentication tokens`);

    return respond(res, {
      status: {
        code: HttpStatusCode.UNPROCESSABLE_ENTITY,
        message: "Auth parameters not provided",
      },
    });
  }

  if (req.headers["x-tuckbot-api-token"] != configurator.tuckbot.api.token) {
    req.log.error(`Admin authentication failed`);

    return respond(res, {
      status: {
        code: HttpStatusCode.UNAUTHORIZED,
        message: "Invalid credentials",
      },
    });
  }

  req.log.debug(`Received valid admin authentication`);

  next();
});

export const PrivateRouter = router;
