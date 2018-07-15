import Sequelize from 'sequelize';
export declare class Database {
    private dbLocation;
    db: Sequelize.Sequelize;
    constructor(dbLocation: String);
    connect(): void;
}
