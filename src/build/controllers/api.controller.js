"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var router = express_1.Router();
router.get('/video/getinfo/:redditPostId', function (req, res) {
    var redditPostId = req.params.redditPostId;
    res.send('Hello reddit post ' + redditPostId);
});
exports.APIController = router;
//# sourceMappingURL=api.controller.js.map