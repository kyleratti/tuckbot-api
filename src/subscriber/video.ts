import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from "typeorm";
import { Video } from "../entity";
import { logger } from "../server";
import { ACMApi } from "../services";

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
}
