export interface ACMVideoApiOptions {
  /** The permanent ID of the reddit post */
  redditPostId: string;

  /** The link to the video online */
  url: string;
}

export interface ACMDeleteOptions extends ACMVideoApiOptions {}

export interface ACMUpdateOptions extends ACMVideoApiOptions {}
