import Joi from 'joi';
import { Gender } from '@prisma/client';

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
      birthDate: Joi.date().allow(null)
      .custom((value, helpers) => {
        if (!value) return value;
        
        // Parse the birthdate
        const birthDate = new Date(value);
        
        // Get current UTC date and time
        const utcNow = new Date();
        
        // For the most conservative approach, we check against UTC-12
        // which is 12 hours behind UTC
        const conservativeDate = new Date(utcNow);
        conservativeDate.setHours(utcNow.getHours() - 12);
        
        // Extract just the date components for clean comparison
        const birthYear = birthDate.getUTCFullYear();
        const birthMonth = birthDate.getUTCMonth();
        const birthDay = birthDate.getUTCDate();
        
        const conservativeYear = conservativeDate.getUTCFullYear();
        const conservativeMonth = conservativeDate.getUTCMonth();
        const conservativeDay = conservativeDate.getUTCDate();
        
        // Calculate age (whole years only)
        let age = conservativeYear - birthYear;
        
        // Adjust age if birthday hasn't occurred yet this year in conservative timezone
        if (
          conservativeMonth < birthMonth || 
          (conservativeMonth === birthMonth && conservativeDay < birthDay)
        ) {
          age--;
        }

        // STRICT RULE: Must be 18 or older in the most conservative timezone UTC-12
        if (age < 18) {
          return helpers.message({ custom: 'You must be at least 18 years old to use this service' });
        }
        
        return value;
      }, 'age validation'),
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

  const result = schema.validate(data);

  if (result.error) {
    return {
      success: false,
      message: result.error.details[0].message
    };
  }
  
  return {
    success: true,
    message: 'Valid data'
  };
};