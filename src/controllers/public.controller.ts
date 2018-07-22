import { Router, Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import os from 'os';

import { Op } from 'sequelize';

import { Video, Status } from "../models/video";
import { makeUrl, UrlType } from '../server';

const router: Router = Router();

router.get('/', (req: Request, res: Response) => {
    // TODO: show home page (? if any???)
    res.send('Hello, world!');
});

router.get('/mobilitymary', (req, res) => {
    return res.status(HttpStatus.OK).render('mobilitymary', {
        title: "Mirrors of Mobility Mary's finest work",
        stylesheet: makeUrl(UrlType.Cdn, '/css/style.css'),
        serverName: os.hostname().split('.')[0],

        posts: [
            { redditPostId: "90p8rr", title: "Mobility Mary viciously mauled by rabid beast" },
            { redditPostId: "90nw6g", title: "Not to be out done by Mobility Mary, our buddy—who I’m dubbing “Court Order Chris”— confronts a police chief." },
            { redditPostId: "90w7xd", title: "Don’t tell Mobility Mary what to do" },
            { redditPostId: "90tdlu", title: "Mobility Mary Catching a Pokémon" },
            { redditPostId: "90u9te", title: "Mobility Mary attacked; hit in head four times" },
            { redditPostId: "90w36k", title: "Mobility Mary Makes a Friend" },
            { redditPostId: "90umd0", title: "MOBILITY MARY MAKES PICKLE RELISH" },
            { redditPostId: "90w6g1", title: "Mobility Mary Barely Escapes Uninjured From Intentional Road Rage Attack" },
            { redditPostId: "90u8vm", title: "The various obstacles Mobility Mary faces on the sidewalk, all in the span of 30 seconds" },
            { redditPostId: "90sb7z", title: "Mobility Mary in the trenches" },
            { redditPostId: "90k61m", title: "Mobility Mary in a construction zone" },
            { redditPostId: "90w64l", title: "Mobility Mary Barely Escapes an Escape" },
            { redditPostId: "90oejj", title: "Mobility Mary vs Unleashed Dog" },
            { redditPostId: "90ohib", title: "NEW Mobility Mary from today - this time she is attacked by unleashed dogs and barely escapes with her life" },
            { redditPostId: "8zvivj", title: "2 Girls 1 Sidewalk" },
            { redditPostId: "8zwds0", title: "Mobility Mary VS a guy at Taco Bell" }
        ]
    })
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
                videoLocation: makeUrl(UrlType.Cdn, '/video/', (vid.filename ? vid.filename : vid.redditPostId + '.mp4')),
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
