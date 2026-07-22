const notFound = (req, res, next) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
};

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
};

export { notFound, errorHandler };
