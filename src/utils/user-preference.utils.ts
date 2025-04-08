import Joi from 'joi';
type UserPreferenceType = {
  minAge?: number | null;
  maxAge?: number | null;
}

export function isValidUserPreference(data: UserPreferenceType) {
  let schema = Joi.object({
    minAge: Joi.number().min(18).messages({
      'number.base': 'Minimum age must be a number',
      'number.min': 'Minimum age must be at least 18'
    }).allow(null).optional(),
    
    maxAge: Joi.number().min(18).max(100).messages({
      'number.base': 'Maximum age must be a number',
      'number.min': 'Maximum age must be at least 18',
      'number.max': 'Maximum age must be less than or equal to 100'
    }).allow(null).optional(),

    distanceRadius: Joi.number().min(0).max(1000).messages({
      'number.base': 'Distance radius must be a number',
      'number.min': 'Distance radius must be at least 0',
      'number.max': 'Distance radius must be less than or equal to 1000'
    }).allow(null).optional(),
    
  }).unknown(false);
  
  // Add conditional validation for maxAge when minAge is present
  schema = schema.when('.minAge', {
    is: Joi.number().required(),
    then: Joi.object({
      maxAge: Joi.number().greater(Joi.ref('minAge')).message('Maximum age must be greater than minimum age')
    })
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
    message: "Valid user preference"
  };
}