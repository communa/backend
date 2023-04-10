import {Column, Entity, JoinTable, ManyToMany} from 'typeorm';
import faker from 'faker';
import {Exclude, Expose} from 'class-transformer';
import {JSONSchema} from 'class-validator-jsonschema';

import {AbstractBaseEntity} from './AbstractBaseEntity';
import {IsOptional} from 'class-validator';
import {Activity} from './Activity';

@JSONSchema({
  example: {
    id: faker.datatype.uuid(),
  },
})
@Entity()
@Exclude()
export class Tag extends AbstractBaseEntity {
  @ManyToMany(() => Activity, activity => activity.tags, {eager: true})
  @JoinTable({name: 'tag_activities'})
  activities: Activity[];
  @Expose({groups: ['search']})
  @Column('integer', {nullable: true})
  activitiesCount: number;

  @Expose()
  @Column('text', {nullable: true})
  @IsOptional({groups: ['search']})
  name: string;
  @Expose()
  @Column('text', {nullable: true})
  @IsOptional({groups: ['search']})
  type: string;
  @Expose()
  @Column('jsonb', {nullable: true})
  meta: any;
  @Expose()
  @Column('jsonb', {nullable: true})
  mentions: any;
}
