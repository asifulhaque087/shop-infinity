export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this);
  }
}

// ** --- Not Found Error ---

export class NotFoundError extends AppError {
  constructor(message = "Resource not foud") {
    super(message, 404);
  }
}

// ** --- Validation Error ---

export class ValidationError extends AppError {
  constructor(message: string = "Invalid request data", details?: any) {
    super(message, 400, true, details);
  }
}

// ** --- Authentication Error ---

export class AuthError extends AppError {
  constructor(message = "unautorizes") {
    super(message, 4001);
  }
}

// ** --- Forbidden Error ---

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden access") {
    super(message, 403);
  }
}

// ** --- Database Error ---

export class DatabaseError extends AppError {
  constructor(message = "Database error", details?: any) {
    super(message, 500, true, details);
  }
}

// ** -- Rate limit error ---

export class RateLimitError extends AppError {
  constructor(message = "Too many requests, please try again later!") {
    super(message, 429);
  }
}
