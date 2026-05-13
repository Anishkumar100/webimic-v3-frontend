// Generic Zod validation middleware factory
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    console.log('[Validate] Body validation failed:', result.error.issues);
    const errors = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }
  console.log('[Validate] Body validation passed');
  req.validated = result.data;
  next();
};

// Query param validation
export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    console.log('[Validate] Query validation failed:', result.error.issues);
    const errors = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    return res.status(400).json({ error: 'Invalid query parameters', details: errors });
  }
  console.log('[Validate] Query validation passed');
  req.validatedQuery = result.data;
  next();
};
