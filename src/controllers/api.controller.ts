import { Router, Request, Response } from 'express';
import HttpStatus from 'http-status-codes';
import { response } from "../server";

import * as configurator from '../configurator';

import {Video, Status} from '../models/video';

const config = configurator.load();
const appToken = config.app.auth.token;

const router: Router = Router();

/**
 * Checks if the specified request is authorized
 * @param req The request to evaluate
 */
function authorized(req) {
    return req.body && req.body.token === appToken;
}

router.get('/video/getinfo/:redditPostId', (req, res) => {
    let redditPostId = req.params.redditPostId;

    Video.find({
        where: {
            redditPostId: redditPostId
        },
        limit: 1
    }).then(vid => {
        if(!vid) return response(res, HttpStatus.NOT_FOUND, 'Video not found');

        let data = {
            redditPostId: vid.redditPostId,
            status: vid.status,
            views: vid.views,
            lastView: vid.lastView
        }

        return response(res, HttpStatus.OK, 'OK', data);
    });
});

router.put('/video/add', (req, res) => {
    if(!authorized(req)) return response(res, HttpStatus.FORBIDDEN, 'Unauthorized');

    let data = req.body;

    Video.find({
        where: {
            redditPostId: data.redditPostId
        },
        limit: 1
    }).then(vid => {
        if(vid) return response(res, HttpStatus.CONFLICT, 'Video already exists', {
            redditPostId: data.redditPostId
        });

        let newVid = Video.create({
            redditPostId: data.redditPostId,
            status: Status.NewRequest
        }).then(newVid => {
            return response(res, HttpStatus.CREATED, 'Created video request', {
                id: newVid.id,
                redditPostId: newVid.redditPostId,
                status: newVid.status,
                views: newVid.views,
                lastView: newVid.lastView
            });
        });
    });
});

router.post('/video/update', (req, res) => {
    // TODO: check data
    // TODO: update records

    if(!authorized(req)) return res.status(HttpStatus.UNAUTHORIZED).send({error: "Unauthorized"});

    let redditPostId = req.body.redditPostId;

    return response(res, HttpStatus.OK, 'Updated record successfully', {
        redditPostId: redditPostId
    });
});

export const APIController: Router = router;
