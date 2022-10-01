import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { UserSignService } from './userSign.service';

import { Response } from 'express';
import * as Joi from 'joi';

@Controller()
export class UserSignController {
  constructor(private readonly userSignService: UserSignService) {}

  @Post('signup')
  async userSignUp(
    @Res({ passthrough: true }) res: Response,
    @Body('userId') userId: string,
    @Body('password') password: string,
  ) {
    try {
      const schema = Joi.object()
        .options({ abortEarly: false })
        .keys({
          userId: Joi.string().trim().min(7).max(24).required(),
          password: Joi.string().trim().min(5).max(24).required(),
        })
        .unknown();

      const { value, error } = schema.validate({
        userId,
        password,
      });

      if (error) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .send({ error: error.message });
      }

      console.log(value.password);
      const saved = await this.userSignService.signUpUser({
        userId: value.userId.trim().toLowerCase(),
        password: value.password,
      });

      if ('msg' in saved) {
        return saved;
      }

      return res.status(saved.getStatus()).send({ error: saved.message });
    } catch (e) {
      return new HttpException(e.message, 500);
    }
  }

  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body('userId') userId: string,
    @Body('password') password: string,
  ) {
    try {
      const schema = Joi.object()
        .options({ abortEarly: false })
        .keys({
          userId: Joi.string().trim().min(7).max(24).required(),
          password: Joi.string().trim().min(5).max(24).required(),
        })
        .unknown();

      const { value, error } = schema.validate({
        userId,
        password,
      });

      if (error) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .send({ error: error.message });
      }

      const saved = await this.userSignService.loginUser(
        userId.trim().toLowerCase(),
        value.password.trim(),
      );

      if ('msg' in saved) {
        return saved;
      }
      return res.status(saved.getStatus()).send({ error: saved.message });
    } catch (e) {
      return new HttpException(e.message, 500);
    }
  }
}
