import { Router, Request, Response } from 'express';
import HttpStatus from 'http-status-codes';

import { Video } from "../models/video";

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
    // TODO: show home page (? if any???)
    res.send('Hello, world!');
});

router.get('/:redditPostId', (req: Request, res: Response) => {
    let redditPostId = req.params.redditPostId;

    Video.find({
        where: {
            redditPostId: redditPostId
        },
        limit: 1
    }).then(vid => {
        if(vid) {
            res.status(HttpStatus.OK).render('show', {
                redditPostId: redditPostId,
                posterLocation: 'http://google.com',
                videoLocation: 'http://google.com'
            });
        }

        return res.status(HttpStatus.NOT_FOUND).render('errors/404', {
            message: 'This video was not found in the database. Typically this means a-mirror has not been asked to mirror this post or doesn\'t have an agreement in place with the subreddit moderators to mirror links.'
        });
    });
});

export const PublicController: Router = router;
