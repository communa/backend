import {Column, Entity, ManyToOne} from 'typeorm';
import faker from 'faker';
import {Exclude, Expose, Type} from 'class-transformer';
import {JSONSchema} from 'class-validator-jsonschema';

import {User} from './User';
import {AbstractBaseEntity} from './AbstractBaseEntity';
import {Activity} from './Activity';
import {IsNotEmpty} from 'class-validator';
import {EPaymentState} from '../interface/EPaymentState';

@JSONSchema({
  example: {
    id: faker.datatype.uuid(),
  },
})
@Entity()
@Exclude()
export class Payment extends AbstractBaseEntity {
  @Expose({groups: ['search']})
  @Type(() => User)
  @ManyToOne(() => User, {eager: true, nullable: false})
  user: User;
  @Expose({groups: ['search']})
  @Type(() => Activity)
  @ManyToOne(() => Activity, {eager: true, nullable: false})
  activity: Activity;

  @Expose({groups: ['search', 'create', 'edit']})
  @Column('float', {nullable: false})
  amount: number;
  @IsNotEmpty()
  @Expose({groups: ['search', 'create', 'edit']})
  @Column('text', {nullable: true})
  state: EPaymentState;
}
