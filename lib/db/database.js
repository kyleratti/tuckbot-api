"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const microinject_1 = require("microinject");
const video_1 = require("../models/video");
let Database = class Database {
    constructor(dbLocation) {
        let db = new sequelize_typescript_1.Sequelize({
            database: dbLocation,
            dialect: 'sqlite',
            username: 'root',
            password: '',
            storage: dbLocation,
            logging: false
        });
        db.addModels([video_1.Video]);
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
};
Database = __decorate([
    microinject_1.injectable(),
    microinject_1.singleton(),
    __metadata("design:paramtypes", [String])
], Database);
exports.Database = Database;
//# sourceMappingURL=database.js.map