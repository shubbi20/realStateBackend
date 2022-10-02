import { UnauthorizedException } from '@nestjs/common';
import * as Joi from 'joi';

export const createSchema = Joi.object()
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

export const getSchema = Joi.object()
  .options({ abortEarly: false })
  .keys({
    monthlyRental: Joi.number().integer().min(0),
    area: Joi.number().integer().min(0),
    rooms: Joi.number().integer().min(0),
    floors: Joi.number().integer().min(0),
  })
  .unknown();

export const updateSchema = Joi.object()
  .options({ abortEarly: false })
  .keys({
    monthlyRental: Joi.number().integer().min(0).required(),
    area: Joi.number().integer().min(0).required(),
    rooms: Joi.number().integer().min(0).required(),
    floors: Joi.number().integer().min(0).required(),
    isAvailable: Joi.boolean().optional(),
  })
  .unknown();

export const updateValidation = ({
  monthlyRental,
  area,
  rooms,
  floors,
  isAvailable,
}: {
  monthlyRental?: number;
  area?: number;
  rooms?: number;
  floors?: number;
  isAvailable?: boolean;
}) => {
  const { value, error } = updateSchema.validate({
    monthlyRental,
    area,
    rooms,
    floors,
    isAvailable,
  });

  if (error) {
    throw new UnauthorizedException(error.message);
  } else {
    return {
      monthlyRental: value.monthlyRental,
      area: value.area,
      rooms: value.rooms,
      floors: value.floors,
      isAvailable: value.isAvailable,
    };
  }
};

export const getValidation = ({
  monthlyRental,
  area,
  rooms,
  floors,
}: {
  monthlyRental?: number;
  area?: number;
  rooms?: number;
  floors?: number;
}) => {
  const { value, error } = getSchema.validate({
    monthlyRental,
    area,
    rooms,
    floors,
  });

  if (error) {
    throw new UnauthorizedException(error.message);
  } else {
    console.log('value', value);
    return {
      monthlyRental: value.monthlyRental,
      area: value.area,
      rooms: value.rooms,
      floors: value.floors,
    };
  }
};

export const createValidation = ({
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
}) => {
  const { value, error } = createSchema.validate({
    address,
    monthlyRental,
    area,
    rooms,
    floors,
    isAvailable,
    roomLatitude,
    roomLongitude,
  });

  if (error) {
    throw new UnauthorizedException(error.message);
  } else {
    return {
      address: value.address,
      monthlyRental: value.monthlyRental,
      area: value.area,
      rooms: value.rooms,
      floors: value.floors,
      isAvailable: value.isAvailable,
      roomLatitude: value.roomLatitude,
      roomLongitude: value.roomLongitude,
    };
  }
};
