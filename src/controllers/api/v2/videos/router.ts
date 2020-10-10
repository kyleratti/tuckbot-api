import { Router } from "express";
import { AdminVideosApiRouter } from "./admin";
import { PrivateVideosApiRouter } from "./private";
import { PublicVideosApiRouter } from "./public";

const router = Router();

router.use("/admin", AdminVideosApiRouter);
router.use("/", PrivateVideosApiRouter);
router.use("/", PublicVideosApiRouter);

export const VideosApiRouter = router;
