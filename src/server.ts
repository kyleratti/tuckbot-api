import express from 'express';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';

import { APIController, PublicController } from './controllers';

import * as configurator from './configurator';
import { Database } from './db/database';

import os from 'os';
import path from 'path';

// load config
const config = configurator.load();

// load database
export var database = new Database(config.database.location);

export class WebServer {
    private app: express.Application;
    private port: number;
    
    constructor() {
        let app = express();
        let port = config.app.webPort || 3000;

        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(fileUpload());

        app.set('view engine', 'pug');

        app.use('/', PublicController);

        this.app = app;
        this.port = port;
    }

    start() {
        database.connect();

        this.app.listen(this.port, () => {
            console.log(`listening for web requests at http://127.0.0.1:${this.port}`);
        })
    }
}

export class CdnServer {
    private app: express.Application;
    private port: number;

    constructor() {
        let app = express();
        let port = config.app.cdnPort || 3001;

        this.app = app;
        this.port = port;
    }

    start() {
        this.app.use('/img', express.static(path.join(__dirname, '/../public/img')));
        this.app.use('/css', express.static(path.join(__dirname, '/../public/css')));
        this.app.use('/video', express.static(config.app.file.local.storageDir));

        this.app.listen(this.port, () => {
            console.log(`listening for cdn requests at http://127.0.0.1:${this.port}`);
        });
    }
}

export class ApiServer {
    private app: express.Application;
    private port: number;
 
    constructor() {
        let app = express();
        let port = config.app.apiPort || 3002;

        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use(fileUpload());

        app.use('/', APIController);

        this.app = app;
        this.port = port;
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`listening for api requests at http://127.0.0.1:${this.port}`);
        });
    }
}

/**
 * Sends a response to the HTTP request
 * @param res The response
 * @param status The HTTP status code to send
 * @param message The message to send with the status data
 * @param data The data to respond to the request with
 */
export function response(res, status, message, data?) {
    return res.status(status).send({
        data: data,
        status: {
            code: status,
            message: message,
            servedBy: os.hostname().split('.')[0]
        }
    });
}
