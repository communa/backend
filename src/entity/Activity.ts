import { Column, Entity, ManyToOne } from 'typeorm';
import faker from 'faker';
import { Exclude, Expose, Type } from 'class-transformer';
import { JSONSchema } from 'class-validator-jsonschema';

import { User } from './User';
import { AbstractBaseEntity } from './AbstractBaseEntity';
import { EActivityCancellationReason } from '../interface/EActivityCancellationReason';
import { EActivityType } from '../interface/EActivityType';
import { IsNotEmpty } from 'class-validator';
import { EActivityState } from '../interface/EActivityState';

@JSONSchema({
  example: {
    id: faker.datatype.uuid(),
  },
})
@Entity()
@Exclude()
export class Activity extends AbstractBaseEntity {
  @IsNotEmpty()
  @Expose({ groups: ['search', 'create'] })
  @Column('text', { nullable: true })
  title: string;
  @IsNotEmpty()
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
  @Expose({ groups: ['search', 'create'] })
  @Column('text', { nullable: true })
  rate: string;
  @Expose({ groups: ['search'] })
  @Column('text', { nullable: true })
  sourceUrl: string;

  @Expose({ groups: ['search'] })
  @Column('text', { nullable: true })
  jobUrl: string;

  @IsNotEmpty()
  @Expose({ groups: ['search'] })
  @Column('text', { nullable: true })
  type: EActivityType;
  @IsNotEmpty()
  @Expose({ groups: ['search', 'create'] })
  @Column('text', { nullable: true })
  state: EActivityState;

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
}
