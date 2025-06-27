const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // 默认错误响应
  let status = 500;
  let message = 'Internal Server Error';

  // 根据错误类型设置响应
  if (err.name === 'ValidationError') {
    status = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized';
  } else if (err.status) {
    status = err.status;
    message = err.message;
  }

  res.status(status).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

module.exports = { errorHandler };
