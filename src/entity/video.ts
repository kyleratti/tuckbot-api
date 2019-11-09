import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";

export enum Status {
  NewRequest = 0,
  Downloading = 10,
  Transcoding = 20,

  LocallyMirrored = 40,

  PostedLocalMirror = 50,

  // Errors
  DownloadingFailed = 100,
  VideoUnavailable = 101,
  TranscodingFailed = 200
}

@Entity()
export class Video extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
    nullable: false
  })
  redditPostId: string;

  @Column({
    nullable: false
  })
  redditPostTitle: string;

  @Column({
    nullable: false
  })
  mirrorUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    nullable: true
  })
  @Index()
  lastViewedAt: Date;

  @Column({
    nullable: true
  })
  @Index()
  lastPrunedAt: Date;

  viewed() {
    this.lastViewedAt = new Date();
    return this.save();
  }

  prune() {
    this.lastPrunedAt = new Date();
    return this.save();
  }
}
