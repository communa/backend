import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import faker from 'faker';
import { Exclude, Expose, Type } from 'class-transformer';
import { JSONSchema } from 'class-validator-jsonschema';

import { AbstractBaseEntity } from './AbstractBaseEntity';
import { User } from './User';

@JSONSchema({
  example: {
    id: faker.datatype.uuid(),
  },
})
@Entity()
@Exclude()
export class Room extends AbstractBaseEntity {
  @Expose({ groups: ['search'] })
  @Type(() => User)
  @ManyToMany(() => User, user => user, { eager: true })
  @JoinTable({ name: 'room_users' })
  users: User[];

  @Column('integer')
  unread: number;
}
