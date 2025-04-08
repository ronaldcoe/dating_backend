import Joi from 'joi';
import { Gender } from '@prisma/client';

/**
 * Validate user registration data
 */
export const validateRegistration = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required()
      .messages({
        'string.empty': 'Name is required',
        'string.min': 'Name should be at least 2 characters',
        'string.max': 'Name should not exceed 50 characters',
      }),
    email: Joi.string().trim().email().required()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email',
      }),
    password: Joi.string().min(6).required()
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password should be at least 6 characters',
      }),
    birthDate: Joi.date().iso().allow(null),
    gender: Joi.string().valid(...Object.values(Gender)).allow(null),
  });

  return schema.validate(data);
};

/**
 * Validate user login data
 */
export const validateLogin = (data: any) => {
  const schema = Joi.object({
    email: Joi.string().trim().email().required()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email',
      }),
    password: Joi.string().required()
      .messages({
        'string.empty': 'Password is required',
      }),
  });

  return schema.validate(data);
};