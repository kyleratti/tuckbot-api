export interface ACMDeleteOptions {
  /** The permanent ID of the reddit post */
  redditPostId: string;

  /** The link to the video online */
  mirrorUrl: string;
}

export interface ACMUpdateOptions {
  /** The permanent ID of the reddit post */
  redditPostId: string;

  /** The link to the video online */
  url: string;
}
