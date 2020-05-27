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

  static getAll = async () => {
    return new Promise<S3Object[]>((success, fail) => {
      const objects = new Array<S3Object>();

      const listAll = async (nextToken?: string) => {
        let opts: aws.S3.ListObjectsRequest = {
          Bucket: configurator.storage.s3.bucket,
        };
        if (nextToken) opts.Marker = nextToken;

        s3.listObjects(opts, (err, data) => {
          if (err) {
            return fail(err);
          }

          data.Contents.map((obj) => objects.push(new S3Object(obj)));

          if (data.IsTruncated) listAll(data.NextMarker);
          else return success(objects);
        });
      };

      listAll();
    });
  };
}
