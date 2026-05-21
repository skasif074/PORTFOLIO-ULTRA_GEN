export const errorHandler = (err, req, res, next) => {
  console.error('🔥 Error:', err);

  // Supabase errors
  if (err.code && err.message) {
    return res.status(400).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    const messages = {
      LIMIT_FILE_SIZE: 'File is too large',
      LIMIT_FILE_COUNT: 'Too many files',
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
    };
    return res.status(400).json({
      success: false,
      message: messages[err.code] || 'File upload error',
    });
  }

  // Clerk auth errors
  if (err.status === 401 || err.message?.includes('Unauthorized')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};
