import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApartmentController } from './Module/apartmentModule/apartmentModule.controller';
import { ApartmentService } from './Module/apartmentModule/apartmentModule.service';
import { UserController } from './Module/userModule/userModule.controller';
import { UserService } from './Module/userModule/userModule.service';
import { UserSignController } from './Module/userSignModule/userSign.controller';
import { UserSignService } from './Module/userSignModule/userSign.service';

const PATH = __dirname + '/db/entities/*.entity{.ts,.js}';

export const sqliteDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.db',
  entities: [PATH],
  synchronize: true,
});

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.db',
      entities: [PATH],
      synchronize: true,
    }),
  ],
  controllers: [
    AppController,
    UserSignController,
    UserController,
    ApartmentController,
  ],
  providers: [AppService, UserSignService, UserService, ApartmentService],
})
export class AppModule {}
