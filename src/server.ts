import express from 'express';
import bodyParser from 'body-parser';

import { APIController, PublicController } from './controllers';

import * as configurator from './configurator';
import { Database } from './db/database';

import os from 'os';

// load config
const config = configurator.load();

// load database
export var database = new Database(config.database.location);

export default class Server {
    private app: express.Application;
    private port: Number;
    
    constructor() {
        let app = express();
        let port = config.app.port || 3000;

        app.use(bodyParser.urlencoded({ extended: true  }));
        app.use(bodyParser.json());

        app.use('/', PublicController);
        app.use('/api', APIController);

        this.app = app;
        this.port = port;
    }

    start() {
        database.connect();

        this.app.listen(this.port, () => {
            console.log(`Listening at http://127.0.0.1:${this.port}`);
        })
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
