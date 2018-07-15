import {Sequelize} from 'sequelize-typescript';

import {injectable, singleton} from 'microinject';
import { Video } from '../models/video';

@injectable()
@singleton()
export class Database {
    private dbLocation: String;
    public db: Sequelize;

    constructor(dbLocation: string) {
        let db = new Sequelize({
            database: dbLocation,
            dialect: 'sqlite',
            username: 'root',
            password: '',
            storage: ':memory:',
            //modelPaths: [__dirname + '../models']
        });
        db.addModels([Video]);

        this.dbLocation = dbLocation;
        this.db = db;
    }

    connect() {
        this.db
        .authenticate()
        .then(() => {
            console.log("sqlite database loaded successfully");
        })
        .catch(err => {
            throw new Error("unable to load database: " + err);
        });

        this.db.sync();
    }
}
