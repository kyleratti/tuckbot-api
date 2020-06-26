# tuckbot-api

This is the backend API for **Tuckbot**. This project tracks all available mirrors in the Tuckbot system, the post they belong to, and the last time they were viewed. It also provides an endpoint for pruning old hosted videos that were removed from Reddit or have fallen inactive so they can be removed from storage and save costs.

## API Endpoint

- `GET /video/:redditPostId` - Retrieves information about the mirrored video (if it exists)
