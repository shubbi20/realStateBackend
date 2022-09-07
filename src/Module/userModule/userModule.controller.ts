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
import { UserService } from './userModule.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}
}
