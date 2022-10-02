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
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from 'src/utils/guard/auth.guard';
import { ERole, UserService } from './user.service';
import { Auth, IAuth } from 'src/utils/auth.decorator';
import { RoleGuard } from 'src/utils/guard/role.guard';
import {
  createValidation,
  loginValidation,
  signupValidation,
  updateValidation,
} from 'src/utils/validation/user.schema';

@Controller('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Get()
  @RoleGuard(ERole.z)
  async getUsers(@Query('page') page: number = 1) {
    return this.userService.getAllUsers(page);
  }

  @UseGuards(AuthGuard)
  @Delete('/:id')
  @RoleGuard(ERole.z)
  async deleteUser(
    @Param('id', new ParseIntPipe()) id,
    @Auth() authUser: IAuth,
  ) {
    return this.userService.deleteUser(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  @RoleGuard(ERole.z)
  async createUser(
    @Auth() authUser: IAuth,
    @Body()
    {
      role,
      userId,
      password,
    }: { role: string; userId: string; password: string },
  ) {
    const valid = createValidation({ role, userId, password });
    return this.userService.createUser({
      role: valid.role,
      userId: valid.userId.trim().toLowerCase(),
      password: valid.password.trim(),
    });
  }

  @UseGuards(AuthGuard)
  @Patch('/:id')
  @RoleGuard(ERole.z)
  async updateUser(
    @Param('id', new ParseIntPipe()) id,
    @Body() { role, userId }: { role: string; userId: string },
  ) {
    const valid = updateValidation({ role, userId });
    return this.userService.updateUserForSpecificId({
      id,
      role: valid.role,
      userId: valid.userId,
    });
  }

  @Post('/signup')
  async userSignUp(
    @Body('userId') userId: string,
    @Body('password') password: string,
  ) {
    const valid = signupValidation({ userId, password });
    return this.userService.signUpUser({
      userId: valid.userId.trim().toLowerCase(),
      password: valid.password,
    });
  }

  @Post('/login')
  @HttpCode(200)
  async login(
    @Body('userId') userId: string,
    @Body('password') password: string,
  ) {
    const valid = loginValidation({ userId, password });

    return this.userService.loginUser(
      valid.userId.trim().toLowerCase(),
      valid.password.trim(),
    );
  }
}
