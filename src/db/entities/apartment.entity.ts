import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Apartment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  monthlyRental: number;

  @Column()
  area: number; // should be in sq feet

  @Column()
  rooms: number;

  @Column()
  floors: number;

  @Column({ default: true })
  isAvailable: boolean;

  @Column()
  roomLatitude: number;

  @Column()
  roomLongitude: number;

  @ManyToOne(() => User, (user) => user.apartment, { onDelete: 'CASCADE' })
  @JoinColumn()
  createdBy: User;
}
