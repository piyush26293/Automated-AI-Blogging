const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let status = err.status || 500;
  let message = err.message || 'Internal server error';

  // Specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized';
  } else if (err.code === '23505') {
    // PostgreSQL unique violation
    status = 409;
    message = 'Resource already exists';
  } else if (err.code === '23503') {
    // PostgreSQL foreign key violation
    status = 400;
    message = 'Invalid reference';
  }

  // Don't leak error details in production
  const response = {
    error: message,
  };

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = err;
  }

  res.status(status).json(response);
};

const notFoundHandler = (req, res) => {
  res.status(404).json({ error: 'Route not found' });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
