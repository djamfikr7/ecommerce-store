/**
 * Authentication Error Classes
 * Custom error classes for auth-related operations
 */

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class UserNotFoundError extends AuthError {
  constructor(userId?: string, email?: string) {
    const identifier = userId || email || 'Unknown';
    super(
      `User not found: ${identifier}`,
      'USER_NOT_FOUND',
      404
    );
    this.name = 'UserNotFoundError';
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super(
      'Invalid email or password',
      'INVALID_CREDENTIALS',
      401
    );
    this.name = 'InvalidCredentialsError';
  }
}

export class EmailExistsError extends AuthError {
  constructor(email: string) {
    super(
      `An account with email ${email} already exists`,
      'EMAIL_EXISTS',
      409
    );
    this.name = 'EmailExistsError';
  }
}

export class AccountAlreadyLinkedError extends AuthError {
  constructor(provider: string) {
    super(
      `This ${provider} account is already linked to another user`,
      'ACCOUNT_ALREADY_LINKED',
      409
    );
    this.name = 'AccountAlreadyLinkedError';
  }
}

export class SessionExpiredError extends AuthError {
  constructor() {
    super(
      'Your session has expired. Please log in again.',
      'SESSION_EXPIRED',
      401
    );
    this.name = 'SessionExpiredError';
  }
}

export class UnauthorizedError extends AuthError {
  constructor(action: string = 'perform this action') {
    super(
      `You are not authorized to ${action}`,
      'UNAUTHORIZED',
      403
    );
    this.name = 'UnauthorizedError';
  }
}

export class ValidationError extends AuthError {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}
