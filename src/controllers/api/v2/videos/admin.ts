import { AdminRouter } from "../router";
import { getAll } from "./shared";

const router = AdminRouter();

router.get("/all", getAll);

export const AdminVideosApiRouter = router;
