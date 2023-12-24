import {Column, Entity, ManyToOne} from 'typeorm';
import faker from 'faker';
import {Exclude, Expose, Type} from 'class-transformer';
import {JSONSchema} from 'class-validator-jsonschema';

import {AbstractBaseEntity} from './AbstractBaseEntity';
import {Activity} from './Activity';
import {IsDate} from 'class-validator';
import {ITime} from '../interface/ITime';

@JSONSchema({
  example: {
    id: faker.datatype.uuid(),
  },
})
@Entity()
@Exclude()
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

  @Expose({groups: ['search']})
  @Column('timestamptz', {nullable: false})
  @IsDate()
  fromAt: Date;

  @Expose({groups: ['search']})
  @Column('timestamptz', {nullable: false})
  @IsDate()
  toAt: Date;
}
