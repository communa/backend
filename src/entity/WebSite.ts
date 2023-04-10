import { Column, Entity, OneToMany } from 'typeorm';
import faker from 'faker';
import { Exclude, Expose } from 'class-transformer';
import { JSONSchema } from 'class-validator-jsonschema';

import { AbstractBaseEntity } from './AbstractBaseEntity';
import { WebPage } from './WebPage';

@JSONSchema({
  example: {
    id: faker.datatype.uuid(),
  },
})
@Entity()
@Exclude()
export class WebSite extends AbstractBaseEntity {
  @OneToMany(() => WebPage, webpage => webpage.website)
  webpage: WebPage;

  @Expose({ groups: ['search'] })
  @Column('text')
  sitemap: string;

  @Expose({ groups: ['search'] })
  @Column('timestamptz', { nullable: true })
  processedAt: Date;
}
