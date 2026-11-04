import errors from "../utils/errors.js";

const { validationError } = errors;

export default (validator) => (req, res, next) => {
  const errors = validator(req.body || {});
  if (Object.keys(errors).length) {
    return next(validationError(errors));
  }
  return next();
};
