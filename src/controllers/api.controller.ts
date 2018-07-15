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
    if(req.method === 'GET')
        return req.headers.token === appToken;

    return req.body && req.body.token === appToken;
}

router.get('/debug/video/getall', (req, res) => {
    if(!authorized(req)) return response(res, HttpStatus.FORBIDDEN, 'Unauthorized');

    Video.findAll()
        .then((videos) => {
            let data = [];

            videos.forEach(vid => {
                data.push({
                    id: vid.id,
                    redditPostId: vid.redditPostId,
                    videoUrl: vid.videoUrl,
                    status: vid.status,
                    views: vid.views,
                    lastView: vid.lastView
                });
            });

            res.status(HttpStatus.OK).send(data);
        });
});

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
            videoUrl: vid.videoUrl,
            status: vid.status,
            views: vid.views,
            lastView: vid.lastView
        }

        return response(res, HttpStatus.OK, 'OK', data);
    });
});

router.get('/video/getnew', (req, res) => {
    if(!authorized(req)) return response(res, HttpStatus.FORBIDDEN, 'Unauthorized');

    Video.findAll({
        where: {
            status: Status.NewRequest
        },
        limit: 3 // let's try and handle no more than a few for each time we poll
    })
        .then(videos => {
            let data = [];

            videos.forEach(vid => {
                data.push({
                    id: vid.id,
                    videoUrl: vid.videoUrl,
                    redditPostId: vid.redditPostId,
                    status: vid.status,
                    views: vid.views,
                    lastView: vid.lastView
                });
            });

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
            redditPostId: data.redditPostId,
            videoUrl: data.videoUrl
        });

        let newVid = Video.create({
            redditPostId: data.redditPostId,
            videoUrl: data.videoUrl,
            status: Status.NewRequest
        }).then(newVid => {
            return response(res, HttpStatus.CREATED, 'Created video request', {
                id: newVid.id,
                redditPostId: newVid.redditPostId,
                videoUrl: newVid.videoUrl,
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
