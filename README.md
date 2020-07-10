# tuckbot-api

This is the backend API for **Tuckbot**. This service tracks the videos available to be served by the frontend and removes stale videos to help keep storage and bandwidth costs down.

## Features

- Tracks all available video mirrors
- Tracks last view timestamp of each video
- Public API for video data retrieval
- Private API for [tuckbot-downloader](https://github.com/kyleratti/tuckbot-downloader) to interface with
- Private API endpoint for finding
- Automatically notify [a-centralized-mirror](https://github.com/kyleratti/a-centralized-mirror) when new videos are ready
- Endpoint to locate S3 objects missing database entries
- Endpoint to locate database entries missing S3 objects

## Public API Endpoints

- `GET /public/video/:redditPostId` - Retrieves information about the mirrored video (if it exists)
