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

/**
 * Validate profile update data
 */
export const validateProfileUpdate = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(50)
      .messages({
        'string.min': 'Name should be at least 2 characters',
        'string.max': 'Name should not exceed 50 characters',
      }),
    birthDate: Joi.date().iso().allow(null)
      .messages({
        'date.base': 'Birth date must be a valid date',
      }),
    gender: Joi.string().valid(...Object.values(Gender)).allow(null)
      .messages({
        'any.only': 'Gender must be either MALE or FEMALE',
      }),
    bio: Joi.string().trim().max(500).allow(null)
      .messages({
        'string.max': 'Bio should not exceed 500 characters',
      }),
    locationLat: Joi.number().min(-90).max(90).allow(null)
      .messages({
        'number.base': 'Location latitude must be a number',
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90',
      }),
    locationLng: Joi.number().min(-180).max(180).allow(null)
      .messages({
        'number.base': 'Location longitude must be a number',
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180',
      }),
  });

  return schema.validate(data);
};
