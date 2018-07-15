import express from 'express';
import bodyParser from 'body-parser';

import { APIController, PublicController } from './controllers';

import * as configurator from './configurator';
import { Database } from './db/database';

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

        app.use(bodyParser.urlencoded());
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
