import { HttpException, Injectable } from '@nestjs/common';
import * as Bcrypt from 'bcryptjs';
import { User } from 'src/db/entities/user.entity';
import * as jwt from 'jsonwebtoken';

export enum ERole {
  x = 'regular',
  y = 'manager',
  z = 'admin',
}

@Injectable()
export class UserService {
  async getAllUsers(page: number) {
    const limit: number = 4;
    const skipData: number = (page - 1) * 4;
    const [Data, totalCount] = await User.findAndCount({
      skip: skipData,
      take: limit,
    });

    return {
      msg: 'successfull',
      Data: Data,
      currentPage: page,
      totalPage: Math.ceil(totalCount / limit),
    };
  }

  async deleteUser(id: number) {
    const user = await User.findOneBy({ id: id });
    if (!user) {
      throw new HttpException('user with this id is not found', 404);
    }
    const UserDelete = await User.delete(id);

    return {
      msg: 'Successfull',
      Data: UserDelete,
    };
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
    const user1 = await User.findOneBy({ userId: userId });

    if (user1) {
      throw new HttpException(
        { error: `User with this userId: ${userId} is already registered` },
        409,
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
    if (userId) {
      userId = userId.trim().toLowerCase();
    }
    const user = await User.findOneBy({ id: id });

    if (!user) {
      throw new HttpException(`User with this id:${id} is not found`, 404);
    }

    if (userId) {
      const user1 = await User.findOneBy({ userId: userId });
      if (user1) {
        throw new HttpException(
          `User with this userId:${userId} already exist`,
          409,
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
  }

  async signUpUser({ userId, password }: { userId: string; password: string }) {
    const user1 = await User.findOneBy({ userId: userId });
    if (user1) {
      throw new HttpException(
        `User with this userId: ${userId} is already registered`,
        409,
      );
    }

    const user = new User();
    user.userId = userId;
    user.password = Bcrypt.hashSync(password, 10);
    await user.save();

    const token = jwt.sign(
      {
        username: user.userId,
      },
      'secret_key',
      { expiresIn: '3h' },
    );

    return {
      msg: 'successful',
      ...user,
      token: token,
    };
  }

  async loginUser(userId: string, password: string) {
    const user = await User.findOneBy({
      userId: userId,
    });

    if (!user) {
      throw new HttpException(`User with this id:${userId} is not found`, 404);
    }

    const isValidPassword = await Bcrypt.compare(
      password.trim(),
      user.password,
    );

    if (!isValidPassword) {
      throw new HttpException('invalid credential', 401);
    }

    const token = jwt.sign(
      {
        username: user.userId.toLowerCase().trim(),
      },
      'secret_key',
      { expiresIn: '24h' },
    );

    return {
      msg: 'successful',
      ...user,
      token: token,
    };
  }
}
