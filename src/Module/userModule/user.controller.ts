import {
  Body,
  Controller,
  Post,
  Res,
  HttpStatus,
  ParseIntPipe,
  Get,
  Delete,
  Param,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from 'src/utils/guard/auth.guard';
import { ERole, UserService } from './user.service';
import { Auth, IAuth } from 'src/utils/auth.decorator';
import { Response } from 'express';
import * as Joi from 'joi';
import { RoleGuard } from 'src/utils/guard/role.guard';
import { createValidation } from 'src/utils/validation/user.schema';

@UseGuards(AuthGuard)
@Controller('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @RoleGuard(ERole.z)
  async getUsers(
    @Auth() authUser: IAuth,
    @Res({ passthrough: true }) res: Response,
    @Query('page') page: number = 1,
  ) {
    // const schema = Joi.object()
    //   .options({ abortEarly: false })
    //   .keys({
    //     page: Joi.number().min(1).required(),
    //   })
    //   .unknown();

    // const valid = schema.validate({
    //   page,
    // });

    // if (valid.error) {
    //   return res.status(HttpStatus.UNAUTHORIZED).send({ error: valid.error });
    // }

    return this.userService.getAllUsers(page);

    // return res.status(Users.getStatus()).send({ error: Users.message });
    // } catch (e) {
    //   return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(e.message);
    // }
  }

  @Delete('/:id')
  @RoleGuard(ERole.z)
  async deleteUser(
    @Res({ passthrough: true }) res: Response,
    @Param('id', new ParseIntPipe()) id,
    @Auth() authUser: IAuth,
  ) {
    // try {
    return this.userService.deleteUser(id);
    // if ('msg' in user) {
    //   return user;
    // }
    // return res.status(user.getStatus()).send({ error: user.message });
    // } catch (e) {
    //   return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(e.message);
    // }
  }

  @Post()
  @RoleGuard(ERole.z)
  async createUser(
    @Res({ passthrough: true }) res: Response,
    @Auth() authUser: IAuth,
    @Body('role') role: string,
    @Body('userId') userId: string,
    @Body('password') password: string,
  ) {
    // const schema = Joi.object()
    //   .options({ abortEarly: false })
    //   .keys({
    //     role: Joi.string().valid('regular', 'manager', 'admin').required(),
    //     userId: Joi.string().trim().min(7).max(24).required(),
    //     password: Joi.string().trim().min(5).max(24).required(),
    //   })
    //   .unknown();

    // const valid = schema.validate({
    //   role: role,
    //   userId: userId,
    //   password: password,
    // });

    // if (valid.error) {
    //   return res
    //     .status(HttpStatus.UNAUTHORIZED)
    //     .send({ error: valid.error.message });
    // }
    const result = createValidation({ role, userId, password });
    // const user = await this.userService.createUser({
    //   role: result.role,
    //   userId: result.userId.trim().toLowerCase(),
    //   password: result.password.trim(),
    // });
    return this.userService.createUser({
      role: result.role,
      userId: result.userId.trim().toLowerCase(),
      password: result.password.trim(),
    });

    // if ('msg' in user) {
    //   return user;
    // }

    // return res.status(user.getStatus()).send({ error: user.message });
  }

  @Patch('/:id')
  @RoleGuard(ERole.z)
  async updateUser(
    @Res({ passthrough: true }) res: Response,
    @Param('id', new ParseIntPipe()) id,

    @Body('role') role: string,
    @Body('userId') userId: string,
    @Auth() authUser: IAuth,
  ) {
    // try {
    //   const schema = Joi.object()
    //     .options({ abortEarly: false })
    //     .keys({
    //       role: Joi.string().valid('regular', 'manager', 'admin').optional(),
    //       userId: Joi.string().trim().min(7).max(24).optional(),
    //     })
    //     .unknown();
    //   const valid = schema.validate({
    //     role: role,
    //     userId: userId,
    //   });
    //   if (valid.error) {
    //     return res
    //       .status(HttpStatus.UNAUTHORIZED)
    //       .send({ error: valid.error.message });
    //   }
    //   const user = await this.userService.updateUserForSpecificId({
    //     id,
    //     role,
    //     userId,
    //   });
    //   if ('msg' in user) {
    //     return user;
    //   }
    //   return res.status(user.getStatus()).send({ error: user.message });
    // } catch (e) {
    //   return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(e.message);
    // }
  }
}
