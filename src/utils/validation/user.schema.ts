import { UnauthorizedException } from '@nestjs/common';
import * as Joi from 'joi';

export const pageSchema = Joi.object()
  .options({ abortEarly: false })
  .keys({
    page: Joi.number().min(1).required(),
  })
  .unknown();

export const createSchema = Joi.object()
  .options({ abortEarly: false })
  .keys({
    role: Joi.string().valid('regular', 'manager', 'admin').required(),
    userId: Joi.string().trim().min(7).max(24).required(),
    password: Joi.string().trim().min(5).max(24).required(),
  })
  .unknown();

export const createValidation = ({
  role,
  userId,
  password,
}: {
  role: string;
  userId: string;
  password: string;
}) => {
  const { value, error } = createSchema.validate({
    role: role,
    userId: userId,
    password: password,
  });

  if (error) {
    throw new UnauthorizedException(error.message);
  } else {
    return { role: value.role, userId: value.userId, password: value.password };
  }
};

export const pageValidation = (page: number) => {
  const { value, error } = pageSchema.validate({ page });

  if (error) {
    throw new UnauthorizedException(error);
  } else {
    return value.page;
  }
};
