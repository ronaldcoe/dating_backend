export class AppError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AppError'
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class PermissionError extends AppError {
  constructor(message: string) {
    super(message)
    this.name = 'PermissionError'
    Object.setPrototypeOf(this, PermissionError.prototype);
  }
}