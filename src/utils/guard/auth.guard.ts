import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
//   import { User } from 'src/db/entities/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      const token = request.headers.jwt;
      console.log(token);
      if (!token) {
        throw new HttpException('invalid token', 401);
      }
      const decoded = jwt.verify(token, 'secret_key');
      console.log(decoded, 'decod');
      if (!decoded) {
        throw new HttpException('invalid token', 401);
      }
      const userId: string = decoded.username;

      // const user = await User.findOneBy({ userId: userId });

      // request.authUser = user;

      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
