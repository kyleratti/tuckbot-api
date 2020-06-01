import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from "typeorm";
import { Video } from "../entity";
import { logger } from "../server";
import { ACMApi, S3Endpoint } from "../services";

@EventSubscriber()
export class VideoSubscriber implements EntitySubscriberInterface<Video> {
  listenTo() {
    return Video;
  }

  async afterInsert(event: InsertEvent<Video>) {
    try {
      await ACMApi.update({
        redditPostId: event.entity.redditPostId,
        url: event.entity.mirrorUrl,
      });
    } catch (e) {
      logger.fatal(e);
    }
  }

  async beforeRemove(event: RemoveEvent<Video>) {
    let redditPostId = event.entity.redditPostId;
    let mirrorUrl = event.entity.mirrorUrl;

    try {
      await S3Endpoint.delete(redditPostId + ".mp4"); // TODO: find a way to handle file extensions properly
      logger.info(`Successfully deleted '${redditPostId}.mp4' from S3 storage`);
    } catch (e) {
      logger.fatal(e);
    }

    try {
      await ACMApi.remove({
        redditPostId: redditPostId,
        url: event.entity.mirrorUrl,
      });
      logger.info(`Successfully deleted '${mirrorUrl}' from ACM`);
    } catch (e) {
      logger.fatal(e);
    }
  }
}
