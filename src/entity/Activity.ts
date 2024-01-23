import {Column, Entity, ManyToOne, OneToMany, OneToOne} from 'typeorm';
import faker from 'faker';
import {Exclude, Expose, Type} from 'class-transformer';
import {JSONSchema} from 'class-validator-jsonschema';

import {User} from './User';
import {AbstractBaseEntity} from './AbstractBaseEntity';
import {EActivityType} from '../interface/EActivityType';
import {IsNotEmpty} from 'class-validator';
import {EActivityState} from '../interface/EActivityState';
import {Proposal} from './Proposal';
import {Invoice} from './Invoice';
import {Time} from './Time';

@JSONSchema({
  example: {
    id: faker.datatype.uuid(),
  },
})
@Entity()
@Exclude()
export class Activity extends AbstractBaseEntity {
  @IsNotEmpty()
  @Expose({groups: ['search', 'create', 'edit']})
  @Column('text', {nullable: true})
  title: string;
  @IsNotEmpty()
  @Expose({groups: ['search', 'create', 'edit']})
  @Column('text', {nullable: true})
  text: any;
  @Expose({groups: ['search', 'create']})
  @Column('text', {nullable: true})
  location: string;
  @Expose({groups: ['search', 'create']})
  @Column('text', {nullable: true})
  position: string;
  @Expose({groups: ['search', 'create']})
  @Column('jsonb', {nullable: true})
  employment: string[];
  @Expose({groups: ['search', 'create', 'edit']})
  @Column('jsonb', {nullable: true})
  keywords: string[];

  @Expose({groups: ['search', 'create', 'edit']})
  @Column('text', {nullable: true})
  salary: string;
  @Expose({groups: ['search', 'create', 'edit']})
  @Column('text', {nullable: true})
  rate: string;
  @Expose({groups: ['search']})
  @Column('text', {nullable: true})
  sourceUrl: string;

  @Expose({groups: ['search']})
  @Column('text', {nullable: true})
  jobUrl: string;
  @Expose({groups: ['search']})
  @Column('text', {nullable: true})
  hash: string;

  @IsNotEmpty()
  @Expose({groups: ['search', 'create', 'edit']})
  @Column('text', {nullable: true})
  type: EActivityType;
  @IsNotEmpty()
  @Expose({groups: ['search', 'create', 'edit']})
  @Column('text', {nullable: true})
  state: EActivityState;

  @Expose({groups: ['search']})
  @Column('timestamptz', {nullable: true})
  processedAt: Date;
  @Expose({groups: ['search']})
  @Column('timestamptz', {nullable: true})
  cancelledAt: Date;
  @Expose({groups: ['search']})
  @Column('timestamptz', {nullable: true})
  startedAt: Date;
  @Expose({groups: ['search']})
  @Column('timestamptz', {nullable: true})
  closedAt: Date;

  @Expose({groups: ['search']})
  @Type(() => User)
  @ManyToOne(() => User, {eager: true, nullable: true})
  user: User;

  @Expose({groups: ['search']})
  @Type(() => Proposal)
  @OneToMany(() => Proposal, proposal => proposal.activity)
  proposals: Proposal[];

  @Expose({groups: ['search']})
  @Type(() => Invoice)
  @OneToMany(() => Invoice, invoice => invoice.activity)
  invoices: Invoice[];
  @Expose({groups: ['search']})
  @Type(() => Time)
  @OneToMany(() => Time, time => time.activity)
  time: Time[];

  @Expose({groups: ['search']})
  @Type(() => Proposal)
  @OneToOne(() => Proposal, proposal => proposal.activity)
  proposalAccepted: Proposal;
}
