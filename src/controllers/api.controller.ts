import { Router, Request, Response } from 'express';

import * as configurator from '../configurator';

import { database } from '../server';
import * as Video from '../models/video';

const config = configurator.load();
const appToken = config.app.auth.token;

const router: Router = Router();

router.get('/video/getinfo/:redditPostId', (req, res) => {
    // TODO: retrieve video info from DB, display error or display video
    let redditPostId = req.params.redditPostId;

    Video.findAll()

    // 404 if not found

    // 200 if OK
    /*
    {
        id,
        redditPostId,
        status,
        views,
        lastView
    }
    */

    res.status(200);
    res.send('API:retrieve post info for ' + redditPostId);
});

router.put('/video/add', (req, res) => {
    let token = req.body.token;

    /*
    {
        redditPostId,
        status
    }
    */
});

router.post('/video/update', (req, res) => {
    // TODO: validate token
    // TODO: check data
    // TODO: update records

    if(req.body.token !== appToken) return res.status(403).send({
        error: "Unauthorized"
    });

    let redditPostId = req.body.redditPostId;

    res.status(200);
    res.send({
        message: "Updated record successfully",
        redditPostId: redditPostId
    })
});

export const APIController: Router = router;
