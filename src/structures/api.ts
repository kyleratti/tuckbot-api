export interface DataOnlyResponse {
  data?: object;
}

/** Data structure for API responses */
export interface ResponseData extends DataOnlyResponse {
  /** The HTTP status code to respond with */
  status: number;

  /** The HTTP status code to respond with */
  code?: number;

  /** The message to respond with */
  message?: string;
}

export function isResponseData(obj: any): obj is ResponseData {
  return "status" in obj || "code" in obj;
}
