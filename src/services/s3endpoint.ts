import aws from "aws-sdk";
import { configurator } from "tuckbot-util";

let endpoint = new aws.Endpoint(configurator.storage.s3.endpoint);
let s3 = new aws.S3({
  endpoint: endpoint.href,
  accessKeyId: configurator.storage.s3.accessKeyId,
  secretAccessKey: configurator.storage.s3.secretAccessKey
});

export class S3Endpoint {
  static delete(key: string) {
    return s3.deleteObject({
      Bucket: configurator.storage.s3.bucket,
      Key: key
    });
  }
}
