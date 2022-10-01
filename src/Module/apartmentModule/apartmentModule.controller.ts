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
import { Auth, IAuth } from 'src/utils/auth.decorator';
import { Response } from 'express';
import * as Joi from 'joi';
import { ApartmentService } from './apartmentModule.service';
import { RoleGuard } from 'src/utils/guard/role.guard';
import { ERole } from '../userModule/user.service';

/**
 * Validation
 * 1> take care of Erole
 * 2> remove the dead code
 * 3> remove res
 * 4> make separate file for schema
 * 4> follow dry concept everyWhere
 * 5>
 */

@UseGuards(AuthGuard)
@Controller('apartment')
export class ApartmentController {
  constructor(private readonly apartmentService: ApartmentService) {}

  @Post()
  @RoleGuard(ERole.y || ERole.z) // include those who have the access
  async createApartment(
    @Res({ passthrough: true }) res: Response,
    @Auth() authUser: IAuth,
    @Body()
    { email, password }: { email: string; password: string },
    @Body('address') address: string,
    @Body('monthlyRental') monthlyRental: number,
    @Body('area') area: number,
    @Body('rooms') rooms: number,
    @Body('floors') floors: number,
    @Body('isAvailable') isAvailable: boolean,
    @Body('roomLatitude') roomLatitude: number,
    @Body('roomLongitude') roomLongitude: number,
    // @Body('userId') userId: number,
  ) {
    try {
      // if (authUser.role === 'regular') {
      //   return res.status(HttpStatus.FORBIDDEN).send({
      //     error: 'Regular user dont have permission to add Apartment',
      //   });
      // }

      const schema = Joi.object()
        .options({ abortEarly: false })
        .keys({
          address: Joi.string().trim().min(3).max(45).required(),
          monthlyRental: Joi.number().integer().min(0).required(),
          area: Joi.number().min(0).integer().required(),
          rooms: Joi.number().min(0).integer().required(),
          floors: Joi.number().min(0).integer().required(),
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
          .status(HttpStatus.UNAUTHORIZED)
          .send({ error: valid.error.message });
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
        userId: authUser.id,
      });

      if ('msg' in apartment) {
        return apartment;
      }

      return res
        .status(apartment.getStatus())
        .send({ error: apartment.message });
    } catch (e) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(e.message);
    }
  }

  // @Get('apartments')
  // async getApartment(
  //   @Res({ passthrough: true }) res: Response,
  //   @Query('page') page: number = 1,
  //   @Auth() authUser: IAuth,
  // ) {
  //   try {
  //     const schema = Joi.object()
  //       .options({ abortEarly: false })
  //       .keys({
  //         page: Joi.number().min(1).required(),
  //       })
  //       .unknown();

  //     const valid = schema.validate({
  //       page,
  //     });

  //     if (valid.error) {
  //       return res
  //         .status(HttpStatus.UNAUTHORIZED)
  //         .send({ error: valid.error.message });
  //     }
  //     const apartments = await this.apartmentService.getApartments(page);
  //     if ('msg' in apartments) {
  //       return apartments;
  //     }

  //     return res.status(HttpStatus.BAD_REQUEST).send(apartments);
  //   } catch (e) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(e.message);
  //   }
  // }

  @Get()
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
          monthlyRental: Joi.number().integer().min(0),
          area: Joi.number().integer().min(0),
          rooms: Joi.number().integer().min(0),
          floors: Joi.number().integer().min(0),
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
          .status(HttpStatus.UNAUTHORIZED)
          .send({ error: valid.error.message });
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

      return res
        .status(apartments.getStatus())
        .send({ error: apartments.message });
    } catch (e) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(e.message);
    }
  }

  @Delete('/:id')
  @RoleGuard(ERole.y || ERole.z)
  async deleteApartment(
    @Res({ passthrough: true }) res: Response,
    @Auth() authUser: IAuth,
    @Param('id', new ParseIntPipe()) id,
  ) {
    // if (authUser.role === 'regular') {
    //   return res
    //     .status(HttpStatus.FORBIDDEN)
    //     .send({ error: 'Regular user dont have permission to delete' });
    // }

    // const apartment = await this.apartmentService.deleteApartment(
    //   id,
    //   authUser.id,
    //   authUser.role,
    // );

    return this.apartmentService.deleteApartment(
      id,
      authUser.id,
      authUser.role,
    );

    // if ('msg' in apartment) {
    //   return apartment;
    // }
    // return res
    //   .status(apartment.getStatus())
    //   .send({ error: apartment.message });
  }

  @Patch('/:id')
  @RoleGuard(ERole.y || ERole.z)
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
      // if (authUser.role === 'regular') {
      //   return res
      //     .status(HttpStatus.FORBIDDEN)
      //     .send({ error: 'Regular user dont have permission to update' });
      // }

      const schema = Joi.object()
        .options({ abortEarly: false })
        .keys({
          monthlyRental: Joi.number().integer().min(0).required(),
          area: Joi.number().integer().min(0).required(),
          rooms: Joi.number().integer().min(0).required(),
          floors: Joi.number().integer().min(0).required(),
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
          .status(HttpStatus.UNAUTHORIZED)
          .send({ error: valid.error.message });
      }

      const apartment = await this.apartmentService.updateApartment({
        id,
        monthlyRental,
        area,
        rooms,
        floors,
        isAvailable,
        role: authUser.role,
        userId: authUser.id,
      });

      if ('msg' in apartment) {
        return apartment;
      }

      return res
        .status(apartment.getStatus())
        .send({ error: apartment.message });
    } catch (e) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(e.message);
    }
  }

  @Get('/userApartment')
  @RoleGuard(ERole.y)
  async onlyApartment(
    @Res({ passthrough: true }) res: Response,
    @Query('page') page: number = 1,
    @Auth() authUser: IAuth,
  ) {
    try {
      const apartment = await this.apartmentService.onlyApartment({
        page,
        userId: authUser.id,
      });

      if ('msg' in apartment) {
        return apartment;
      }

      return res
        .status(apartment.getStatus())
        .send({ error: apartment.message });
    } catch (e) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(e.message);
    }
  }
}
