import { Router } from "express";
import { PublicAdminApiRouter } from "./public";

const router = Router();

router.use("/", PublicAdminApiRouter);

export const AdminApiRouter = router;
