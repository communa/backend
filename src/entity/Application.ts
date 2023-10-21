import {Column, Entity, ManyToOne} from 'typeorm';
import faker from 'faker';
import {Exclude, Expose, Type} from 'class-transformer';
import {JSONSchema} from 'class-validator-jsonschema';
import {IsNotEmpty} from 'class-validator';

import {User} from './User';
import {AbstractBaseEntity} from './AbstractBaseEntity';
import {Activity} from './Activity';

@JSONSchema({
  example: {
    id: faker.datatype.uuid(),
  },
})
@Entity()
@Exclude()
export class Application extends AbstractBaseEntity {
  @IsNotEmpty()
  @Expose({groups: ['search', 'create', 'edit']})
  @Column('text', {nullable: true})
  text: any;
  @Expose({groups: ['search', 'create', 'edit']})
  @Column('text', {nullable: true})
  rate: string;

  @Expose({groups: ['search']})
  @Type(() => User)
  @ManyToOne(() => User, {eager: true, nullable: false})
  user: User;
  @Expose({groups: ['search']})
  @Type(() => Activity)
  @ManyToOne(() => Activity, {eager: true, nullable: false})
  activity: Activity;
}
