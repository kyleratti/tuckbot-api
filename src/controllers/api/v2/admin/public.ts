import HttpStatusCode from "http-status-codes";
import jsonwebtoken from "jsonwebtoken";
import passport from "passport";
import RedditStrategy from "passport-reddit";
import { respond } from "../actions";
import { PublicRouter } from "../router";

const router = PublicRouter();
const VALID_ADMINS =
  process.env.TUCKBOT_VALID_ADMINS?.split(",").map((name) => name.trim()) || "";
const JWT_SECRET = "cats in cute lil hats"; // FIXME: WHAT ARE YOU DOING

export type RedditOAuthProfile = {
  _json: object;
  _raw: object;
  /**
   * The amount of comment karma
   * @example 0
   */
  comment_karma: number;
  /** The unique internal user ID */
  id: string;
  /**
   * The amount of link/submission karma
   * @example 0
   */
  link_karma: number;
  /**
   * The profile username
   * @example "tuckbot"
   */
  name: string;
  /**
   * The OAuth provider. Should always be "reddit".
   */
  provider: string;
};

passport.use(
  new RedditStrategy.Strategy(
    {
      clientID: "8T3Kp1lAfpcEfQ", // FIXME:
      clientSecret: "IBoPaXHA1FHWU0oo58sxRZlb7eU", // FIXME:
      callbackURL: "http://127.0.0.1:3002/v2/admin/login/callback", // FIXME:
      // state: "yes",
      // duration: "permanent",
    },
    (
      accessToken: string,
      refreshToken: string | undefined,
      profile: RedditOAuthProfile,
      done: any
    ) => {
      // console.log(accessToken, refreshToken, profile, done);
      let err;

      if (!VALID_ADMINS.includes(profile.name))
        err = "Not an authorized administrator";
      return done(err, {
        name: profile.name,
      });
    }
  )
);

passport.serializeUser((user, done) => {
  const redditUser = user as RedditOAuthProfile;

  const token = jsonwebtoken.sign(redditUser, JWT_SECRET);

  done(null, token);
});

passport.deserializeUser((obj, done) => {
  console.log("deserialize", obj);
  const test = jsonwebtoken.verify(String(obj), JWT_SECRET);
  done(null, test);
});

router.get("/login/handoff", async (req, res, next) => {
  passport.authenticate("reddit", {
    state: "permanent",
    session: false,
  })(req, res, next);
});

router.get("/login/callback", async (req, res, next) => {
  passport.authenticate("reddit", (err, user, info) => {
    if (err)
      return respond(res, {
        status: {
          code: HttpStatusCode.INTERNAL_SERVER_ERROR,
          message: err.message,
        },
      });

    if (!user)
      return respond(res, {
        status: { code: HttpStatusCode.UNAUTHORIZED },
      });

    const redditUser = user as RedditOAuthProfile;
    const token = jsonwebtoken.sign(redditUser, JWT_SECRET);

    return res.redirect(`/v2/admin/login/success/${encodeURIComponent(token)}`);
  })(req, res, next);
});

router.get("/login/success/:token", async (req, res) => {
  const { token } = req.params;

  res.redirect(`http://localhost:8080/#/admin/login/token/${token}`); // FIXME: use env variable
});

export const PublicAdminApiRouter = router;
