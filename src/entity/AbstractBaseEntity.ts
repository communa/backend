import {PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index} from 'typeorm';
import {Expose} from 'class-transformer';
import {IsOptional, IsDate, IsNotEmpty, IsUUID} from 'class-validator';

export abstract class AbstractBaseEntity {
  @Expose({groups: ['search']})
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  @IsOptional()
  @IsNotEmpty()
  id: string;

  @Expose({groups: ['search']})
  @Column('datetime')
  @CreateDateColumn()
  @Index()
  @IsDate()
  @IsOptional()
  createdAt: Date;

  @Expose({groups: ['search']})
  @Column('datetime')
  @UpdateDateColumn()
  @Index()
  @IsDate()
  @IsOptional()
  updatedAt: Date;
}
