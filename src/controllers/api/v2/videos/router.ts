import { Router } from "express";
import { PrivateVideosApiRouter } from "./private";
import { PublicVideosApiRouter } from "./public";

const router = Router();

router.use("/", PrivateVideosApiRouter);
router.use("/", PublicVideosApiRouter);

export const VideosApiRouter = router;
