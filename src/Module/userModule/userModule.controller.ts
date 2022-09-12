import {
  Body,
  Controller,
  Post,
  Res,
  HttpStatus,
  ParseIntPipe,
  UsePipes,
  Get,
  Delete,
  Param,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { getCustomRepositoryToken } from '@nestjs/typeorm';
import { AuthGuard } from 'src/utils/guard/auth.guard';
import { UserService } from './userModule.service';
import { Auth, IAuth } from 'src/utils/auth.decorator';
import { Response } from 'express';
import * as Joi from 'joi';

@UseGuards(AuthGuard)
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('getUsers')
  async getUsers(
    @Auth() authUser: IAuth,
    @Res({ passthrough: true }) res: Response,
    @Query('page') page: number = 1,
  ) {
    try {
      if (authUser.role === 'regular' || authUser.role === 'manager') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ msg: 'Regular/Manager user cannot perform any function' });
      }

      const schema = Joi.object()
        .options({ abortEarly: false })
        .keys({
          page: Joi.number().min(1).required(),
        })
        .unknown();

      const valid = schema.validate({
        page,
      });
      console.log(valid);

      if (valid.error) {
        return res.status(HttpStatus.BAD_REQUEST).send({ error: valid.error });
      }

      const Users = await this.userService.getAllUsers(page);
      if ('msg' in Users) {
        return Users;
      }
      return res.status(HttpStatus.BAD_REQUEST).send(Users);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).send(e.message);
    }
  }

  @Delete('deleteUser/:id')
  async deleteUser(
    @Res({ passthrough: true }) res: Response,
    @Param('id', new ParseIntPipe()) id,
    @Auth() authUser: IAuth,
  ) {
    try {
      if (authUser.role === 'regular' || authUser.role === 'manager') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ msg: 'Regular/Manager user cannot delete user' });
      }
      const user = await this.userService.deleteUser(id);
      if ('msg' in user) {
        return user;
      }
      return res.status(HttpStatus.BAD_REQUEST).send(user);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).send(e.message);
    }
  }

  @Post('createUser')
  async createUser(
    @Res({ passthrough: true }) res: Response,
    @Auth() authUser: IAuth,
    @Body('role') role: string,
    @Body('userId') userId: string,
    @Body('password') password: string,
  ) {
    try {
      if (authUser.role === 'regular' || authUser.role === 'manager') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ msg: 'Regular user cannot add user' });
      }
      const schema = Joi.object()
        .options({ abortEarly: false })
        .keys({
          role: Joi.string().valid('regular', 'manager', 'admin').required(),
          userId: Joi.string().trim().min(7).max(24).required(),
          password: Joi.string().trim().min(5).max(24).required(),
        })
        .unknown();

      const valid = schema.validate({
        role: role,
        userId: userId,
        password: password,
      });

      if (valid.error) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ error: valid.error.message });
      }

      const registeredBike = await this.userService.createUser({
        role,
        userId: userId.trim().toLowerCase(),
        password: password.trim(),
      });
      if ('msg' in registeredBike) {
        return registeredBike;
      }
      return res.status(HttpStatus.BAD_REQUEST).send(registeredBike);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).send(e.message);
    }
  }

  @Patch('updateUser/:id')
  async updateUser(
    @Res({ passthrough: true }) res: Response,
    @Param('id', new ParseIntPipe()) id,
    @Body('role') role: string,
    @Body('userId') userId: string,
    @Auth() authUser: IAuth,
  ) {
    try {
      if (authUser.role === 'regular' || authUser.role === 'manager') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ msg: 'Regular/Manager user cannot update user' });
      }
      const schema = Joi.object()
        .options({ abortEarly: false })
        .keys({
          role: Joi.string().valid('regular', 'manager', 'admin').optional(),
          userId: Joi.string().trim().min(7).max(24).optional(),
        })
        .unknown();

      const valid = schema.validate({
        role: role,
        userId: userId,
      });

      if (valid.error) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ error: valid.error.message });
      }

      const users = await this.userService.updateUserForSpecificId({
        id,
        role,
        userId,
      });
      if ('msg' in users) {
        return users;
      }
      return res.status(HttpStatus.BAD_REQUEST).send(users);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).send(e.message);
    }
  }
}
