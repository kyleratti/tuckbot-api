import request from "request-promise";
import { configurator } from "tuckbot-util";
import { ACMDeleteOptions, ACMUpdateOptions } from "../structures";

export class ACMApi {
  static async update(data: ACMUpdateOptions) {
    return request({
      uri: `${configurator.acm.endpoint}/mirroredvideos/update`,
      method: "POST",
      headers: {
        "X-ACM-API-Token": configurator.acm.apiToken,
        "X-ACM-Bot-Token": configurator.acm.botToken
      },
      body: { data: data },
      json: true
    });
  }

  static async remove(data: ACMDeleteOptions) {
    return request({
      uri: `${configurator.acm.endpoint}/mirroredvideos/delete`,
      method: "DELETE",
      headers: {
        "X-ACM-API-Token": configurator.acm.apiToken,
        "X-ACM-Bot-Token": configurator.acm.botToken
      },
      body: { data: data },
      json: true
    });
  }
}
