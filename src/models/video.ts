import sequelize from 'sequelize';
import { database } from "../server";

/*
    {
        id,
        redditPostId,
        status,
        views,
        lastView
    }
*/

let Video = database.db.define('video', {
    id: {
        type: sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    redditPostId: {
        type: sequelize.STRING,
        allowNull: false,
        unique: true
    },
    status: {
        type: sequelize.INTEGER,
        allowNull: false,
        defaultValue: -1
    },
    views: {
        type: sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    lastView: {
        type: sequelize.DATE,
        allowNull: true
    }
});

export sequelize.Model Video;
