import { Router } from "express";
import { PrivateS3ApiRouter } from "./private";

const router = Router();

router.use("/", PrivateS3ApiRouter);

export const VideosApiRouter = router;
