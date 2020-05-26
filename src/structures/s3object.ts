import aws from "aws-sdk";

export class S3Object {
  private _object: aws.S3.Object;

  constructor(obj: aws.S3.Object) {
    this._object = obj;
  }

  public get key(): string {
    return this._object.Key;
  }
}
