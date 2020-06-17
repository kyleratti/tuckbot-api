import path from "path";
import { configurator, logger } from "tuckbot-util";
import {
  getConnectionManager,
  Logger as TypeOrmLogger,
  QueryRunner,
} from "typeorm";

class DatabaseLogger implements TypeOrmLogger {
  logQuery = (query: string, parameters?: any[], queryRunner?: QueryRunner) => {
    logger.info({
      msg: `Database Query: ${query}`,
      databaseQuery: {
        parameters: parameters,
        query: queryRunner?.query,
      },
    });
  };

  logQueryError = (
    error: string,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner
  ) => {
    logger.error({
      msg: `Database Query Error: ${query}`,
      error: {
        message: error,
      },
      databaseQuery: {
        parameters: parameters,
        query: queryRunner?.query,
      },
    });
  };

  logQuerySlow = (
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner
  ) => {
    logger.warn({
      msg: `Database Slow Query: ${query}`,
      databaseQuery: {
        executionTime: time,
        parameters: parameters,
        query: queryRunner?.query,
      },
    });
  };

  logSchemaBuild = (message: string, queryRunner?: QueryRunner) => {
    logger.debug({
      msg: `Database Schema Build: ${message}`,
      databaseQuery: {
        query: queryRunner?.query,
      },
    });
  };

  logMigration = (message: string, queryRunner?: QueryRunner) => {
    logger.info({
      msg: `Database Migration: ${message}`,
      databaseQuery: {
        query: queryRunner?.query,
      },
    });
  };

  log = (
    level: "log" | "info" | "warn",
    message: any,
    queryRunner?: QueryRunner
  ) => {
    const logFunc =
      level === "log" || level === "info" ? logger.info : logger.warn;

    const logData = {
      msg: message,
      databaseQuery: {
        query: queryRunner?.query,
      },
    };

    if (level === "log" || level === "info") logger.info(logData);
    else logger.warn(logData);
  };
}

export const db = getConnectionManager().create({
  type: "sqlite",
  database: path.resolve(
    process.env.DATABASE_LOCATION || "data/database.sqlite3"
  ),
  synchronize: true,
  logging:
    configurator.logger.level === "debug"
      ? "all"
      : ["error", "migration", "warn"],
  migrationsRun: true,
  entities: [__dirname + "/../entity/**{.ts,.js}"],
  migrations: [__dirname + "/../migration/**{.ts,.js}"],
  logger: new DatabaseLogger() as TypeOrmLogger,
});
