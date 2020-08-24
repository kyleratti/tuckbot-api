import { Router } from "express";
import { VideosApiRouter } from "./videos";

const router = Router();

router.use("/videos", VideosApiRouter);

export const ApiRouterV2 = router;
