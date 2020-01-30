import { MigrationInterface, QueryRunner } from "typeorm";

export class ResetPrunedVideos1580421766 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`UPDATE videos SET lastPrunedAt = null`);
  }

  async down(queryRunner: QueryRunner): Promise<any> {
    // WARN: there is no undoing this
  }
}
