import HttpStatusCode from "http-status-codes";
import { S3Endpoint } from "../../../../services";
import { respond } from "../actions";
import { PrivateRouter } from "../router";

const router = PrivateRouter();

router.get("/all", async (req, res) => {
  try {
    const objects = await S3Endpoint.getAll();
    const files = objects.map((obj) => obj.key);

    return respond(res, {
      count: files.length,
      files,
    });
  } catch (err) {
    req.log.error({
      msg: "Unable to retrieve S3 objects",
      error: err,
    });

    return respond(res, {
      status: { code: HttpStatusCode.INTERNAL_SERVER_ERROR },
    });
  }
});

export const PrivateS3ApiRouter = router;
