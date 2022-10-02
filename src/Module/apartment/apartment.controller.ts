import {
  Body,
  Controller,
  Post,
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
import { ApartmentService } from './apartment.service';
import { RoleGuard } from 'src/utils/guard/role.guard';
import { ERole } from '../user/user.service';
import {
  createValidation,
  getValidation,
  updateValidation,
} from 'src/utils/validation/apartment.schema';

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
  @RoleGuard(ERole.y, ERole.z) // include those who have the access
  async createApartment(
    @Auth() authUser: IAuth,
    @Body()
    {
      address,
      monthlyRental,
      area,
      rooms,
      floors,
      isAvailable,
      roomLatitude,
      roomLongitude,
    }: {
      address: string;
      monthlyRental: number;
      area: number;
      rooms: number;
      floors: number;
      isAvailable: boolean;
      roomLatitude: number;
      roomLongitude: number;
    },
  ) {
    const valid = createValidation({
      address,
      monthlyRental,
      area,
      rooms,
      floors,
      isAvailable,
      roomLatitude,
      roomLongitude,
    });
    return this.apartmentService.createApartment({
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
  }

  @Get()
  async getapartment(
    @Query()
    {
      page = 1,
      monthlyRental,
      floors,
      rooms,
      area,
    }: {
      page: number;
      monthlyRental: number;
      floors: number;
      rooms: number;
      area: number;
    },
    @Auth() authUser: IAuth,
  ) {
    const valid = getValidation({
      monthlyRental,
      floors,
      rooms,
      area,
    });

    return this.apartmentService.filterApartment({
      page,
      monthlyRental: valid.monthlyRental,
      area: valid.area,
      floors: valid.floors,
      rooms: valid.rooms,
      role: authUser.role,
      userid: authUser.id,
    });
  }

  @Delete('/:id')
  @RoleGuard(ERole.y, ERole.z)
  async deleteApartment(
    @Auth() authUser: IAuth,
    @Param('id', new ParseIntPipe()) id,
  ) {
    return this.apartmentService.deleteApartment(
      id,
      authUser.id,
      authUser.role,
    );
  }

  @Patch('/:id')
  @RoleGuard(ERole.y, ERole.z)
  async updateApartment(
    @Auth() authUser: IAuth,
    @Param('id', new ParseIntPipe()) id,
    @Body()
    {
      monthlyRental,
      area,
      rooms,
      floors,
      isAvailable,
    }: {
      monthlyRental: number;
      area: number;
      rooms: number;
      floors: number;
      isAvailable: boolean;
    },
  ) {
    const valid = updateValidation({
      monthlyRental,
      area,
      rooms,
      floors,
      isAvailable,
    });

    return this.apartmentService.updateApartment({
      id,
      monthlyRental: valid.monthlyRental,
      area: valid.area,
      rooms: valid.rooms,
      floors: valid.floors,
      isAvailable: valid.isAvailable,
      role: authUser.role,
      userId: authUser.id,
    });
  }

  @Get('/userApartment')
  @RoleGuard(ERole.y)
  async onlyApartment(
    @Query('page') page: number = 1,
    @Auth() authUser: IAuth,
  ) {
    return this.apartmentService.onlyApartment({
      page,
      userId: authUser.id,
    });
  }
}
