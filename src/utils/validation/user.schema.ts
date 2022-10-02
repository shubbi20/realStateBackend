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

const signUpSchema = Joi.object()
  .options({ abortEarly: false })
  .keys({
    userId: Joi.string().trim().min(7).max(24).required(),
    password: Joi.string().trim().min(5).max(24).required(),
  })
  .unknown();

export const updateSchema = Joi.object()
  .options({ abortEarly: false })
  .keys({
    role: Joi.string().valid('regular', 'manager', 'admin').optional(),
    userId: Joi.string().trim().min(7).max(24).optional(),
  })
  .unknown();

const loginSchema = Joi.object()
  .options({ abortEarly: false })
  .keys({
    userId: Joi.string().trim().min(7).max(24).required(),
    password: Joi.string().trim().min(5).max(24).required(),
  })
  .unknown();

export const signupValidation = ({
  userId,
  password,
}: {
  userId: string;
  password: string;
}) => {
  const { value, error } = signUpSchema.validate({ userId, password });
  if (error) {
    throw new UnauthorizedException(error.message);
  } else {
    return {
      userId: value.userId,
      password: value.password,
    };
  }
};

export const loginValidation = ({
  userId,
  password,
}: {
  userId: string;
  password: string;
}) => {
  const { value, error } = loginSchema.validate({ userId, password });
  if (error) {
    throw new UnauthorizedException(error.message);
  } else {
    return {
      userId: value.userId,
      password: value.password,
    };
  }
};

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

export const updateValidation = ({
  role,
  userId,
}: {
  role: string;
  userId: string;
}) => {
  const { value, error } = updateSchema.validate({
    role: role,
    userId: userId,
  });

  if (error) {
    throw new UnauthorizedException(error.message);
  } else {
    return {
      role: value.role,
      userId: value.userId,
    };
  }
};
