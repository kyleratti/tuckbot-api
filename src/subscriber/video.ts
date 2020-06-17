import { logger } from "tuckbot-util";
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from "typeorm";
import { Video } from "../entity";
import { ACMApi } from "../services";

@EventSubscriber()
export class VideoSubscriber implements EntitySubscriberInterface<Video> {
  listenTo() {
    return Video;
  }

  async afterInsert(event: InsertEvent<Video>) {
    const video = event.entity;
    const videoDetails = {
      id: video.id,
      redditPostId: video.redditPostId,
      redditPostTitle: video.redditPostTitle,
      mirrorUrl: video.mirrorUrl,
    };

    try {
      await ACMApi.update({
        redditPostId: event.entity.redditPostId,
        url: event.entity.mirrorUrl,
      });

      logger.info({
        msg: `Updated video link with a-centralized-mirror API`,
        video: videoDetails,
      });
    } catch (err) {
      logger.fatal({
        msg: `Unable to update video link with a-centralized-mirror API`,
        video: videoDetails,
        error: err,
      });
    }
  }
}
