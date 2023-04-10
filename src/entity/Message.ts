import { Column, Entity, ManyToOne } from 'typeorm';
import { IsNotEmpty } from 'class-validator';
import faker from 'faker';
import { Exclude, Expose, Type } from 'class-transformer';
import { JSONSchema } from 'class-validator-jsonschema';

import { User } from './User';
import { Room } from './Room';
import { IMessageState } from '../interface/IMessageState';
import { AbstractBaseEntity } from './AbstractBaseEntity';

@JSONSchema({
  example: {
    id: faker.datatype.uuid(),
  },
})
@Entity()
@Exclude()
export class Message extends AbstractBaseEntity {
  @Expose({ groups: ['search'] })
  @Type(() => Room)
  @IsNotEmpty()
  @ManyToOne(() => Room, { eager: true })
  room: Room;
  @Expose({ groups: ['search'] })
  @Type(() => User)
  @IsNotEmpty()
  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column('text')
  text: string;
  @Column('jsonb', { nullable: true })
  state: IMessageState;
}
