import { HttpException, Injectable } from '@nestjs/common';
import * as Bcrypt from 'bcryptjs';
import { isNull } from 'lodash';
import { User } from 'src/db/entities/user.entity';

@Injectable()
export class UserService {
  async getAllUsers(page: number) {
    try {
      const limit = 4;
      const skipData = (page - 1) * 4;
      const [Data, totalCount] = await User.findAndCount({
        skip: skipData,
        take: limit,
      });

      return {
        msg: 'successfull',
        Data: Data,
        totalCount: totalCount,
        dataPerPage: limit,
        currentPage: page,
        totalPage: Math.ceil(totalCount / limit),
      };
    } catch (e) {
      return new HttpException(e.message, 400);
    }
  }

  async deleteUser(id: number) {
    try {
      const user = await User.findOneBy({ id: id });
      if (!user) {
        return new HttpException('user with this id is not present', 400);
      }
      const UserDelete = await User.delete(id);

      return {
        msg: 'Successfull',
        Data: UserDelete,
      };
    } catch (e) {
      return new HttpException(e.message, 400);
    }
  }

  async createUser({
    role,
    userId,
    password,
  }: {
    role: string;
    userId: string;
    password: string;
  }) {
    try {
      const user1 = await User.findOneBy({ userId: userId });
      if (!isNull(user1)) {
        throw new HttpException(
          `User with this userId: ${userId} is already registered`,
          400,
        );
      }
      const user = new User();
      user.userId = userId;
      user.password = Bcrypt.hashSync(password, 10);
      user.role = role;
      const userSave = await user.save();
      return {
        msg: 'successfull',
        User: userSave.id,
      };
    } catch (e) {
      return new HttpException(e.message, 400);
    }
  }

  async updateUserForSpecificId({
    id,
    role,
    userId,
  }: {
    id: number;
    role?: string;
    userId?: string;
  }) {
    try {
      if (userId) {
        userId = userId.trim().toLowerCase();
      }
      const user = await User.findOneBy({ id: id });

      if (!user) {
        return new HttpException(`User with this id:${id} is not exist`, 400);
      }

      if (userId) {
        const user1 = await User.findOneBy({ userId: userId });
        if (user1 && user1.id !== id) {
          return new HttpException(
            `User with this userId:${userId} already exist`,
            400,
          );
        }
      }

      const userupdate = await User.update(id, {
        role: role,
        userId: userId,
      });

      return {
        msg: 'Successfully Updated',
        Data: userupdate,
      };
    } catch (e) {
      return new HttpException(e.message, 400);
    }
  }
}
