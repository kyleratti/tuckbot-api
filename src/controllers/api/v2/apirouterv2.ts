import { Router } from "express";
import { AdminApiRouter } from "./admin";
import { VideosApiRouter } from "./videos";

const router = Router();

router.use("/admin", AdminApiRouter);
router.use("/videos", VideosApiRouter);

export const ApiRouterV2 = router;
