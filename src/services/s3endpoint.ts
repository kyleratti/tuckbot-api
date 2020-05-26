import aws from "aws-sdk";
import { configurator } from "tuckbot-util";
import { S3Object } from "../structures";

const endpoint = new aws.Endpoint(configurator.storage.s3.endpoint);
const s3 = new aws.S3({
  endpoint: endpoint.href,
  accessKeyId: configurator.storage.s3.accessKeyId,
  secretAccessKey: configurator.storage.s3.secretAccessKey,
});

export class S3Endpoint {
  static delete(key: string) {
    return s3.deleteObject({
      Bucket: configurator.storage.s3.bucket,
      Key: key,
    });
  }

  private static getFromOffset = (startAfter?: string) => {
    return s3.listObjectsV2({
      Bucket: configurator.storage.s3.bucket,
      StartAfter: startAfter,
    });
  };

  static getAll = async () => {
    return new Promise<S3Object[]>((resolve, fail) => {
      const keys = new Array<S3Object>();

      s3.listObjectsV2({
        Bucket: configurator.storage.s3.bucket,
      }).eachPage((err, data) => {
        if (err) {
          fail(err);
          return;
        }

        if (data === null) {
          resolve(keys);
          return;
        }

        data.Contents.forEach((obj) => {
          keys.push(new S3Object(obj));
        });

        return true;
      });
    });
  };
}
