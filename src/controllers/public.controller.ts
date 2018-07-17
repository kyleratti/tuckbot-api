import { Router, Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import os from 'os';

import {Op} from 'sequelize';

import { Video, Status } from "../models/video";
import { makeUrl, UrlType } from '../server';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
    // TODO: show home page (? if any???)
    res.send('Hello, world!');
});

router.get('/:redditPostId', (req: Request, res: Response) => {
    let redditPostId = req.params.redditPostId;

    Video.find({
        where: {
            redditPostId: redditPostId,
            [Op.or]: [
                {status: Status.LocallyMirrored},
                {status: Status.PostedLocalMirror}
            ]
        },
        limit: 1
    }).then(vid => {
        if(vid) {
            return res.status(HttpStatus.OK).render('show', {
                title: 'a-mirror',
                stylesheet: makeUrl(UrlType.Cdn, '/css/style.css'),
                redditPostId: vid.redditPostId,
                videoLocation: makeUrl(UrlType.Cdn, '/video/', vid.redditPostId, '.mp4'),
                posterLocation: makeUrl(UrlType.Cdn, '/img/poster.png'),

                serverName: os.hostname().split('.')[0],
            });
        }

        return res.status(HttpStatus.NOT_FOUND).render('errors/404', {
            title: 'Mirror Not Found',
            stylesheet: makeUrl(UrlType.Cdn, '/css/style.css'),
            message: 'This video was not found in the database. Typically this means a-mirror has not been asked to mirror this post or doesn\'t have an agreement in place with the subreddit moderators to mirror links reliably.',

            serverName: os.hostname().split('.')[0]
        });
    });
});

export const PublicController: Router = router;
