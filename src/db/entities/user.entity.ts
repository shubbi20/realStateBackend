import { join } from 'path';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Apartment } from './apartment.entity';
//   import { RegisteredBike } from './registeredBike.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  password: string;

  @Column({
    default: 'regular',
  })
  role: string; //two types 1>regular 2>manager 3>admin

  @OneToOne(() => Apartment, (apartment) => apartment.createdBy, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  apartment: Apartment;
  // @OneToMany(() => RegisteredBike, (registeredBike) => registeredBike.userId)
  // regBike: RegisteredBike[];
}
