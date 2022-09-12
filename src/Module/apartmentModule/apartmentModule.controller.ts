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
import { AuthGuard } from 'src/utils/guard/auth.guard';

import { Auth, IAuth } from 'src/utils/auth.decorator';
import { Response } from 'express';
import * as Joi from 'joi';
import { ApartmentService } from './apartmentModule.service';
import { isAbsolute } from 'path';
import { Apartment } from 'src/db/entities/apartment.entity';

@UseGuards(AuthGuard)
@Controller()
export class ApartmentController {
  constructor(private readonly apartmentService: ApartmentService) {}

  @Post('createApartment')
  async createApartment(
    @Res({ passthrough: true }) res: Response,
    @Auth() authUser: IAuth,
    @Body('address') address: string,
    @Body('monthlyRental') monthlyRental: number,
    @Body('area') area: number,
    @Body('rooms') rooms: number,
    @Body('floors') floors: number,
    @Body('isAvailable') isAvailable: boolean,
    @Body('roomLatitude') roomLatitude: number,
    @Body('roomLongitude') roomLongitude: number,
    @Body('userId') userId: number,
  ) {
    try {
      if (authUser.role === 'regular') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ msg: 'Regular user cannot add Apartment' });
      }

      const schema = Joi.object()
        .options({ abortEarly: false })
        .keys({
          address: Joi.string().trim().min(3).max(45).required(),
          monthlyRental: Joi.number().min(0).required(),
          area: Joi.number().min(0).required(),
          rooms: Joi.number().min(0).required(),
          floors: Joi.number().min(0).required(),
          isAvailable: Joi.boolean().optional(),
          roomLatitude: Joi.number().required(),
          roomLongitude: Joi.number().required(),
        })
        .unknown();
      //Longitude and latitude can be negative so handle accordingly

      const valid = schema.validate({
        address,
        monthlyRental,
        area,
        rooms,
        floors,
        isAvailable,
        roomLatitude,
        roomLongitude,
      });

      if (valid.error) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ msg: 'Body fields not valid', error: valid.error.message });
      }

      const apartment = await this.apartmentService.createApartment({
        address,
        monthlyRental,
        area,
        rooms,
        floors,
        isAvailable,
        roomLatitude,
        roomLongitude,
        userId,
      });

      if ('msg' in apartment) {
        return apartment;
      }

      return res.status(HttpStatus.BAD_REQUEST).send(apartment);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).send(e.message);
    }
  }

  @Get('getApartments')
  async getApartment(
    @Res({ passthrough: true }) res: Response,
    @Query('page') page: number = 1,
    @Auth() authUser: IAuth,
  ) {
    try {
      const schema = Joi.object()
        .options({ abortEarly: false })
        .keys({
          page: Joi.number().min(1).required(),
        })
        .unknown();

      const valid = schema.validate({
        page,
      });

      if (valid.error) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ error: valid.error.message });
      }
      const apartments = await this.apartmentService.getApartments(page);
      if ('msg' in apartments) {
        return apartments;
      }

      return res.status(HttpStatus.BAD_REQUEST).send(apartments);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).send(e.message);
    }
  }

  @Get('getapartment')
  async getapartment(
    @Res({ passthrough: true }) res: Response,
    @Query('page') page: number = 1,
    @Query('monthlyRental') monthlyRental: number,
    @Query('floors') floors: number,
    @Query('rooms') rooms: number,
    @Query('area') area: number,
    @Auth() authUser: IAuth,
  ) {
    try {
      const schema = Joi.object()
        .options({ abortEarly: false })
        .keys({
          monthlyRental: Joi.number().min(0),
          area: Joi.number().min(0),
          rooms: Joi.number().min(0),
          floors: Joi.number().min(0),
        })
        .unknown();
      //Longitude and latitude can be negative so handle accordingly

      const valid = schema.validate({
        monthlyRental,
        area,
        rooms,
        floors,
      });

      if (valid.error) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ msg: 'Body fields not valid', error: valid.error.message });
      }

      const apartments = await this.apartmentService.filterApartment({
        page,
        monthlyRental,
        area,
        floors,
        rooms,
        role: authUser.role,
        userid: authUser.id,
      });

      if ('msg' in apartments) {
        return apartments;
      }

      return res.status(HttpStatus.BAD_REQUEST).send(apartments);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).send(e.message);
    }
  }

  @Delete('apartment/:id')
  async deleteApartment(
    @Res({ passthrough: true }) res: Response,
    @Auth() authUser: IAuth,
    @Param('id', new ParseIntPipe()) id,
  ) {
    try {
      if (authUser.role === 'regular') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ msg: 'Regular user cannot delete bike' });
      }

      const apartment = await this.apartmentService.deleteApartment(
        id,
        authUser.id,
        authUser.role,
      );
      if ('msg' in apartment) {
        return apartment;
      }
      return res.status(HttpStatus.BAD_REQUEST).send(apartment);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).send(e.message);
    }
  }

  @Patch('updateApartment/:id')
  async updateApartment(
    @Auth() authUser: IAuth,
    @Res({ passthrough: true }) res: Response,
    @Param('id', new ParseIntPipe()) id,
    @Body('monthlyRental') monthlyRental: number,
    @Body('area') area: number,
    @Body('rooms') rooms: number,
    @Body('floors') floors: number,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    try {
      const schema = Joi.object()
        .options({ abortEarly: false })
        .keys({
          monthlyRental: Joi.number().min(0).required(),
          area: Joi.number().min(0).required(),
          rooms: Joi.number().min(0).required(),
          floors: Joi.number().min(0).required(),
          isAvailable: Joi.boolean().optional(),
        })
        .unknown();
      //Longitude and latitude can be negative so handle accordingly

      const valid = schema.validate({
        monthlyRental,
        area,
        rooms,
        floors,
        isAvailable,
      });

      if (valid.error) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ msg: 'Body fields not valid', error: valid.error.message });
      }

      const apartment = await this.apartmentService.updateApartment({
        id,
        monthlyRental,
        area,
        rooms,
        floors,
        isAvailable,
        role: authUser.role,
      });

      if ('msg' in apartment) {
        return apartment;
      }
      return res.status(HttpStatus.BAD_REQUEST).send(apartment);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).send(e.message);
    }
  }

  @Get('onlyApartment')
  async onlyApartment(
    @Res({ passthrough: true }) res: Response,
    @Query('page') page: number = 1,
    @Auth() authUser: IAuth,
  ) {
    try {
      if (authUser.role !== 'manager') {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .send({ msg: 'only manager is authorized' });
      }

      const apartment = await this.apartmentService.onlyApartment({
        page,
        userId: authUser.id,
      });

      if ('msg' in apartment) {
        return apartment;
      }
      return res.status(HttpStatus.BAD_REQUEST).send(apartment);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).send(e.message);
    }
  }
}
