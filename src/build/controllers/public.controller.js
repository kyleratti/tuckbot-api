"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var router = express_1.Router();
router.get('/', function (req, res) {
    res.send('Hello, world!');
});
router.get('/:redditPostId', function (req, res) {
    var redditPostId = req.params.redditPostId;
    res.send('Hello reddit post ' + redditPostId);
});
exports.PublicController = router;
//# sourceMappingURL=public.controller.js.map