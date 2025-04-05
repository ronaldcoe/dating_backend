type UserPreferenceType = {
  minAge?: number | null;
  maxAge?: number | null;
}

export function isValidUserPreference(data:UserPreferenceType) {

  if (data.minAge !== undefined && data.minAge !== null) {
    const minAge = data.minAge;
    
    if (typeof minAge !== 'number') {
      return {
        success: false,
        message: "Minimum age must be a number"
      };
    }
    
    if (minAge < 18) {
      return {
        success: false,
        message: "Minimum age must be at least 18"
      };
    }
  }

  if (data.maxAge !== undefined && data.maxAge !== null) {
    const maxAge = data.maxAge;
    
    if (typeof maxAge !== 'number') {
      return {
        success: false,
        message: "Maximum age must be a number"
      };
    }

    if (maxAge < data.minAge) {
      return {
        success: false,
        message: "Maximum age must be greater than minimum age"
      };
    }

    if (maxAge > 100) {
      return {
        success: false,
        message: "Maximum age must be less than or equal to 100"
      };
    }

    if (maxAge < 18) {
      return {
        success: false,
        message: "Maximum age must be at least 18"
      };
    }
  }

  return {
    success: true,
    message: "Valid user preference"
  }
}