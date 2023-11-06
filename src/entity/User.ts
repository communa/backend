import {Entity, Column, Index, BeforeUpdate, BeforeInsert, OneToMany} from 'typeorm';
import * as faker from 'faker';
import {JSONSchema} from 'class-validator-jsonschema';
import {Exclude, Expose} from 'class-transformer';

import {IsOptional, Validate} from 'class-validator';
import {AbstractBaseEntity} from './AbstractBaseEntity';
import {UserNameExistConstraint} from '../validator/constraint/UserNameExistConstraint';
import {EmailOrPhoneConstraint} from '../validator/constraint/EmailOrPhoneConstraint';
import {PhoneConstraint} from '../validator/constraint/PhoneConstraint';
import {EmailConstraint} from '../validator/constraint/EmailConstraint';
import {EUserRole} from '../interface/EUserRole';
import {IUser} from '../interface/IUser';
import {Activity} from './Activity';
import {Application} from './Application';

@JSONSchema({
  example: {
    id: faker.datatype.uuid(),
  },
})
@Entity()
@Exclude()
export class User extends AbstractBaseEntity implements IUser {
  @Expose({groups: ['search', 'register']})
  @Column('text', {unique: true})
  address: string;

  // General
  @Expose({groups: ['search', 'edit']})
  @Validate(UserNameExistConstraint, [], {groups: ['invite']})
  @Column('text', {nullable: true, unique: true})
  userName: string;
  @Expose({groups: ['search', 'edit', 'register']})
  @Validate(EmailOrPhoneConstraint, [], {groups: ['register']})
  emailOrPhone: string;
  @Expose({groups: ['search', 'edit']})
  @Index({unique: true})
  @Validate(EmailConstraint, [], {
    groups: ['search', 'edit'],
  })
  @Column('text', {nullable: true})
  @IsOptional({groups: ['edit']})
  email: string;
  @Expose({groups: ['search', 'edit']})
  @Column('text', {nullable: true})
  @Validate(PhoneConstraint, [], {
    groups: ['search', 'edit'],
  })
  @IsOptional({groups: ['edit']})
  @Index({unique: true})
  phone: string;
  @Expose({groups: ['search', 'edit']})
  @Column('text', {nullable: true})
  company: string;
  @Expose({groups: ['search', 'edit']})
  @Column('text', {nullable: true})
  bio: string;

  // Social
  @Expose({groups: ['search', 'edit']})
  @Column('text', {nullable: true})
  facebook: string;
  @Expose({groups: ['search', 'edit']})
  @Column('text', {nullable: true})
  linkedIn: string;
  @Expose({groups: ['search', 'edit']})
  @Column('text', {nullable: true})
  twitter: string;
  @Expose({groups: ['search', 'edit']})
  @Column('text', {nullable: true})
  instagram: string;
  @Expose({groups: ['search', 'edit']})
  @Column('text', {nullable: true})
  youtube: string;
  @Expose({groups: ['search', 'edit']})
  @Column('text', {nullable: true})
  telegram: string;
  @Column('text', {nullable: true})
  whatsapp: string;

  // Address
  @Expose({groups: ['search', 'edit']})
  @Column('text', {nullable: true})
  lat: string;
  @Expose({groups: ['search', 'edit']})
  @Column('text', {nullable: true})
  lng: string;
  @Expose({groups: ['search', 'edit']})
  @Column('text', {nullable: true})
  address1: string;
  @Expose({groups: ['search', 'edit']})
  @Column('text', {nullable: true})
  address2: string;
  @Expose({groups: ['search', 'edit']})
  @Column('text', {nullable: true})
  postalCode: string;
  @Expose({groups: ['search', 'edit']})
  @Column('text', {nullable: true})
  city: string;
  @Expose({groups: ['search', 'edit']})
  @Column('text', {nullable: true})
  region: string;
  @Expose({groups: ['search', 'edit']})
  @Column('text', {nullable: true})
  country: string;

  @OneToMany(() => Activity, activity => activity.user)
  activities: Activity[];
  @OneToMany(() => Application, application => application.user)
  applications: Application[];

  @Expose({groups: ['search']})
  @Column('integer', {nullable: true})
  activitiesCount: number;

  @Expose({groups: ['search', 'edit']})
  @Column('text', {nullable: true})
  tz: string;
  @Expose({groups: ['search', 'edit']})
  @Column('text', {array: true})
  roles: EUserRole[] = [];

  @Column('text', {nullable: true})
  resetPasswordJwtIat: string | null;
  @Column('text', {nullable: true})
  query: string;

  //Notifications
  @Expose({groups: ['search', 'edit']})
  @Column('bool', {nullable: true, default: true})
  isAlertActivities: boolean;
  @Expose({groups: ['search', 'edit']})
  @Column('bool', {nullable: true, default: true})
  isAlertMessages: boolean;
  @Expose({groups: ['search', 'edit']})
  @Column('bool', {nullable: true, default: true})
  isEmailNewsletter: boolean;

  @Expose({name: 'name', groups: ['search']})
  name() {
    return this.userName || this.id;
  }

  hasRole(role: EUserRole): boolean {
    return this.roles.indexOf(role) > -1;
  }

  @BeforeInsert()
  @BeforeUpdate()
  setQuery() {
    if (this.email) {
      this.query = `${this.email.toLowerCase()}`.toLowerCase();
    }
    if (this.phone) {
      this.query = `${this.phone.toLowerCase()}`.toLowerCase();
    }
  }
}
