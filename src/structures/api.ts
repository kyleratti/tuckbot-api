/** Data structure for API responses */
export interface ResponseData {
  /** The HTTP status code to respond with */
  status: number;

  /** The message to respond with */
  message?: string;

  /** The data to respond with, if any */
  data?: object;
}
