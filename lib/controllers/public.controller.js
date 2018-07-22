"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const os_1 = __importDefault(require("os"));
const sequelize_1 = require("sequelize");
const video_1 = require("../models/video");
const server_1 = require("../server");
const router = express_1.Router();
router.get('/', (req, res) => {
    // TODO: show home page (? if any???)
    res.send('Hello, world!');
});
router.get('/:redditPostId', (req, res) => {
    let redditPostId = req.params.redditPostId;
    video_1.Video.find({
        where: {
            redditPostId: redditPostId,
            [sequelize_1.Op.or]: [
                { status: video_1.Status.LocallyMirrored },
                { status: video_1.Status.PostedLocalMirror }
            ]
        },
        limit: 1
    }).then(vid => {
        if (vid) {
            console.log(vid);
            return res.status(http_status_codes_1.default.OK).render('show', {
                title: 'a-mirror',
                stylesheet: server_1.makeUrl(server_1.UrlType.Cdn, '/css/style.css'),
                redditPostId: vid.redditPostId,
                videoLocation: server_1.makeUrl(server_1.UrlType.Cdn, '/video/', (vid.filename ? vid.filename : vid.redditPostId + '.mp4')),
                posterLocation: server_1.makeUrl(server_1.UrlType.Cdn, '/img/poster.png'),
                serverName: os_1.default.hostname().split('.')[0],
            });
        }
        return res.status(http_status_codes_1.default.NOT_FOUND).render('errors/404', {
            title: 'Mirror Not Found',
            stylesheet: server_1.makeUrl(server_1.UrlType.Cdn, '/css/style.css'),
            message: 'This video was not found in the database. Typically this means a-mirror has not been asked to mirror this post or doesn\'t have an agreement in place with the subreddit moderators to mirror links reliably.',
            serverName: os_1.default.hostname().split('.')[0]
        });
    });
});
exports.PublicController = router;
//# sourceMappingURL=public.controller.js.map