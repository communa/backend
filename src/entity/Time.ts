import {Column, Entity, ManyToOne, Unique} from 'typeorm';
import faker from 'faker';
import {Exclude, Expose, Type} from 'class-transformer';
import {JSONSchema} from 'class-validator-jsonschema';

import {AbstractBaseEntity} from './AbstractBaseEntity';
import {Activity} from './Activity';
import {ITime} from '../interface/ITime';
import {IsDate} from 'class-validator';

@JSONSchema({
  example: {
    id: faker.datatype.uuid(),
  },
})
@Entity()
@Exclude()
@Unique('UQ_ACTIVITYFROM', ['activity', 'fromAt'])
export class Time extends AbstractBaseEntity implements ITime {
  @Expose({groups: ['search']})
  @Type(() => Activity)
  @ManyToOne(() => Activity, {eager: true, nullable: false})
  activity: Activity;

  @Expose({groups: ['search', 'create', 'edit']})
  @Column('text', {nullable: true})
  note: string | null;

  @Expose({groups: ['search', 'create', 'edit']})
  @Column('int', {nullable: false})
  keyboardKeys: number;

  @Expose({groups: ['search', 'create', 'edit']})
  @Column('int', {nullable: false})
  mouseKeys: number;

  @Expose({groups: ['search', 'create', 'edit']})
  @Column('float', {nullable: false})
  mouseDistance: number;

  @Expose({groups: ['search', 'create', 'edit']})
  @Column('timestamptz', {nullable: false})
  @IsDate()
  fromAt: Date;

  @Expose({groups: ['search', 'create', 'edit']})
  @Column('timestamptz', {nullable: false})
  @IsDate()
  toAt: Date;
}
