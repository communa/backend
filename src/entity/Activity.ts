import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';
import faker from 'faker';
import { Exclude, Expose, Type } from 'class-transformer';
import { JSONSchema } from 'class-validator-jsonschema';

import { User } from './User';
import { Tag } from './Tag';
import { AbstractBaseEntity } from './AbstractBaseEntity';
import { EActivityCancellationReason } from '../interface/EActivityCancellationReason';

@JSONSchema({
  example: {
    id: faker.datatype.uuid(),
  },
})
@Entity()
@Exclude()
export class Activity extends AbstractBaseEntity {
  @Expose({ groups: ['search'] })
  @Column('text', { nullable: true })
  title: string;
  @Expose({ groups: ['search', 'create'] })
  @Column('text', { nullable: true })
  text: any;
  @Expose({ groups: ['search', 'create'] })
  @Column('text', { nullable: true })
  location: string;
  @Expose({ groups: ['search', 'create'] })
  @Column('text', { nullable: true })
  position: string;
  @Expose({ groups: ['search', 'create'] })
  @Column('jsonb', { nullable: true })
  employment: string[];
  @Expose({ groups: ['search', 'create'] })
  @Column('jsonb', { nullable: true })
  keywords: string[];

  @Expose({ groups: ['search', 'create'] })
  @Column('text', { nullable: true })
  salary: string;
  @Expose({ groups: ['search'] })
  @Column('text', { nullable: true })
  sourceUrl: string;

  @Expose({ groups: ['search'] })
  @Column('text', { nullable: true })
  jobUrl: string;

  @Expose({ groups: ['search'] })
  @Column('timestamptz', { nullable: true })
  processedAt: Date;

  @Expose({ groups: ['search'] })
  @Column('timestamptz', { nullable: true })
  cancelledAt: Date;
  @Expose({ groups: ['search'] })
  @Column('text', { nullable: true })
  cancellationReason: EActivityCancellationReason;

  @Expose({ groups: ['search'] })
  @Type(() => User)
  @ManyToOne(() => User, { eager: true, nullable: true })
  user: User;

  @ManyToMany(() => Tag, tag => tag.activities)
  tags: Tag[];

  @Expose({ name: 'status', groups: ['search'] })
  status() {
    return 'draft';
  }

  @Expose({ name: 'tags', groups: ['search'] })
  getTags() {
    return [];
  }
}
