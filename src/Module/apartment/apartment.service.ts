import { HttpException, Injectable } from '@nestjs/common';
import * as Bcrypt from 'bcryptjs';
import { isNull } from 'lodash';
import { Apartment } from 'src/db/entities/apartment.entity';
import { User } from 'src/db/entities/user.entity';
import { Brackets } from 'typeorm';

@Injectable()
export class ApartmentService {
  async createApartment({
    address,
    monthlyRental,
    area,
    rooms,
    floors,
    isAvailable,
    roomLatitude,
    roomLongitude,
    userId,
  }: {
    address: string;
    monthlyRental: number;
    area: number;
    rooms: number;
    floors: number;
    isAvailable?: boolean;
    roomLatitude: number;
    roomLongitude: number;
    userId: number;
  }) {
    const user = await User.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new HttpException(`User with this id:${userId} is not found`, 404);
    }

    const apartment = new Apartment();
    apartment.address = address;
    apartment.monthlyRental = monthlyRental;
    apartment.area = area;
    apartment.rooms = rooms;
    apartment.floors = floors;
    apartment.isAvailable = isAvailable;
    apartment.roomLatitude = roomLatitude;
    apartment.roomLongitude = roomLongitude;
    apartment.createdBy = user;

    const apartmentSave = await apartment.save();

    return {
      msg: 'SuccessFull',
      apartment: apartmentSave.id,
    };
  }

  async filterApartment({
    page,
    monthlyRental,
    area,
    floors,
    rooms,
    role,
    userid,
  }: {
    page: number;
    monthlyRental?: number;
    area?: number;
    floors?: number;
    rooms?: number;
    role: string;
    userid: number;
  }) {
    const limit = 4;
    const currentpage: number = (page - 1) * limit;

    let apartmentData = await Apartment.createQueryBuilder(
      'apartment',
    ).leftJoinAndSelect('apartment.createdBy', 'createdBy');

    if (role === 'manager') {
      apartmentData = await apartmentData.where(
        new Brackets((qb) => {
          qb.where('apartment.isAvailable=:value', { value: true }).orWhere(
            'apartment.createdBy.id=:id',
            { id: userid },
          );
        }),
      );
    }

    if (role === 'regular') {
      apartmentData = await apartmentData.where(
        'apartment.isAvailable=:value',
        { value: true },
      );
    }

    if (monthlyRental) {
      apartmentData = await apartmentData.andWhere(
        'apartment.monthlyRental >= :rental',
        {
          rental: monthlyRental,
        },
      );
    }

    if (area) {
      apartmentData = await apartmentData.andWhere('apartment.area >= :Area', {
        Area: area,
      });
    }

    if (rooms) {
      apartmentData = await apartmentData.andWhere('apartment.rooms>= :Rooms', {
        Rooms: rooms,
      });
    }

    if (floors) {
      apartmentData = await apartmentData.andWhere(
        'apartment.floors >= :Floors',
        {
          Floors: floors,
        },
      );
    }

    const Data = await apartmentData.offset(currentpage).limit(limit).getMany();

    const DataCount = await apartmentData.getCount();

    return {
      msg: 'successful',
      Data: Data,

      currentPage: page,
      totalPage: Math.ceil(DataCount / limit),
    };
  }

  async deleteApartment(id: number, userId: number, role: string) {
    const apart = await Apartment.createQueryBuilder('apart')
      .where('apart.id=:id', { id: id })
      .leftJoinAndSelect('apart.createdBy', 'createdBy')
      .getOne();

    if (!apart) {
      throw new HttpException(`apartment with this id:${id} is not found`, 404);
    }

    const result = this.checkManagerApartment({
      role,
      id: apart.createdBy.id,
      userId,
    });
    if (!result) {
      throw new HttpException(
        'manager can only delete his own apartments',
        403,
      );
    }

    const apartment = await Apartment.delete(id);

    return {
      msg: 'Successfully',
      Data: apartment,
    };
  }

  async updateApartment({
    id,
    monthlyRental,
    area,
    rooms,
    floors,
    isAvailable,
    role,
    userId,
  }: {
    id: number;
    monthlyRental: number;
    area: number;
    rooms: number;
    floors: number;
    isAvailable: boolean;
    role: string;
    userId: number;
  }) {
    const apart = await Apartment.createQueryBuilder('apart')
      .leftJoinAndSelect('apart.createdBy', 'createdBy')
      .where('apart.id = :id', {
        id: id,
      })
      .getOne();

    if (!apart) {
      throw new HttpException(`apartment with this id:${id} is not found`, 404);
    }

    const result = this.checkManagerApartment({
      role,
      id: apart.createdBy.id,
      userId,
    });
    if (!result) {
      throw new HttpException(
        'manager can only update his own apartments',
        403,
      );
    }

    const apartment = await Apartment.update(id, {
      monthlyRental: monthlyRental,
      area: area,
      rooms: rooms,
      floors: floors,
      isAvailable: isAvailable,
    });

    return {
      msg: 'Updated Successfull',
      Data: apartment,
    };
  }

  async onlyApartment({ page, userId }: { page: number; userId: number }) {
    const limit: number = 4;
    const currentpage: number = (page - 1) * limit;

    let apartmentData = await Apartment.createQueryBuilder(
      'apartment',
    ).leftJoinAndSelect('apartment.createdBy', 'createdBy');

    apartmentData = await apartmentData.where(
      'apartment.createdBy.id = :userid',
      { userid: userId },
    );

    const Data = await apartmentData.offset(currentpage).limit(limit).getMany();

    const DataCount = await apartmentData.getCount();

    return {
      msg: 'successful',
      Data: Data,
      currentPage: page,
      totalPage: Math.ceil(DataCount / limit),
    };
  }

  checkManagerApartment = ({
    role,
    id,
    userId,
  }: {
    role: string;
    id: number;
    userId: number;
  }) => {
    if (role === 'manager' && id !== userId) {
      return false;
    }
    return true;
  };
}
