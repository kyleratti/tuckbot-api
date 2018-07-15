import Sequelize from 'sequelize';

import { injectable, singleton } from 'microinject';

@injectable()
@singleton()
export class Database {
    private dbLocation: String;
    public db: Sequelize.Sequelize;

    constructor(dbLocation: String) {
        // TODO: connect to SQLite database
        let db = new Sequelize('sqlite:' + dbLocation);

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
        })
    }
}
