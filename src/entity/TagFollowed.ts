import {Entity, ManyToOne} from 'typeorm';
import faker from 'faker';
import {Exclude, Expose, Type} from 'class-transformer';
import {JSONSchema} from 'class-validator-jsonschema';

import {AbstractBaseEntity} from './AbstractBaseEntity';
import {User} from './User';
import {Tag} from './Tag';

@JSONSchema({
  example: {
    id: faker.datatype.uuid(),
  },
})
@Entity()
@Exclude()
export class TagFollowed extends AbstractBaseEntity {
  @Expose({groups: ['search']})
  @Type(() => User)
  @ManyToOne(() => User, {eager: true})
  user: User;

  @Expose({groups: ['search']})
  @Type(() => Tag)
  @ManyToOne(() => Tag, {eager: true})
  tag: Tag;
}
