"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var controllers_1 = require("./controllers");
var configurator = require("./configurator");
// load config
var config = configurator.load();
var Server = /** @class */ (function () {
    function Server() {
        var app = express();
        var port = config.app.port || 3000;
        app.use('/', controllers_1.PublicController);
        app.use('/api', controllers_1.APIController);
        this.app = app;
        this.port = port;
    }
    Server.prototype.start = function () {
        var _this = this;
        this.app.listen(this.port, function () {
            console.log("Listening at http://127.0.0.1:" + _this.app.port);
        });
    };
    return Server;
}());
exports.default = Server;
//# sourceMappingURL=server.js.map