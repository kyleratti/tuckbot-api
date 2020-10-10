import { Router } from "express";
import HttpStatusCode from "http-status-codes";
import jwt from "jsonwebtoken";
import { configurator } from "tuckbot-util";
import { respond } from "./actions";
import { RedditOAuthProfile } from "./admin/public";

export const PublicRouter = () => Router();

const VALID_ADMINS =
  process.env.TUCKBOT_VALID_ADMINS?.split(",").map((name) => name.trim()) || "";
const JWT_SECRET = "cats in cute lil hats"; // FIXME: WHAT ARE YOU DOING

export const AdminRouter = () => {
  const router = Router();

  router.all("/*", (req, res, next) => {
    if (!req.token) {
      req.log.error("Admin request received with no token");

      return respond(res, {
        status: {
          code: HttpStatusCode.UNAUTHORIZED,
          message: "No token received",
        },
      });
    }

    try {
      const webToken = jwt.verify(req.token, JWT_SECRET) as RedditOAuthProfile;
      console.log(webToken);

      if (!VALID_ADMINS.includes(webToken.name)) {
        req.log.error("Admin request received from unauthorized user");

        return respond(res, { status: { code: HttpStatusCode.UNAUTHORIZED } });
      }

      return next();
    } catch (err) {
      return respond(res, {
        status: {
          code: HttpStatusCode.UNAUTHORIZED,
          message: "Invalid token received",
        },
      });
    }
  });

  return router;
};

export const PrivateRouter = () => {
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

  return router;
};
