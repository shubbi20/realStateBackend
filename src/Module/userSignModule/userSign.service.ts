import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import * as Bcrypt from 'bcryptjs';
import { isNull } from 'lodash';
import * as jwt from 'jsonwebtoken';
import { User } from 'src/db/entities/user.entity';

@Injectable()
export class UserSignService {
  async signUpUser({ userId, password }: { userId: string; password: string }) {
    try {
      const user1 = await User.findOneBy({ userId: userId });
      if (!isNull(user1)) {
        return new HttpException(
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
    } catch (e) {
      return new HttpException(e.message, 500);
    }
  }

  async loginUser(userId: string, password: string) {
    try {
      const user = await User.findOneBy({
        userId: userId,
      });
      if (isNull(user)) {
        return new HttpException(
          `User with this id:${userId} is not found`,
          404,
        );
      }

      const isValidPassword = await Bcrypt.compare(
        password.trim(),
        user.password,
      );

      if (!isValidPassword) {
        return new HttpException('invalid credential', 401);
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
    } catch (e) {
      return new HttpException(e.message, 400);
    }
  }
}
