import {Column, Entity, ManyToOne} from 'typeorm';
import faker from 'faker';
import {Exclude, Expose, Type} from 'class-transformer';
import {JSONSchema} from 'class-validator-jsonschema';

import {AbstractBaseEntity} from './AbstractBaseEntity';
import {WebSite} from './WebSite';

@JSONSchema({
  example: {
    id: faker.datatype.uuid(),
  },
})
@Entity()
@Exclude()
export class WebPage extends AbstractBaseEntity {
  @Expose({groups: ['search']})
  @Column('text')
  url: string;

  @Expose({groups: ['search']})
  @Type(() => WebSite)
  @ManyToOne(() => WebSite, website => website.webpage)
  website: WebSite;

  @Expose({groups: ['search']})
  @Column('timestamptz', {nullable: true})
  processedAt: Date;

  @Expose({groups: ['search']})
  @Column('text', {nullable: true})
  error: string | null;
}
