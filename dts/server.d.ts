import { Database } from './db/database';
export declare var database: Database;
export default class Server {
    private app;
    private port;
    constructor();
    start(): void;
}
