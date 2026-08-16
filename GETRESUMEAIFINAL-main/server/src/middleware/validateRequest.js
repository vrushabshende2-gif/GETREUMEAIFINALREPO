const validateRequest = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return res.status(400).json({
        message: 'Validation failed',
        errors: messages,
      });
    }
    next(error);
  }
};

module.exports = { validateRequest };
